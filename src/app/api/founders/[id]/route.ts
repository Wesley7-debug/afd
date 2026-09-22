import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let founder;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      founder = await Founder.findById(id)
        .populate("companies", "name slug industry description websiteUrl logoUrl teamSize oneLiner")
        .lean();
    } else {
      founder = await Founder.findOne({ slug: id })
        .populate("companies", "name slug industry description websiteUrl logoUrl teamSize oneLiner")
        .lean();
    }

    if (!founder) {
      return NextResponse.json({ error: "Founder not found" }, { status: 404 });
    }

    return NextResponse.json(founder);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch founder" },
      { status: 500 }
    );
  }
}
