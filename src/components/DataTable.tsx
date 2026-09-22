"use client";

import FounderAvatar from "./FounderAvatar";

interface FounderRow {
  _id: string;
  name: string;
  slug: string;
  role: string;
  industry: string;
  location: string;
  xUrl: string;
  discoveredAt?: string;
  companies: { name: string; slug: string; industry: string; logoUrl?: string; teamSize?: number }[];
}

interface DataTableProps {
  founders: FounderRow[];
  selectedId?: string;
  onSelect: (id: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  newIds?: Set<string>;
  navIndex?: number;
}

function SortIcon({ field, currentField, direction }: { field: string; currentField: string; direction: "asc" | "desc" }) {
  if (field !== currentField) {
    return (
      <svg className="h-3.5 w-3.5 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return (
    <svg className={`h-3.5 w-3.5 text-yc-focus transition-transform ${direction === "desc" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

export default function DataTable({ founders, selectedId, onSelect, sortField, sortDirection, onSort, newIds = new Set(), navIndex = -1 }: DataTableProps) {
  const columns = [
    { key: "name", label: "FOUNDER", sortable: true, className: "min-w-[220px] flex-[1.4]" },
    { key: "role", label: "ROLE", sortable: true, className: "w-[120px]" },
    { key: "industry", label: "INDUSTRY", sortable: true, className: "w-[130px]" },
    { key: "location", label: "LOCATION", sortable: true, className: "min-w-[150px] flex-1" },
    { key: "team", label: "TEAM", sortable: true, className: "w-[72px]" },
    { key: "xUrl", label: "X", sortable: false, className: "min-w-[160px] flex-[0.9]" },
  ];

  return (
    <div className="overflow-x-auto yc-thin-scroll">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-yc-line bg-yc-subtle">
            <th className="h-12 w-8 px-2"></th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`h-12 px-3 text-left text-[12px] font-medium uppercase tracking-[-0.1px] text-yc-ink-muted ${col.className}`}
              >
                {col.sortable ? (
                  <button
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1 hover:text-yc-ink transition-colors"
                  >
                    {col.label}
                    <SortIcon field={col.key} currentField={sortField} direction={sortDirection} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {founders.map((founder, index) => {
            const company = founder.companies?.[0];
            const isSelected = selectedId === founder._id;
            const isNavigated = navIndex === index;

            return (
              <tr
                key={founder._id}
                data-index={index}
                onClick={() => onSelect(founder._id)}
                className={`h-[52px] cursor-pointer border-b border-yc-line-subtle transition-colors ${
                  isSelected ? "bg-yc-blue-soft" : isNavigated ? "bg-yc-focus/5" : "hover:bg-yc-hover"
                }`}
              >
                <td className="w-8 px-2">
                  <div className="h-5 w-5 rounded-lg border border-yc-line-strong"></div>
                </td>
                <td className="min-w-[220px] flex-[1.4] px-3">
                  <div className="flex items-center gap-3">
                    <FounderAvatar name={founder.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-medium text-yc-ink">{founder.name}</span>
                        {newIds.has(founder._id) && (
                          <span className="shrink-0 rounded-md bg-yc-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-yc-green">New</span>
                        )}
                      </div>
                      {company && (
                        <div className="flex items-center gap-1 text-[13px] text-yc-ink-muted">
                          <svg className="h-3 w-3 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{company.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="w-[120px] px-3 text-[14px] font-medium text-yc-ink-muted">
                  {founder.role || "—"}
                </td>
                <td className="w-[130px] px-3">
                  {founder.industry ? (
                    <span className="inline-flex items-center gap-1 text-[14px] font-medium text-yc-ink-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {founder.industry}
                    </span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="min-w-[150px] flex-1 px-3">
                  {founder.location ? (
                    <span className="flex items-center gap-1 text-[14px] font-medium text-yc-ink-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{founder.location}</span>
                    </span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="w-[72px] px-3">
                  {company?.teamSize ? (
                    <span className="flex items-center gap-1 text-[14px] font-medium text-yc-ink-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {company.teamSize}
                    </span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="min-w-[160px] flex-[0.9] px-3">
                  {founder.xUrl ? (
                    <a
                      href={founder.xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-yc-line bg-yc-subtle px-2.5 py-1 text-xs font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      @{founder.xUrl.split("/").pop()}
                    </a>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
