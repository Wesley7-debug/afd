import { connectDB } from "../lib/mongodb";
import { runUntilQueueEmpty, ensureCrawlerRunning, getQueueStats } from "../crawler/scheduler";

async function main() {
  await connectDB();

  const mode = process.argv[2];

  if (mode === "--daemon") {
    await ensureCrawlerRunning();
    // Keep the process alive; workers + scheduler run continuously.
    console.log("[crawl] daemon mode — workers running, Ctrl+C to stop");
    return;
  }

  console.log("[crawl] draining persistent queue...");
  await runUntilQueueEmpty();
  const stats = await getQueueStats();
  console.log(
    `[crawl] done. queued=${stats.queued} crawling=${stats.crawling} completed=${stats.completed} failed=${stats.failed}`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
