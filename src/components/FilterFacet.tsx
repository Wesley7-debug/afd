"use client";

import { useState } from "react";

interface FilterFacetProps {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function FilterFacet({ label, count, defaultOpen = false, children }: FilterFacetProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-yc-line-subtle">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between px-4 text-sm font-medium text-yc-ink hover:bg-yc-hover transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {label}
          {count !== undefined && (
            <span className="font-mono text-xs text-yc-ink-3">{count}</span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-yc-ink-3 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

interface FilterOptionProps {
  label: string;
  optionCount?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FilterOption({ label, optionCount, checked, onChange }: FilterOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-yc-ink-2 hover:text-yc-ink transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-yc-line-strong text-yc-focus focus:ring-yc-focus/40"
      />
      <span className="flex-1 truncate">{label}</span>
      {optionCount !== undefined && (
        <span className="font-mono text-xs text-yc-ink-3">{optionCount}</span>
      )}
    </label>
  );
}

interface FilterRangeProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function FilterRange({ label, min, max, value, onChange }: FilterRangeProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-yc-ink-3">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
        className="w-full accent-yc-focus"
      />
    </div>
  );
}
