"use client";

import Link from "next/link";

interface Founder {
  name: string;
  slug: string;
  role: string;
}

interface CompanyDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  oneLiner: string;
  websiteUrl: string;
  logoUrl: string;
  industry: string;
  location: string;
  foundedYear?: number;
  teamSize: number;
  isHiring: boolean;
  isAiNative: boolean;
  batch: string;
  tags: string[];
  founders: Founder[];
  createdAt: string;
}

interface CompanyPeekProps {
  company: CompanyDetail | null;
  onClose: () => void;
}

export default function CompanyPeek({ company, onClose }: CompanyPeekProps) {
  if (!company) return null;

  return (
    <div className="flex h-full w-[400px] flex-col border-l border-yc-line bg-yc-surface overflow-y-auto yc-thin-scroll max-md:hidden">
      <div className="flex items-center justify-between border-b border-yc-line px-5 py-3">
        <span className="text-sm font-medium text-yc-ink">Company</span>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-yc-ink-3 hover:bg-yc-hover hover:text-yc-ink transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-5 py-6">
        <div className="flex items-start gap-4">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-14 w-14 rounded-xl object-contain" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yc-focus/10 text-xl font-bold text-yc-focus">
              {company.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-yc-ink truncate">{company.name}</h2>
              {company.isAiNative && (
                <span className="shrink-0 rounded-md bg-yc-purple-soft px-1.5 py-0.5 text-[10px] font-medium text-yc-purple">AI-native</span>
              )}
            </div>
            {company.oneLiner && (
              <p className="mt-0.5 text-sm text-yc-ink-muted">{company.oneLiner}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-yc-ink-muted">
          {company.industry && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yc-subtle px-2 py-0.5 border border-yc-line-subtle">
              <svg className="h-3 w-3 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {company.industry}
            </span>
          )}
          {company.location && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yc-subtle px-2 py-0.5 border border-yc-line-subtle">
              <svg className="h-3 w-3 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {company.location}
            </span>
          )}
          {company.teamSize > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yc-subtle px-2 py-0.5 border border-yc-line-subtle">
              <svg className="h-3 w-3 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {company.teamSize} people
            </span>
          )}
          {company.foundedYear != null && company.foundedYear > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yc-subtle px-2 py-0.5 border border-yc-line-subtle">
              Founded {company.foundedYear}
            </span>
          )}
        </div>

        {company.description && (
          <div className="mt-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">About</h3>
            <p className="mt-2 text-sm leading-relaxed text-yc-ink-2 whitespace-pre-wrap">{company.description}</p>
          </div>
        )}

        {company.founders && company.founders.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">Founders</h3>
            <div className="mt-2 space-y-2">
              {company.founders.map((founder) => (
                <Link
                  key={founder.slug}
                  href={`/founders/${founder.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-yc-line-subtle p-3 transition-colors hover:bg-yc-hover"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yc-focus/10 text-xs font-semibold text-yc-focus">
                    {founder.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yc-ink">{founder.name}</p>
                    {founder.role && (
                      <p className="text-xs text-yc-ink-muted">{founder.role}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {company.tags && company.tags.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {company.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-yc-subtle border border-yc-line-subtle px-2 py-0.5 text-xs text-yc-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-yc-ink-3">
          {company.isHiring && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yc-green-soft px-2 py-0.5 text-yc-green font-medium">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Hiring
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
