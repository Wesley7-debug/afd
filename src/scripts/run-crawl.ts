import { connectDB } from "../lib/mongodb";
import { runFullCrawl } from "../crawler/engine";

async function main() {
  console.log("Connecting to database...");
  await connectDB();
  console.log("Connected. Starting crawl with 3 concurrent sources...\n");

  const result = await runFullCrawl({
    maxPages: 500,
    maxDepth: 8,
    maxConcurrent: 3,
    delayMs: 1500,
    timeoutMs: 20000,
  });

  console.log("\n=== CRAWL COMPLETE ===");
  console.log(`Pages crawled:    ${result.pagesCrawled}`);
  console.log(`Founders found:   ${result.foundersDiscovered}`);
  console.log(`Companies found:  ${result.companiesDiscovered}`);
  console.log(`Duration:         ${(result.duration / 1000).toFixed(1)}s`);
  console.log(`Errors:           ${result.errors.length}`);
  if (result.errors.length > 0) {
    console.log("\nFirst 10 errors:");
    result.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Crawl script failed:", err);
  process.exit(1);
});
