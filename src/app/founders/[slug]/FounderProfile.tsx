"use client";

import Link from "next/link";
import FounderAvatar from "@/components/FounderAvatar";

interface Company {
  _id: string;
  name: string;
  slug: string;
  industry: string;
  location: string;
  websiteUrl: string;
  logoUrl: string;
}

interface FounderProfileData {
  _id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  location: string;
  industry: string;
  profileImageUrl: string;
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  companies: Company[];
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt: string;
}

export default function FounderProfile({ founder }: { founder: FounderProfileData }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 text-sm text-yc-ink-muted">
        <Link href="/" className="hover:text-yc-ink">
          Directory
        </Link>
        <span className="mx-2">/</span>
        <span className="text-yc-ink">{founder.name}</span>
      </nav>

      <div className="rounded-xl border border-yc-line bg-yc-surface p-8">
        <div className="flex items-start gap-6">
          <FounderAvatar name={founder.name} imageUrl={founder.profileImageUrl} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-yc-ink">{founder.name}</h1>
            {founder.role && (
              <p className="mt-1 text-yc-ink-muted">{founder.role}</p>
            )}
            {founder.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-yc-ink-muted">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {founder.location}
              </p>
            )}
          </div>
        </div>

        {founder.bio && (
          <div className="mt-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">About</h2>
            <p className="mt-2 leading-relaxed text-yc-ink-2">{founder.bio}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {founder.industry && (
            <span className="rounded-lg bg-yc-subtle border border-yc-line-subtle px-3 py-1 text-sm font-medium text-yc-ink-muted">
              {founder.industry}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {founder.xUrl && (
            <a
              href={founder.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Twitter
            </a>
          )}
          {founder.linkedinUrl && (
            <a
              href={founder.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
          {founder.personalWebsiteUrl && (
            <a
              href={founder.personalWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          )}
        </div>

        {founder.companies && founder.companies.length > 0 && (
          <div className="mt-8 border-t border-yc-line-subtle pt-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">Companies</h2>
            <div className="mt-3 space-y-3">
              {founder.companies.map((company) => (
                <div
                  key={company._id}
                  className="flex items-center gap-3 rounded-lg border border-yc-line-subtle p-4"
                >
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-10 w-10 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yc-focus/10 text-sm font-semibold text-yc-focus">
                      {company.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-yc-ink">{company.name}</p>
                    <div className="flex gap-2 text-xs text-yc-ink-muted">
                      {company.industry && <span>{company.industry}</span>}
                      {company.location && <span>&middot; {company.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-yc-line-subtle pt-4 text-xs text-yc-ink-3">
          Last updated: {new Date(founder.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
