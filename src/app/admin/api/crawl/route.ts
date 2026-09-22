import { NextRequest, NextResponse } from "next/server";
import { runFullCrawl } from "@/crawler/engine";
import { ensureCrawlerRunning, getCrawlerStatusAsync } from "@/crawler/scheduler";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company, CrawlSource, CrawlJob, CrawlUrlQueue } from "@/models";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token !== ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { maxPages, maxDepth } = body;

    const result = await runFullCrawl({ maxPages, maxDepth });
    ensureCrawlerRunning().catch(() => {});
    const crawler = await getCrawlerStatusAsync();

    const founderCount = await Founder.countDocuments();
    const companyCount = await Company.countDocuments();

    return NextResponse.json({
      ok: true,
      message: `Crawler running — ${result.enqueued} source(s) enqueued. Workers process the queue continuously.`,
      crawl: {
        pagesCrawled: result.queue.completed,
        foundersDiscovered: founderCount,
        companiesDiscovered: companyCount,
        queued: result.queue.queued,
        crawling: result.queue.crawling,
        duration: 0,
        errors: result.queue.failed,
      },
      totals: { founders: founderCount, companies: companyCount },
      crawler,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token !== ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const founderCount = await Founder.countDocuments();
    const companyCount = await Company.countDocuments();
    const jobCount = await CrawlJob.countDocuments();
    const lastJob = await CrawlJob.findOne().sort({ createdAt: -1 }).lean();

    const totalSources = await CrawlSource.countDocuments({ enabled: true });
    const crawler = await getCrawlerStatusAsync();

    const [queueByStatus, sources] = await Promise.all([
      CrawlUrlQueue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      CrawlSource.find({ enabled: true }).sort({ lastActivityAt: -1, name: 1 }).lean(),
    ]);

    const queueMap = Object.fromEntries(queueByStatus.map((q: { _id: string; count: number }) => [q._id, q.count]));

    const sourceStats = await Promise.all(
      sources.map(async (s: any) => {
        const [discovered, remaining] = await Promise.all([
          CrawlUrlQueue.countDocuments({ sourceId: s._id }),
          CrawlUrlQueue.countDocuments({ sourceId: s._id, status: { $in: ["queued", "crawling"] } }),
        ]);
        return {
          name: s.name,
          baseUrl: s.baseUrl,
          crawlStatus: s.crawlStatus,
          pagesDiscovered: discovered,
          pagesCrawled: s.pagesCrawled || 0,
          pagesRemaining: remaining,
          founderCandidates: s.founderCandidates || 0,
          foundersDiscovered: s.foundersDiscovered || 0,
          companiesDiscovered: s.companiesDiscovered || 0,
          relationshipsCreated: s.relationshipsCreated || 0,
          relationshipsRejected: s.relationshipsRejected || 0,
          rejectionCounts: s.rejectionCounts || [],
          errors: s.errorCount || 0,
          lastActivityAt: s.lastActivityAt || s.lastCrawledAt || null,
          nextCrawlAt: s.nextCrawlAt || null,
        };
      })
    );

    const pendingSources = sourceStats.filter((s) => s.pagesRemaining > 0 || s.crawlStatus === "crawling");

    return NextResponse.json({
      ok: true,
      stats: {
        founders: founderCount,
        companies: companyCount,
        crawlJobs: jobCount,
        totalSources,
        runningJobs: queueMap.crawling || 0,
        queuedUrls: queueMap.queued || 0,
        completedUrls: queueMap.completed || 0,
        failedUrls: queueMap.failed || 0,
        resumableSources: pendingSources.length,
        resumableList: pendingSources.slice(0, 20).map((s) => ({
          name: s.name,
          baseUrl: s.baseUrl,
          pagesCrawled: s.pagesCrawled,
          queueSize: s.pagesRemaining,
          foundersFound: s.foundersDiscovered,
          companiesFound: s.companiesDiscovered,
          lastSavedAt: s.lastActivityAt,
        })),
        crawler: {
          running: crawler.running,
          workers: crawler.workers,
          startedAt: crawler.startedAt,
          ticks: crawler.ticks,
        },
        sourceStats,
        lastCrawl: lastJob
          ? {
              pagesCrawled: lastJob.pagesCrawled,
              foundersDiscovered: lastJob.newFounders,
              companiesDiscovered: lastJob.companiesDiscovered,
              createdAt: lastJob.createdAt,
              status: lastJob.status,
            }
          : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
