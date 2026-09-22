// Test script - run with: node test-api.cjs
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

function post(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

let pass = 0, fail = 0;
function assert(label, condition) {
  if (condition) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}`); }
}

async function test() {
  console.log('\n=== API ROUTE TESTS ===\n');

  // 1. Stats
  console.log('--- /api/stats ---');
  const stats = await get('/api/stats');
  assert('GET /api/stats returns 200', stats.status === 200);
  assert('Has totalFounders', typeof stats.body.totalFounders === 'number');
  assert('Has totalCompanies', typeof stats.body.totalCompanies === 'number');
  assert('Has totalSources', typeof stats.body.totalSources === 'number');
  assert('Founders > 0', stats.body.totalFounders > 0);
  assert('Companies > 0', stats.body.totalCompanies > 0);
  assert('Sources = 7', stats.body.totalSources === 7);
  console.log(`  Data: ${stats.body.totalFounders} founders, ${stats.body.totalCompanies} companies, ${stats.body.totalSources} sources\n`);

  // 2. Founders list
  console.log('--- /api/founders (basic) ---');
  const f1 = await get('/api/founders?limit=5');
  assert('GET /api/founders returns 200', f1.status === 200);
  assert('Has founders array', Array.isArray(f1.body.founders));
  assert('Has pagination', f1.body.pagination && typeof f1.body.pagination.total === 'number');
  assert('Returns max 5', f1.body.founders.length <= 5);
  assert('Pagination total matches', f1.body.pagination.total === stats.body.totalFounders);
  console.log(`  Founders returned: ${f1.body.founders.length}, total: ${f1.body.pagination.total}\n`);

  // 3. Founders search
  console.log('--- /api/founders?search=... ---');
  const fName = f1.body.founders[0]?.name || '';
  const searchPart = fName.split(' ')[0];
  const fSearch = await get(`/api/founders?search=${encodeURIComponent(searchPart)}`);
  assert('Search returns 200', fSearch.status === 200);
  assert('Search finds results', fSearch.body.founders.length > 0);
  console.log(`  Searched "${searchPart}", found ${fSearch.body.founders.length} results\n`);

  // 4. Founders by industry filter
  console.log('--- /api/founders?industry=... ---');
  const industries = [...new Set(f1.body.founders.map(f => f.industry).filter(Boolean))];
  if (industries.length > 0) {
    const fInd = await get(`/api/founders?industry=${encodeURIComponent(industries[0])}`);
    assert(`Industry filter "${industries[0]}" returns 200`, fInd.status === 200);
    assert('Industry filter has results', fInd.body.founders.length > 0);
    console.log(`  Filtered by "${industries[0]}", found ${fInd.body.founders.length}`);
  } else {
    console.log('  No industries found in data, skipping');
  }

  // 5. Founders by location filter
  console.log('\n--- /api/founders?location=... ---');
  const locations = [...new Set(f1.body.founders.map(f => f.location).filter(Boolean))];
  if (locations.length > 0) {
    const fLoc = await get(`/api/founders?location=${encodeURIComponent(locations[0])}`);
    assert(`Location filter "${locations[0]}" returns 200`, fLoc.status === 200);
    assert('Location filter has results', fLoc.body.founders.length > 0);
    console.log(`  Filtered by "${locations[0]}", found ${fLoc.body.founders.length}`);
  } else {
    console.log('  No locations found in data, skipping');
  }

  // 6. Founders by role filter
  console.log('\n--- /api/founders?role=... ---');
  const roles = [...new Set(f1.body.founders.map(f => f.role).filter(Boolean))];
  if (roles.length > 0) {
    const fRole = await get(`/api/founders?role=${encodeURIComponent(roles[0])}`);
    assert(`Role filter "${roles[0]}" returns 200`, fRole.status === 200);
    assert('Role filter has results', fRole.body.founders.length > 0);
    console.log(`  Filtered by "${roles[0]}", found ${fRole.body.founders.length}`);
  } else {
    console.log('  No roles found in data, skipping');
  }

  // 7. Founders hasX filter
  console.log('\n--- /api/founders?hasX=true ---');
  const fX = await get('/api/founders?hasX=true');
  assert('hasX filter returns 200', fX.status === 200);
  assert('hasX filter type is array', Array.isArray(fX.body.founders));
  console.log(`  Founders with X: ${fX.body.founders.length}`);

  // 8. Founders sort
  console.log('\n--- /api/founders?sort=... ---');
  const fSortName = await get('/api/founders?sort=name&limit=5');
  assert('Sort by name returns 200', fSortName.status === 200);
  const fSortNewest = await get('/api/founders?sort=newest&limit=5');
  assert('Sort by newest returns 200', fSortNewest.status === 200);
  const fSortIndustry = await get('/api/founders?sort=industry&limit=5');
  assert('Sort by industry returns 200', fSortIndustry.status === 200);

  // 9. Founders pagination
  console.log('\n--- /api/founders pagination ---');
  const fPage1 = await get('/api/founders?limit=3&page=1');
  const fPage2 = await get('/api/founders?limit=3&page=2');
  assert('Page 1 returns 200', fPage1.status === 200);
  assert('Page 2 returns 200', fPage2.status === 200);
  assert('Page 1 has data', fPage1.body.founders.length > 0);
  if (fPage2.body.founders.length > 0) {
    assert('Page 1 and 2 have different data', fPage1.body.founders[0]._id !== fPage2.body.founders[0]._id);
  }
  assert('Page 1 pagination.page = 1', fPage1.body.pagination.page === 1);
  assert('Page 2 pagination.page = 2', fPage2.body.pagination.page === 2);

  // 10. Single founder by slug
  console.log('\n--- /api/founders/:id (by slug) ---');
  const slug = f1.body.founders[0]?.slug;
  if (slug) {
    const fSingle = await get(`/api/founders/${slug}`);
    assert('Get by slug returns 200', fSingle.status === 200);
    assert('Founder has name', !!fSingle.body.name);
    assert('Founder slug matches', fSingle.body.slug === slug);
    console.log(`  Got founder: ${fSingle.body.name}`);
  }

  // 11. Single founder by ObjectId
  console.log('\n--- /api/founders/:id (by ObjectId) ---');
  const oid = f1.body.founders[0]?._id;
  if (oid) {
    const fOid = await get(`/api/founders/${oid}`);
    assert('Get by ObjectId returns 200', fOid.status === 200);
    assert('Founder _id matches', fOid.body._id === oid);
  }

  // 12. Companies list
  console.log('\n--- /api/companies (basic) ---');
  const c1 = await get('/api/companies?limit=5');
  assert('GET /api/companies returns 200', c1.status === 200);
  assert('Has companies array', Array.isArray(c1.body.companies));
  assert('Has pagination', c1.body.pagination && typeof c1.body.pagination.total === 'number');
  assert('Returns max 5', c1.body.companies.length <= 5);
  console.log(`  Companies returned: ${c1.body.companies.length}, total: ${c1.body.pagination.total}\n`);

  // 13. Company search
  console.log('--- /api/companies?search=... ---');
  const cName = c1.body.companies[0]?.name || '';
  const cSearchPart = cName.split(' ')[0];
  const cSearch = await get(`/api/companies?search=${encodeURIComponent(cSearchPart)}`);
  assert('Company search returns 200', cSearch.status === 200);
  assert('Company search finds results', cSearch.body.companies.length > 0);
  console.log(`  Searched "${cSearchPart}", found ${cSearch.body.companies.length} results\n`);

  // 14. Company industry filter
  console.log('--- /api/companies?industry=... ---');
  const cIndustries = [...new Set(c1.body.companies.map(c => c.industry).filter(Boolean))];
  if (cIndustries.length > 0) {
    const cInd = await get(`/api/companies?industry=${encodeURIComponent(cIndustries[0])}`);
    assert(`Company industry filter returns 200`, cInd.status === 200);
    assert('Company industry filter has results', cInd.body.companies.length > 0);
  } else {
    console.log('  No industries in company data, skipping');
  }

  // 15. Company sort
  console.log('\n--- /api/companies?sort=... ---');
  const cSortName = await get('/api/companies?sort=name&limit=5');
  assert('Company sort by name returns 200', cSortName.status === 200);
  const cSortNewest = await get('/api/companies?sort=newest&limit=5');
  assert('Company sort by newest returns 200', cSortNewest.status === 200);

  // 16. Single company by slug
  console.log('\n--- /api/companies/:id (by slug) ---');
  const cSlug = c1.body.companies[0]?.slug;
  if (cSlug) {
    const cSingle = await get(`/api/companies/${cSlug}`);
    assert('Company get by slug returns 200', cSingle.status === 200);
    assert('Company has name', !!cSingle.body.name);
    assert('Company slug matches', cSingle.body.slug === cSlug);
    console.log(`  Got company: ${cSingle.body.name}`);
  }

  // 17. Single company by ObjectId
  console.log('\n--- /api/companies/:id (by ObjectId) ---');
  const cOid = c1.body.companies[0]?._id;
  if (cOid) {
    const cOidRes = await get(`/api/companies/${cOid}`);
    assert('Company get by ObjectId returns 200', cOidRes.status === 200);
  }

  // 18. Sources
  console.log('\n--- /api/sources ---');
  const src = await get('/api/sources');
  assert('GET /api/sources returns 200', src.status === 200);
  assert('Has sources array', Array.isArray(src.body));
  assert('Sources count = 7', src.body.length === 7);
  console.log(`  Sources: ${src.body.length}`);

  // 19. Crawler jobs
  console.log('\n--- /api/crawler/jobs ---');
  const jobs = await get('/api/crawler/jobs');
  assert('GET /api/crawler/jobs returns 200', jobs.status === 200);
  assert('Has jobs array', Array.isArray(jobs.body.jobs));
  console.log(`  Jobs: ${jobs.body.jobs.length}`);

  // 20. Search endpoint
  console.log('\n--- /api/search ---');
  const s = await get('/api/search?q=nigeria');
  assert('GET /api/search returns 200', s.status === 200);
  assert('Search has founders', Array.isArray(s.body.founders));
  assert('Search has companies', Array.isArray(s.body.companies));
  console.log(`  Search "nigeria": ${s.body.founders.length} founders, ${s.body.companies.length} companies`);

  // 21. Combined filters
  console.log('\n--- Combined filters ---');
  const combined = await get('/api/founders?search=&industry=&location=&hasX=true&sort=newest&page=1&limit=10');
  assert('Combined filters returns 200', combined.status === 200);
  assert('Combined has results type', Array.isArray(combined.body.founders));

  // 22. Pages rendering
  console.log('\n--- Frontend pages ---');
  const home = await get('/');
  assert('Home page returns 200', home.status === 200);
  const comp = await get('/companies');
  assert('Companies page returns 200', comp.status === 200);
  const fProf = await get(`/founders/${f1.body.founders[0]?.slug || 'test'}`);
  assert('Founder profile returns 200 or 404', fProf.status === 200 || fProf.status === 404);

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
  console.log(`${'='.repeat(40)}\n`);
}

test().catch(err => { console.error('Test runner error:', err); process.exit(1); });
