"use client";

interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

const QUICK_FILTERS: QuickFilter[] = [
  { id: "hasX", label: "On X", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { id: "isHiring", label: "Hiring now", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "onePerCompany", label: "One per company", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
];

interface QuickFiltersProps {
  active: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export default function QuickFilters({ active, onToggle }: QuickFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto yc-thin-scroll">
      {QUICK_FILTERS.map((filter) => {
        const isActive = active[filter.id] || false;
        return (
          <button
            key={filter.id}
            onClick={() => onToggle(filter.id)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-medium transition-all drop-shadow-[0_1px_1px_rgba(15,23,41,0.05)] ${
              isActive
                ? "border-yc-focus/40 bg-yc-blue-soft text-yc-focus"
                : "border-yc-line bg-yc-surface text-yc-ink-2 hover:bg-yc-hover"
            }`}
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filter.icon} />
            </svg>
            {filter.label}
            {filter.count !== undefined && (
              <span className="font-mono text-[10px] text-yc-ink-3">{filter.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
