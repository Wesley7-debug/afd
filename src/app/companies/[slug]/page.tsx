import { Metadata } from "next";
import { notFound } from "next/navigation";
import CompanyProfile from "./CompanyProfile";

interface PageParams {
  params: Promise<{ slug: string }>;
}

async function getCompany(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/companies/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return { title: "Company Not Found" };

  return {
    title: `${company.name} - African Startup`,
    description:
      company.description?.slice(0, 200) ||
      `${company.name} is a ${company.industry || "technology"} company based in ${company.location || company.country || "Africa"}.`,
    openGraph: {
      title: `${company.name} - African Startup`,
      description: company.description?.slice(0, 200) || "",
      type: "website",
    },
  };
}

export default async function CompanyPage({ params }: PageParams) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  return <CompanyProfile company={company} />;
}
