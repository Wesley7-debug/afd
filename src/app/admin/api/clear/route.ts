import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Founder from "@/models/Founder";
import Company from "@/models/Company";
import CrawlJob from "@/models/CrawlJob";
import CrawlProgress from "@/models/CrawlProgress";
import CrawlUrlQueue from "@/models/CrawlUrlQueue";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token !== ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { collection } = await req.json();

    const result = {
      founders: 0,
      companies: 0,
      crawlJobs: 0,
      queue: 0,
      progress: 0,
    };

    if (collection === "founders" || collection === "companies" || collection === "founders+companies" || collection === "all") {
      if (collection === "founders" || collection === "founders+companies" || collection === "all") {
        result.founders = (await Founder.deleteMany({})).deletedCount;
      }
      if (collection === "companies" || collection === "founders+companies" || collection === "all") {
        result.companies = (await Company.deleteMany({})).deletedCount;
      }
    }

    if (collection === "all") {
      result.crawlJobs = (await CrawlJob.deleteMany({})).deletedCount;
      result.queue = (await CrawlUrlQueue.deleteMany({})).deletedCount;
      result.progress = (await CrawlProgress.deleteMany({})).deletedCount;
    }

    if (collection === "queue") {
      result.queue = (await CrawlUrlQueue.deleteMany({})).deletedCount;
      result.progress = (await CrawlProgress.deleteMany({})).deletedCount;
    }

    return NextResponse.json({ ok: true, deleted: result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
