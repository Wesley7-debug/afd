import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder } from "@/models";

export async function GET() {
  try {
    await connectDB();

    const [industryAgg, locationAgg, roleAgg, countryAgg] = await Promise.all([
      Founder.aggregate([
        { $match: { industry: { $ne: "" } } },
        { $group: { _id: "$industry", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      Founder.aggregate([
        { $match: { location: { $ne: "" } } },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      Founder.aggregate([
        { $match: { role: { $ne: "" } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      Founder.aggregate([
        { $match: { country: { $ne: "" } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
    ]);

    return NextResponse.json({
      industries: industryAgg.map((i) => ({ label: i._id, count: i.count })),
      locations: locationAgg.map((l) => ({ label: l._id, count: l.count })),
      roles: roleAgg.map((r) => ({ label: r._id, count: r.count })),
      countries: countryAgg.map((c) => ({ label: c._id, count: c.count })),
    });
  } catch (error) {
    return NextResponse.json(
      { industries: [], locations: [], roles: [], countries: [] },
      { status: 500 }
    );
  }
}
