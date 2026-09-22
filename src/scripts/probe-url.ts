import mongoose from "mongoose";
import * as cheerio from "cheerio";
import { detectFoundersOnPage } from "../crawler/detector";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      accept: "text/html",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;

  const urls = await db
    .collection("crawlurlqueues")
    .aggregate([
      { $match: { status: "completed" } },
      { $sample: { size: 3 } },
      { $project: { url: 1, _id: 0 } },
    ])
    .toArray();

  const teamish = await db
    .collection("crawlurlqueues")
    .find({ url: /\/(about|team|people|leadership|founders)(\/|$|\?)/i }, { projection: { url: 1, status: 1, _id: 0 } })
    .limit(5)
    .toArray();
  console.log("team-ish urls in queue:", JSON.stringify(teamish));

  for (const row of urls) {
    const url = row.url as string;
    console.log(`\n### ${url}`);
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      const r = detectFoundersOnPage($, html, url, { sourceName: "probe" });
      console.log("founders:", r.founders.length, "| hiring:", r.hiring, "| hint:", r.hiringCompanyHint || "-");
      for (const f of r.founders.slice(0, 5)) {
        console.log(`  - ${f.name} | co=${f.company || "-"} | x=${f.xUrl || "-"} | li=${f.linkedinUrl || "-"} | email=${f.email || "-"}`);
        console.log(`    ${(f.sourceSentence || "").slice(0, 100)}`);
      }
      if (r.rejectionLog.length) console.log("rejections:", r.rejectionLog.slice(0, 5));
    } catch (e) {
      console.log("fetch/detect error:", e instanceof Error ? e.message : e);
    }
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
