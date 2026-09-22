import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Company } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let company;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      company = await Company.findById(id)
        .populate("founders", "name slug role profileImageUrl")
        .lean();
    }

    if (!company) {
      company = await Company.findOne({ slug: id })
        .populate("founders", "name slug role profileImageUrl")
        .lean();
    }

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
