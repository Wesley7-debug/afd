import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q) {
      return NextResponse.json({ founders: [], companies: [] });
    }

    const regex = { $regex: q, $options: "i" };

    const [founders, companies] = await Promise.all([
      Founder.find({
        $or: [{ name: regex }, { industry: regex }, { location: regex }],
      })
        .populate("companies", "name slug industry")
        .limit(20)
        .lean(),
      Company.find({
        $or: [{ name: regex }, { description: regex }, { industry: regex }],
      })
        .populate("founders", "name slug role")
        .limit(20)
        .lean(),
    ]);

    return NextResponse.json({ founders, companies });
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
