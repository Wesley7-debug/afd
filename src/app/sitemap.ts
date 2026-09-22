import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { connectDB } = await import("@/lib/mongodb");
    const { Founder, Company } = await import("@/models");

    await connectDB();

    const [founders, companies] = await Promise.all([
      Founder.find({ slug: { $exists: true, $ne: "" } })
        .select("slug updatedAt")
        .lean(),
      Company.find({ slug: { $exists: true, $ne: "" } })
        .select("slug updatedAt")
        .lean(),
    ]);

    const founderUrls = founders.map((f) => ({
      url: `${baseUrl}/founders/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const companyUrls = companies.map((c) => ({
      url: `${baseUrl}/companies/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...founderUrls,
      ...companyUrls,
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
