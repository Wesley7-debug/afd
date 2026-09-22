import * as cheerio from "cheerio";

const url =
  "https://forbesafrica.com/current-affairs/2025/07/01/how-zimbabwes-richest-man-strive-masiyiwa-and-nvidias-first-ai-factory-in-africa-will-roll-out";

async function main() {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      accept: "text/html",
    },
    signal: AbortSignal.timeout(20000),
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const text = $("article").text() || $("body").text() || "";
  const sentences = text.split(/(?<=[.!?])\s+/);
  const hits = sentences.filter((s) => /co-?founder|\bfounder\b|\bfounded\b|\bCEO\b|brainchild/i.test(s));
  console.log("total sentences:", sentences.length, "| founder-ish hits:", hits.length);
  for (const s of hits.slice(0, 12)) console.log(" *", s.trim().slice(0, 220));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
