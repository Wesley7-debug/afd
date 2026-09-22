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

  // 12. Sources
  console.log('\n--- /api/sources ---');
  const src = await get('/api/sources');
  assert('GET /api/sources returns 200', src.status === 200);
  assert('Has sources array', Array.isArray(src.body));
  assert('Sources count = 7', src.body.length === 7);
  console.log(`  Sources: ${src.body.length}`);

  // 13. Crawler jobs
  console.log('\n--- /api/crawler/jobs ---');
  const jobs = await get('/api/crawler/jobs');
  assert('GET /api/crawler/jobs returns 200', jobs.status === 200);
  assert('Has jobs array', Array.isArray(jobs.body.jobs));
  console.log(`  Jobs: ${jobs.body.jobs.length}`);

  // 14. Search endpoint
  console.log('\n--- /api/search ---');
  const s = await get('/api/search?q=nigeria');
  assert('GET /api/search returns 200', s.status === 200);
  assert('Search has founders', Array.isArray(s.body.founders));
  console.log(`  Search "nigeria": ${s.body.founders.length} founders`);

  // 15. Combined filters
  console.log('\n--- Combined filters ---');
  const combined = await get('/api/founders?search=&industry=&location=&hasX=true&sort=newest&page=1&limit=10');
  assert('Combined filters returns 200', combined.status === 200);
  assert('Combined has results type', Array.isArray(combined.body.founders));

  // 16. Pages rendering
  console.log('\n--- Frontend pages ---');
  const home = await get('/');
  assert('Home page returns 200', home.status === 200);
  const comp = await get('/companies');
  assert('Companies page removed (404)', comp.status === 404);
  const fProf = await get(`/founders/${f1.body.founders[0]?.slug || 'test'}`);
  assert('Founder profile returns 200 or 404', fProf.status === 200 || fProf.status === 404);

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
  console.log(`${'='.repeat(40)}\n`);
}

test().catch(err => { console.error('Test runner error:', err); process.exit(1); });
