import { Metadata } from "next";
import { notFound } from "next/navigation";
import FounderProfile from "./FounderProfile";

interface PageParams {
  params: Promise<{ slug: string }>;
}

async function getFounder(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/founders/${slug}`, {
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
  const founder = await getFounder(slug);
  if (!founder) return { title: "Founder Not Found" };

  return {
    title: `${founder.name} - African Founder`,
    description: founder.bio
      ? `${founder.name} is a ${founder.role || "founder"} based in ${founder.location || founder.country || "Africa"}. ${founder.bio.slice(0, 150)}`
      : `${founder.name} is a ${founder.role || "founder"} based in ${founder.location || founder.country || "Africa"}.`,
    openGraph: {
      title: `${founder.name} - African Founder`,
      description: founder.bio?.slice(0, 200) || `${founder.role || "Founder"} based in ${founder.location || founder.country || "Africa"}`,
      type: "profile",
    },
  };
}

export default async function FounderPage({ params }: PageParams) {
  const { slug } = await params;
  const founder = await getFounder(slug);
  if (!founder) notFound();

  return <FounderProfile founder={founder} />;
}
