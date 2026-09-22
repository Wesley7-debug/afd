import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { runCrawler } from "@/crawler/engine";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const sourceId = body.sourceId;

    runCrawler(sourceId).catch((err) => {
      console.error("[API] Crawl error:", err);
    });

    return NextResponse.json({
      message: "Crawl started",
      sourceId: sourceId || "all sources",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start crawl" },
      { status: 500 }
    );
  }
}
