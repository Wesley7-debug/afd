import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder } from "@/models";
import { buildFounderQuery } from "@/lib/founder-query";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = buildFounderQuery(searchParams);

    const ids = await Founder.find(query).select("_id").sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      ids: ids.map((f) => String(f._id)),
      total: ids.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch founder ids" }, { status: 500 });
  }
}
