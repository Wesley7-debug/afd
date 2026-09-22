import cron from "node-cron";
import { connectDB } from "@/lib/mongodb";
import { CrawlSource } from "@/models";
import { runCrawler } from "./engine";

let schedulerRunning = false;
let scheduledTask: cron.ScheduledTask | null = null;

export async function startScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;

  await connectDB();

  const intervalMs = parseInt(process.env.CRAWL_INTERVAL_MS || "86400000");
  const cronExpression = intervalMs === 86400000 ? "0 2 * * *" : "*/60 * * * *";

  scheduledTask = cron.schedule(cronExpression, async () => {
    try {
      console.log(`[Scheduler] Starting scheduled crawl at ${new Date().toISOString()}`);
      await runCrawler();
      console.log(`[Scheduler] Crawl completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`[Scheduler] Crawl failed:`, error);
    }
  });

  console.log(`[Scheduler] Started with cron expression: ${cronExpression}`);
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
  schedulerRunning = false;
  console.log("[Scheduler] Stopped");
}

export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    nextRun: scheduledTask ? "Scheduled" : "Not scheduled",
  };
}
