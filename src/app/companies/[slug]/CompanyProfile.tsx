"use client";

import Link from "next/link";

interface Founder {
  _id: string;
  name: string;
  slug: string;
  role: string;
}

interface CompanyProfileData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  industry: string;
  location: string;
  foundedYear: number;
  founders: Founder[];
  createdAt: string;
  updatedAt: string;
}

export default function CompanyProfile({ company }: { company: CompanyProfileData }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 text-sm text-yc-ink-muted">
        <Link href="/companies" className="hover:text-yc-ink">
          Companies
        </Link>
        <span className="mx-2">/</span>
        <span className="text-yc-ink">{company.name}</span>
      </nav>

      <div className="rounded-xl border border-yc-line bg-yc-surface p-8">
        <div className="flex items-start gap-6">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="h-16 w-16 rounded-xl object-contain"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-yc-focus/10 text-xl font-bold text-yc-focus">
              {company.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-yc-ink">{company.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-yc-ink-muted">
              {company.location && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {company.location}
                </span>
              )}
              {company.foundedYear > 0 && (
                <span>Founded {company.foundedYear}</span>
              )}
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mt-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">About</h2>
            <p className="mt-2 leading-relaxed text-yc-ink-2">{company.description}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {company.industry && (
            <span className="rounded-lg bg-yc-subtle border border-yc-line-subtle px-3 py-1 text-sm font-medium text-yc-ink-muted">
              {company.industry}
            </span>
          )}
        </div>

        {company.websiteUrl && (
          <div className="mt-6">
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-4 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
          </div>
        )}

        {company.founders && company.founders.length > 0 && (
          <div className="mt-8 border-t border-yc-line-subtle pt-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">Founders</h2>
            <div className="mt-3 space-y-3">
              {company.founders.map((founder) => (
                <Link
                  key={founder._id}
                  href={`/founders/${founder.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-yc-line-subtle p-4 transition-colors hover:bg-yc-hover"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yc-focus/10 text-sm font-semibold text-yc-focus">
                    {founder.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-yc-ink">{founder.name}</p>
                    {founder.role && (
                      <p className="text-xs text-yc-ink-muted">{founder.role}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-yc-line-subtle pt-4 text-xs text-yc-ink-3">
          Last updated: {new Date(company.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
