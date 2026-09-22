"use client";

const views = [
  { id: "table", label: "Table", icon: "M4 6h16M4 12h16M4 18h16" },
  { id: "cards", label: "Cards", icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" },
  { id: "people", label: "People", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

interface ViewSwitcherProps {
  current: string;
  onChange: (view: string) => void;
}

export default function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center rounded-lg border border-yc-line bg-yc-subtle p-0.5" role="radiogroup" aria-label="View">
      {views.map((view) => (
        <button
          key={view.id}
          role="radio"
          aria-checked={current === view.id}
          onClick={() => onChange(view.id)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            current === view.id
              ? "bg-yc-surface text-yc-ink shadow-sm"
              : "text-yc-ink-muted hover:text-yc-ink"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={view.icon} />
          </svg>
          <span className="max-md:sr-only">{view.label}</span>
        </button>
      ))}
    </div>
  );
}
