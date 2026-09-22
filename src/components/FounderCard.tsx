"use client";

import Link from "next/link";
import FounderAvatar from "./FounderAvatar";

interface FounderData {
  _id: string;
  name: string;
  slug: string;
  role: string;
  location: string;
  country: string;
  industry: string;
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  discoveredAt?: string;
  foundedYear?: number;
  isHiring?: boolean;
  companies: { name: string; slug: string; industry: string }[];
}

interface FounderCardProps {
  founder: FounderData;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  view?: "cards" | "people";
  isNew?: boolean;
}

export default function FounderCard({ founder, onSelect, isSelected, view = "cards", isNew }: FounderCardProps) {
  const company = founder.companies?.[0];

  if (view === "people") {
    return (
      <button
        onClick={() => onSelect?.(founder._id)}
        className={`flex w-full items-center gap-3 border-b border-yc-line-subtle px-4 py-3 text-left transition-colors ${
          isSelected ? "bg-yc-blue-soft" : "hover:bg-yc-hover"
        }`}
      >
        <FounderAvatar name={founder.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-medium text-yc-ink">{founder.name}</span>
            {isNew && (
              <span className="shrink-0 rounded-md bg-yc-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-yc-green">New</span>
            )}
            {founder.xUrl && (
              <span className="truncate text-[11px] font-mono text-yc-ink-3">@{founder.xUrl.split("/").pop()}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-yc-ink-muted">
            {founder.role && <span>{founder.role}</span>}
            {company && (
              <>
                {founder.role && <span>·</span>}
                <span>{company.name}</span>
              </>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-yc-ink-3">
            {founder.industry && <span>{founder.industry}</span>}
            {(founder.location || founder.country) && (
              <>
                {founder.industry && <span>·</span>}
                <span>{[founder.location, founder.country].filter(Boolean).join(", ")}</span>
              </>
            )}
          </div>
        </div>
        {founder.isHiring && (
          <span className="shrink-0 rounded-full bg-yc-green-soft px-2 py-0.5 text-[10px] font-semibold text-yc-green">Hiring</span>
        )}
        <svg className="h-4 w-4 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <Link
      href={`/founders/${founder.slug}`}
      className="block rounded-xl border border-yc-line bg-yc-surface p-4 transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-yc-line-strong"
    >
      <div className="flex items-start gap-3">
        <FounderAvatar name={founder.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-medium text-yc-ink">{founder.name}</h3>
            {isNew && (
              <span className="shrink-0 rounded-md bg-yc-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-yc-green">New</span>
            )}
          </div>
          {founder.role && <p className="mt-0.5 text-xs text-yc-ink-muted">{founder.role}</p>}
        </div>
      </div>

      {company && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-yc-ink-muted">
          <svg className="h-3 w-3 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{company.name}</span>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-yc-ink-3">
        {(founder.location || founder.country) && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {[founder.location, founder.country].filter(Boolean).join(", ")}
          </span>
        )}
        {founder.industry && (
          <span className="rounded-md bg-yc-subtle px-1.5 py-0.5 font-medium text-yc-ink-muted border border-yc-line-subtle">
            {founder.industry}
          </span>
        )}
        {founder.foundedYear && founder.foundedYear > 0 && (
          <span className="rounded-md bg-yc-subtle px-1.5 py-0.5 font-medium text-yc-ink-muted border border-yc-line-subtle">
            Founded {founder.foundedYear}
          </span>
        )}
        {founder.isHiring && (
          <span className="rounded-md bg-yc-green-soft px-1.5 py-0.5 font-semibold text-yc-green">
            Hiring
          </span>
        )}
      </div>

      <div className="mt-2.5 flex gap-2">
        {founder.xUrl && (
          <svg className="h-3.5 w-3.5 text-yc-ink-3 hover:text-yc-ink transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )}
        {founder.linkedinUrl && (
          <svg className="h-3.5 w-3.5 text-yc-ink-3 hover:text-yc-ink transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )}
        {founder.personalWebsiteUrl && (
          <svg className="h-3.5 w-3.5 text-yc-ink-3 hover:text-yc-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        )}
      </div>
    </Link>
  );
}
