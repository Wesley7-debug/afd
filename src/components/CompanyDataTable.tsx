"use client";

interface CompanyRow {
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
  batch: string;
  founders: { name: string; slug: string; role: string }[];
}

interface CompanyDataTableProps {
  companies: CompanyRow[];
  selectedId?: string;
  onSelect: (id: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
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

export default function CompanyDataTable({ companies, selectedId, onSelect, sortField, sortDirection, onSort }: CompanyDataTableProps) {
  const columns = [
    { key: "name", label: "COMPANY", sortable: true, className: "min-w-[250px] flex-[1.5]" },
    { key: "industry", label: "INDUSTRY", sortable: true, className: "w-[130px]" },
    { key: "location", label: "LOCATION", sortable: true, className: "min-w-[150px] flex-1" },
    { key: "team", label: "TEAM", sortable: true, className: "w-[80px]" },
    { key: "founders", label: "FOUNDERS", sortable: false, className: "min-w-[180px] flex-[1.2]" },
    { key: "website", label: "WEBSITE", sortable: false, className: "min-w-[120px]" },
  ];

  return (
    <div className="overflow-x-auto yc-thin-scroll">
      <table className="w-full min-w-[900px]">
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
          {companies.map((company) => {
            const isSelected = selectedId === company._id;
            const founderNames = company.founders?.map((f) => f.name).join(", ");

            return (
              <tr
                key={company._id}
                onClick={() => onSelect(company._id)}
                className={`h-[52px] cursor-pointer border-b border-yc-line-subtle transition-colors ${
                  isSelected ? "bg-yc-blue-soft" : "hover:bg-yc-hover"
                }`}
              >
                <td className="w-8 px-2">
                  <div className="h-5 w-5 rounded-lg border border-yc-line-strong"></div>
                </td>
                <td className="min-w-[250px] flex-[1.5] px-3">
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-8 w-8 rounded-lg object-contain shrink-0" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yc-focus/10 text-xs font-bold text-yc-focus">
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[15px] font-medium text-yc-ink">{company.name}</span>
                        {company.isAiNative && (
                          <span className="shrink-0 rounded-md bg-yc-purple-soft px-1.5 py-0.5 text-[10px] font-medium text-yc-purple">AI</span>
                        )}
                      </div>
                      <div className="truncate text-[13px] text-yc-ink-muted">
                        {company.oneLiner || company.description || "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="w-[130px] px-3">
                  {company.industry ? (
                    <span className="inline-flex items-center gap-1 text-[14px] font-medium text-yc-ink-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {company.industry}
                    </span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="min-w-[150px] flex-1 px-3">
                  {company.location ? (
                    <span className="flex items-center gap-1 text-[14px] font-medium text-yc-ink-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{company.location}</span>
                    </span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="w-[80px] px-3">
                  {company.teamSize > 0 ? (
                    <span className="flex items-center gap-1 text-[14px] font-medium text-yc-ink-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {company.teamSize}
                    </span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="min-w-[180px] flex-[1.2] px-3">
                  {founderNames ? (
                    <span className="truncate text-[14px] text-yc-ink-muted">{founderNames}</span>
                  ) : (
                    <span className="text-yc-ink-3">—</span>
                  )}
                </td>
                <td className="min-w-[120px] px-3">
                  {company.websiteUrl ? (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-yc-line bg-yc-subtle px-2.5 py-1 text-xs font-medium text-yc-ink-2 hover:bg-yc-hover transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Website
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
