import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Founder from "@/models/Founder";
import Company from "@/models/Company";
import CrawlJob from "@/models/CrawlJob";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token !== ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { collection } = await req.json();

    let result = { founders: 0, companies: 0, crawlJobs: 0 };

    if (collection === "founders" || collection === "all") {
      const r = await Founder.deleteMany({});
      result.founders = r.deletedCount;
    }
    if (collection === "companies" || collection === "all") {
      const r = await Company.deleteMany({});
      result.companies = r.deletedCount;
    }
    if (collection === "all") {
      const r = await CrawlJob.deleteMany({});
      result.crawlJobs = r.deletedCount;
    }

    return NextResponse.json({ ok: true, deleted: result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
