"use client";

import Link from "next/link";

interface CompanyData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  oneLiner: string;
  industry: string;
  location: string;
  logoUrl: string;
  websiteUrl: string;
  teamSize: number;
  isHiring: boolean;
  isAiNative: boolean;
  founders: { name: string; slug: string; role: string }[];
}

interface CompanyCardProps {
  company: CompanyData;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export default function CompanyCard({ company, onSelect, isSelected }: CompanyCardProps) {
  const founderNames = company.founders?.map((f) => f.name).join(", ");

  return (
    <button
      onClick={() => onSelect?.(company._id)}
      className={`flex w-full items-center gap-3 border-b border-yc-line-subtle px-4 py-3 text-left transition-colors ${
        isSelected ? "bg-yc-blue-soft" : "hover:bg-yc-hover"
      }`}
    >
      {company.logoUrl ? (
        <img src={company.logoUrl} alt={company.name} className="h-9 w-9 rounded-lg object-contain shrink-0" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yc-focus/10 text-xs font-bold text-yc-focus">
          {company.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-medium text-yc-ink">{company.name}</span>
          {company.isAiNative && (
            <span className="shrink-0 rounded-md bg-yc-purple-soft px-1.5 py-0.5 text-[10px] font-medium text-yc-purple">AI</span>
          )}
          {company.isHiring && (
            <span className="shrink-0 rounded-md bg-yc-green-soft px-1.5 py-0.5 text-[10px] font-medium text-yc-green">Hiring</span>
          )}
        </div>
        <div className="truncate text-xs text-yc-ink-muted">
          {company.oneLiner || company.description || "—"}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-yc-ink-3">
          {company.industry && <span>{company.industry}</span>}
          {company.location && (
            <>
              {company.industry && <span>·</span>}
              <span>{company.location}</span>
            </>
          )}
          {founderNames && (
            <>
              {(company.industry || company.location) && <span>·</span>}
              <span>{founderNames}</span>
            </>
          )}
        </div>
      </div>
      <svg className="h-4 w-4 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
