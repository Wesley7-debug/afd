"use client";

import { useEffect, useCallback } from "react";
import FounderAvatar from "./FounderAvatar";

interface FounderDetail {
  _id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  location: string;
  country: string;
  industry: string;
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  profileImageUrl: string;
  lastVerifiedAt: string;
  foundedYear?: number;
  isHiring?: boolean;
  companies: {
    name: string;
    slug: string;
    industry: string;
    description?: string;
    websiteUrl?: string;
    logoUrl?: string;
    teamSize?: number;
    oneLiner?: string;
    foundedYear?: number;
    isHiring?: boolean;
    country?: string;
  }[];
}

interface FounderModalProps {
  founder: FounderDetail | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function FounderModal({ founder, currentIndex, totalCount, onClose, onPrev, onNext }: FounderModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (founder) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [founder, handleKeyDown]);

  if (!founder) return null;

  const company = founder.companies?.[0];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-[90vw] max-w-[560px] flex-col overflow-hidden rounded-2xl border border-yc-line bg-yc-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-yc-line px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-yc-ink">Profile</span>
            <span className="text-xs text-yc-ink-3">
              {currentIndex + 1} / {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-yc-line bg-yc-surface text-yc-ink-muted hover:bg-yc-hover hover:text-yc-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous (ArrowUp)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex >= totalCount - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-yc-line bg-yc-surface text-yc-ink-muted hover:bg-yc-hover hover:text-yc-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next (ArrowDown)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg p-1 text-yc-ink-3 hover:bg-yc-hover hover:text-yc-ink transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 yc-thin-scroll">
          <div className="flex items-start gap-4">
            <FounderAvatar name={founder.name} imageUrl={founder.profileImageUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-yc-ink truncate">{founder.name}</h2>
              {founder.role && (
                <p className="mt-0.5 text-sm text-yc-ink-muted">{founder.role}</p>
              )}
            </div>
          </div>

          {company && (
            <div className="mt-5 rounded-lg border border-yc-line bg-yc-subtle p-4">
              <div className="flex items-center gap-3">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yc-focus/10 text-sm font-semibold text-yc-focus">
                    {company.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-yc-ink">{company.name}</div>
                  {company.oneLiner && (
                    <div className="truncate text-xs text-yc-ink-muted mt-0.5">{company.oneLiner}</div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-yc-ink-muted">
                {company.industry && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-yc-surface px-2 py-0.5 border border-yc-line-subtle">
                    <svg className="h-3 w-3 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {company.industry}
                  </span>
                )}
                {company.teamSize != null && company.teamSize > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-yc-surface px-2 py-0.5 border border-yc-line-subtle">
                    <svg className="h-3 w-3 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {company.teamSize} people
                  </span>
                )}
                {company.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-yc-surface px-2 py-0.5 border border-yc-line-subtle hover:bg-yc-hover transition-colors"
                  >
                    <svg className="h-3 w-3 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {(founder.location || founder.country) && (
              <div className="flex items-center gap-2 text-sm text-yc-ink-2">
                <svg className="h-4 w-4 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[founder.location, founder.country].filter(Boolean).join(", ")}
              </div>
            )}
            {founder.industry && (
              <div className="flex items-center gap-2 text-sm text-yc-ink-2">
                <svg className="h-4 w-4 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {founder.industry}
              </div>
            )}
            {founder.foundedYear && founder.foundedYear > 0 && (
              <div className="flex items-center gap-2 text-sm text-yc-ink-2">
                <svg className="h-4 w-4 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Founded: {founder.foundedYear}
              </div>
            )}
            {founder.isHiring && (
              <div className="flex items-center gap-2 text-sm text-yc-green">
                <span className="h-2 w-2 rounded-full bg-yc-green animate-pulse" />
                Currently Hiring
              </div>
            )}
          </div>

          {founder.bio && (
            <div className="mt-5">
              <h3 className="text-xs font-medium uppercase tracking-[0.72px] text-yc-ink-3">About</h3>
              <p className="mt-2 text-sm leading-relaxed text-yc-ink-2 whitespace-pre-wrap">{founder.bio}</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {founder.xUrl && (
              <a
                href={founder.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
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
                className="inline-flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
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
                className="inline-flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
          </div>

          {founder.lastVerifiedAt && (
            <p className="mt-6 text-xs text-yc-ink-3">
              Last updated {new Date(founder.lastVerifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
