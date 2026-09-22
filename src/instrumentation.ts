export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.CRAWLER_DISABLED === "true") return;

  try {
    const { ensureCrawlerRunning } = await import("./crawler/scheduler");
    await ensureCrawlerRunning();
  } catch {
    // crawler will not start; queue remains persistent in MongoDB
  }
}
