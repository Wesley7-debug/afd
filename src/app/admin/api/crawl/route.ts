import { NextRequest, NextResponse } from "next/server";
import { runFullCrawl } from "@/crawler/engine";
import { connectDB } from "@/lib/mongodb";
import Founder from "@/models/Founder";
import Company from "@/models/Company";
import CrawlJob from "@/models/CrawlJob";
import CrawlSource from "@/models/CrawlSource";
import CrawlProgress from "@/models/CrawlProgress";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token !== ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { maxPages = 500, maxDepth = 8, maxConcurrent = 3 } = body;

    const result = await runFullCrawl({
      maxPages,
      maxDepth,
      maxConcurrent,
      delayMs: 1500,
      timeoutMs: 30000,
    });

    const founderCount = await Founder.countDocuments();
    const companyCount = await Company.countDocuments();
    const remainingProgress = await CrawlProgress.countDocuments();

    return NextResponse.json({
      ok: true,
      crawl: {
        pagesCrawled: result.pagesCrawled,
        foundersDiscovered: result.foundersDiscovered,
        companiesDiscovered: result.companiesDiscovered,
        duration: result.duration,
        errors: result.errors.length,
      },
      totals: {
        founders: founderCount,
        companies: companyCount,
      },
      resumableSources: remainingProgress,
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
    const lastJob = await CrawlJob.findOne().sort({ createdAt: -1 });

    const totalSources = await CrawlSource.countDocuments({ enabled: true });
    const runningJobs = await CrawlJob.countDocuments({ status: "running" });
    const resumableSources = await CrawlProgress.countDocuments();

    const progressDocs = await CrawlProgress.find().populate("sourceId", "name baseUrl");
    const resumableList = progressDocs.map((p: any) => ({
      name: p.sourceId?.name || "Unknown",
      baseUrl: p.sourceId?.baseUrl || "",
      pagesCrawled: p.pagesCrawled,
      queueSize: p.queue.length,
      foundersFound: p.newFounders,
      companiesFound: p.companiesDiscovered,
      lastSavedAt: p.lastSavedAt,
    }));

    return NextResponse.json({
      ok: true,
      stats: {
        founders: founderCount,
        companies: companyCount,
        crawlJobs: jobCount,
        totalSources,
        runningJobs,
        resumableSources,
        resumableList,
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
