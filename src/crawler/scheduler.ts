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
      await runCrawler();
    } catch {
      // crawl failed silently
    }
  });
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
  schedulerRunning = false;
}

export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    nextRun: scheduledTask ? "Scheduled" : "Not scheduled",
  };
}
