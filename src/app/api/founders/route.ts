import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company } from "@/models";
import { buildFounderQuery } from "@/lib/founder-query";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "newest";
    const skip = (page - 1) * limit;

    const query = buildFounderQuery(searchParams);

    let sortQuery: Record<string, 1 | -1> = {};
    switch (sort) {
      case "name":
        sortQuery = { name: 1 };
        break;
      case "industry":
        sortQuery = { industry: 1, name: 1 };
        break;
      case "location":
        sortQuery = { location: 1, name: 1 };
        break;
      case "country":
        sortQuery = { country: 1, name: 1 };
        break;
      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const [founders, total] = await Promise.all([
      Founder.find(query)
        .populate("companies", "name slug industry logoUrl teamSize oneLiner websiteUrl")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Founder.countDocuments(query),
    ]);

    return NextResponse.json({
      founders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch founders" },
      { status: 500 }
    );
  }
}
