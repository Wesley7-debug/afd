import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { runCrawler } from "@/crawler/engine";
import { ensureCrawlerRunning, getCrawlerStatusAsync } from "@/crawler/scheduler";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const sourceId = body.sourceId;

    const result = await runCrawler(sourceId);
    ensureCrawlerRunning().catch(() => {});
    const crawler = await getCrawlerStatusAsync();

    return NextResponse.json({
      message: "Crawl queued",
      enqueued: result.enqueued,
      sourceId: sourceId || "all sources",
      crawler,
    });
  } catch {
    return NextResponse.json({ error: "Failed to start crawl" }, { status: 500 });
  }
}
