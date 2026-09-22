import { connectDB } from "../lib/mongodb";
import { runFullCrawl } from "../crawler/engine";
import CrawlProgress from "../models/CrawlProgress";

async function main() {
  await connectDB();

  const resumableCount = await CrawlProgress.countDocuments();

  const result = await runFullCrawl({
    maxPages: 500,
    maxDepth: 8,
    maxConcurrent: 3,
    delayMs: 1500,
    timeoutMs: 20000,
  });

  process.exit(0);
}

main().catch(() => {
  process.exit(1);
});
