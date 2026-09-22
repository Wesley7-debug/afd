import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CrawlSource } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const sources = await CrawlSource.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.baseUrl) {
      return NextResponse.json(
        { error: "Name and baseUrl are required" },
        { status: 400 }
      );
    }

    try {
      new URL(body.baseUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    const existing = await CrawlSource.findOne({ baseUrl: body.baseUrl });
    if (existing) {
      return NextResponse.json(
        { error: "Source with this URL already exists" },
        { status: 409 }
      );
    }

    const source = await CrawlSource.create({
      name: body.name,
      baseUrl: body.baseUrl,
      country: body.country || "Africa",
      category: body.category || "Startup News",
      enabled: body.enabled !== false,
      maxPages: body.maxPages || 1000,
      maxDepth: body.maxDepth || 8,
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}
