import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company, CrawlSource, CrawlJob } from "@/models";

export async function GET() {
  try {
    await connectDB();

    const [
      totalFounders,
      totalCompanies,
      totalSources,
      lastJob,
      runningJob,
      withSourceSentence,
      withEmail,
      foundersHiringTrue,
      foundersHiringFalse,
      companiesHiringTrue,
      companiesHiringFalse,
      companiesWithEvidence,
    ] = await Promise.all([
      Founder.countDocuments(),
      Company.countDocuments(),
      CrawlSource.countDocuments(),
      CrawlJob.findOne({ status: "completed" })
        .sort({ completedAt: -1 })
        .lean(),
      CrawlJob.findOne({ status: "running" })
        .populate("sourceId", "name")
        .lean(),
      Founder.countDocuments({ sourceSentence: { $ne: "" } }),
      Founder.countDocuments({ email: { $ne: "" } }),
      Founder.countDocuments({ isHiring: true }),
      Founder.countDocuments({ isHiring: false }),
      Company.countDocuments({ isHiring: true }),
      Company.countDocuments({ isHiring: false }),
      Company.countDocuments({ hiringEvidence: { $ne: "" } }),
    ]);

    let newFounders = 0;
    let updatedFounders = 0;
    let duplicates = 0;
    let errors = 0;
    let fundingPages = 0;
    let hiringPages = 0;
    let founderProfiles = 0;
    let companiesDiscovered = 0;
    let countriesDiscovered: string[] = [];

    if (lastJob) {
      newFounders = lastJob.newFounders;
      updatedFounders = lastJob.updatedFounders;
      duplicates = lastJob.duplicatesFound;
      errors = lastJob.crawlErrors.length;
      fundingPages = lastJob.fundingPagesFound || 0;
      hiringPages = lastJob.hiringPagesFound || 0;
      founderProfiles = lastJob.founderProfilesFound || 0;
      companiesDiscovered = lastJob.companiesDiscovered || 0;
      countriesDiscovered = lastJob.countriesDiscovered || [];
    }

    return NextResponse.json({
      totalFounders,
      totalCompanies,
      totalSources,
      lastCrawlAt: lastJob?.completedAt || null,
      currentCrawl: runningJob
        ? {
            sourceName: (runningJob.sourceId as unknown as { name: string })?.name || "Unknown",
            startedAt: runningJob.startedAt,
          }
        : null,
      newFounders,
      updatedFounders,
      duplicates,
      errors,
      fundingPages,
      hiringPages,
      founderProfiles,
      companiesDiscovered,
      countriesDiscovered,
      quality: {
        withSourceSentence,
        withEmail,
        foundersHiring: {
          true: foundersHiringTrue,
          false: foundersHiringFalse,
          unknown: totalFounders - foundersHiringTrue - foundersHiringFalse,
        },
        companiesHiring: {
          true: companiesHiringTrue,
          false: companiesHiringFalse,
          unknown: totalCompanies - companiesHiringTrue - companiesHiringFalse,
        },
        companiesWithEvidence,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
