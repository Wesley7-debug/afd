import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { connectDB } = await import("@/lib/mongodb");
    const { Founder } = await import("@/models");

    await connectDB();

    const founders = await Founder.find({ slug: { $exists: true, $ne: "" } })
      .select("slug updatedAt")
      .lean();

    const founderUrls = founders.map((f) => ({
      url: `${baseUrl}/founders/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...founderUrls,
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
