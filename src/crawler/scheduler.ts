import { connectDB } from "@/lib/mongodb";
import { seedInitialSources } from "./seed";
import {
  claimNextUrl,
  processQueueEntry,
  kickSources,
  finishCompletedCycles,
  recoverStaleUrls,
  getQueueStats,
} from "./engine";

const WORKER_COUNT = Math.max(1, parseInt(process.env.CRAWL_WORKERS || "10", 10));
const TICK_INTERVAL_MS = Math.max(15000, parseInt(process.env.CRAWL_TICK_MS || "45000", 10));
const WORKER_IDLE_MS = 3000;

interface CrawlerState {
  running: boolean;
  startedAt: Date;
  workers: number;
  ticks: number;
  lastTickAt: Date | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __africanFoundersCrawler: CrawlerState | undefined;
}

function getState(): CrawlerState {
  if (!globalThis.__africanFoundersCrawler) {
    globalThis.__africanFoundersCrawler = {
      running: false,
      startedAt: new Date(),
      workers: 0,
      ticks: 0,
      lastTickAt: null,
    };
  }
  return globalThis.__africanFoundersCrawler;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function schedulerTick(): Promise<void> {
  const state = getState();
  try {
    await recoverStaleUrls();
    await finishCompletedCycles();
    await seedInitialSources();
    await kickSources();
    state.ticks++;
    state.lastTickAt = new Date();
  } catch {
    // tick failed; next tick will retry
  }
}

async function workerLoop(workerId: number): Promise<void> {
  const state = getState();
  state.workers++;

  while (state.running) {
    try {
      const entry = await claimNextUrl();
      if (!entry) {
        await sleep(WORKER_IDLE_MS);
        continue;
      }
      await processQueueEntry(entry);
    } catch {
      await sleep(5000);
    }
    void workerId;
  }

  state.workers--;
}

let tickTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the continuous crawler:
 * - seeds all enabled sources (120+ seed websites), re-checking seed.ts every tick
 * - runs a scheduler tick that enqueues due sources and finishes completed cycles
 * - runs a pool of workers that atomically claim URLs from the persistent MongoDB queue
 *
 * When a source's cycle finishes it is immediately eligible again; its queue is reset
 * so every page is re-checked on the next loop (continuous rediscovery, 24/7).
 *
 * Safe to call multiple times (no-ops if already running). Survives page reloads
 * and work survives restarts because the queue lives in MongoDB.
 */
export async function ensureCrawlerRunning(): Promise<CrawlerState> {
  const state = getState();
  if (state.running) return state;

  try {
    await connectDB();
    await seedInitialSources();
  } catch {
    return state;
  }

  state.running = true;
  state.startedAt = new Date();
  state.workers = 0;

  await recoverStaleUrls();
  await schedulerTick();

  for (let i = 0; i < WORKER_COUNT; i++) {
    workerLoop(i).catch(() => {});
  }

  if (tickTimer) clearInterval(tickTimer);
  tickTimer = setInterval(() => {
    schedulerTick().catch(() => {});
  }, TICK_INTERVAL_MS);

  return state;
}

export function stopCrawler(): void {
  const state = getState();
  state.running = false;
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

export function getCrawlerStatus(): CrawlerState & { queue: Awaited<ReturnType<typeof getQueueStats>> | null } {
  const state = getState();
  return { ...state, queue: null };
}

export async function getCrawlerStatusAsync() {
  const state = getState();
  let queue = null;
  try {
    queue = await getQueueStats();
  } catch {}
  return { ...state, queue };
}

export { getQueueStats, kickSources };

/**
 * Runs until the persistent queue has no queued/crawling URLs left.
 * Used by the standalone run-crawl script.
 */
export async function runUntilQueueEmpty(maxIdleTicks = 5): Promise<void> {
  await connectDB();
  await seedInitialSources();
  await recoverStaleUrls();
  await finishCompletedCycles();
  await kickSources();

  let idle = 0;
  while (idle < maxIdleTicks) {
    const entry = await claimNextUrl();
    if (!entry) {
      const stats = await getQueueStats();
      if (stats.queued === 0 && stats.crawling === 0) {
        await finishCompletedCycles();
        const after = await getQueueStats();
        if (after.queued === 0 && after.crawling === 0) return;
      }
      idle++;
      await sleep(2000);
      continue;
    }
    idle = 0;
    await processQueueEntry(entry);
  }
}
