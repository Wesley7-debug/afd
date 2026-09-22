import * as cheerio from "cheerio";
import { detectFoundersOnPage } from "../crawler/detector";

function run(name: string, html: string, url: string, sourceName: string) {
  const $ = cheerio.load(html);
  let result: ReturnType<typeof detectFoundersOnPage> | null = null;
  let error: string | null = null;
  try {
    result = detectFoundersOnPage($, html, url, { sourceName });
  } catch (e) {
    error = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
  }
  console.log(`\n=== ${name} ===`);
  if (error) {
    console.log("ERROR:", error);
    return;
  }
  console.log(
    JSON.stringify(
      {
        founders: result!.founders.map((f) => ({
          name: f.name,
          company: f.company,
          xUrl: f.xUrl || null,
          email: f.email || null,
          sourceSentence: f.sourceSentence,
        })),
        hiring: result!.hiring,
        hiringEvidence: result!.hiringEvidence,
        hiringCompanyHint: result!.hiringCompanyHint,
        rejectionLog: result!.rejectionLog,
      },
      null,
      2
    )
  );
}

run(
  "roundup: person + unrelated companies must NOT link",
  `<html><head><title>10 African startups to watch</title></head><body>
    <h1>10 African startups to watch</h1>
    <p>James Hedley visited Lagos this week.</p>
    <ul>
      <li><a href="/s/kipa">Kipa</a></li>
      <li><a href="/s/ndalo">Ndalo</a></li>
      <li><a href="/s/zuri">Zuri</a></li>
      <li><a href="/s/habari">Habari</a></li>
      <li><a href="/s/tema">Tema</a></li>
    </ul>
  </body></html>`,
  "https://startuplist.africa/watchlist",
  "Startup List Africa"
);

run(
  "explicit founder sentence + footer handle must not attach",
  `<html><head><title>Kipa raises $2M</title><meta property="og:site_name" content="TechCabal"></head><body>
    <article>
      <p>Ada Obi is the co-founder of Kipa, a Lagos-based logistics startup.</p>
    </article>
    <footer><a href="https://x.com/startuplistafrica">Follow us @startuplistafrica</a></footer>
  </body></html>`,
  "https://techcabal.com/2025/01/kipa-raises/",
  "TechCabal"
);

run(
  "team card on company site with we're hiring",
  `<html><head><title>About Kipa</title><meta property="og:site_name" content="Kipa"></head><body>
    <h1>We're hiring</h1>
    <div class="team-member">
      <h3>Ada Obi</h3>
      <p>Co-founder &amp; CEO</p>
      <a href="https://x.com/adaobi">X</a>
      <a href="mailto:ada@kipa.africa">email</a>
    </div>
    <a href="/jobs/backend-engineer">Backend Engineer</a>
  </body></html>`,
  "https://kipa.africa/about",
  "Kipa"
);

run(
  "hiring plan in funding article",
  `<html><head><title>Flutterwave raises $80M</title></head><body>
    <h1>Flutterwave raises $80M Series D</h1>
    <p>Olugbenga Agboola, co-founder and CEO of Flutterwave, said the company will use funds to hire 20 engineers.</p>
  </body></html>`,
  "https://techcabal.com/2025/02/flutterwave-raises/",
  "TechCabal"
);

run(
  "no hiring evidence -> null",
  `<html><head><title>Kipa profile</title><meta property="og:site_name" content="Kipa"></head><body>
    <div class="team-member"><h3>Ada Obi</h3><p>Founder</p></div>
  </body></html>`,
  "https://kipa.africa/team",
  "Kipa"
);
