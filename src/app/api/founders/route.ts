import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const location = searchParams.get("location") || "";
    const country = searchParams.get("country") || "";
    const role = searchParams.get("role") || "";
    const sort = searchParams.get("sort") || "newest";
    const hasX = searchParams.get("hasX") === "true";
    const isHiring = searchParams.get("isHiring") === "true";
    const foundedYear = searchParams.get("foundedYear") || "";
    const discoveredAfter = searchParams.get("discoveredAfter") || "";
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { xHandle: { $regex: search, $options: "i" } },
        { oneLiner: { $regex: search, $options: "i" } },
      ];
    }

    if (industry) {
      const industries = industry.split(",").map((s) => s.trim()).filter(Boolean);
      if (industries.length === 1) {
        query.industry = industries[0];
      } else if (industries.length > 1) {
        query.industry = { $in: industries };
      }
    }

    if (location) {
      const locations = location.split(",").map((s) => s.trim()).filter(Boolean);
      if (locations.length === 1) {
        query.location = locations[0];
      } else if (locations.length > 1) {
        query.location = { $in: locations };
      }
    }

    if (country) {
      const countries = country.split(",").map((s) => s.trim()).filter(Boolean);
      if (countries.length === 1) {
        query.country = countries[0];
      } else if (countries.length > 1) {
        query.country = { $in: countries };
      }
    }

    if (role) {
      const roles = role.split(",").map((s) => s.trim()).filter(Boolean);
      if (roles.length === 1) {
        query.role = { $regex: roles[0], $options: "i" };
      } else if (roles.length > 1) {
        query.role = { $in: roles.map((r) => new RegExp(r, "i")) };
      }
    }

    if (hasX) {
      query.xUrl = { $ne: "" };
    }

    if (isHiring) {
      query.isHiring = true;
    }

    if (foundedYear) {
      const years = foundedYear.split(",").map((s) => parseInt(s.trim())).filter((y) => !isNaN(y));
      if (years.length === 1) {
        query.foundedYear = years[0];
      } else if (years.length > 1) {
        query.foundedYear = { $in: years };
      }
    }

    if (discoveredAfter) {
      query.discoveredAt = { $gt: new Date(discoveredAfter) };
    }

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
