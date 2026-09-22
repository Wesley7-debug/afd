"use client";

import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Recently added" },
  { value: "name", label: "Name A–Z" },
  { value: "industry", label: "Industry" },
  { value: "location", label: "Location" },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || "Sort";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink hover:bg-yc-hover transition-colors"
        aria-haspopup="menu"
      >
        <svg className="h-3.5 w-3.5 text-yc-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <span className="max-md:hidden">Sort</span>
        <span className="text-sm font-medium max-md:hidden">{currentLabel}</span>
        <svg className={`h-4 w-4 text-yc-ink-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-yc-line bg-yc-surface py-1 shadow-lg">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${
                value === option.value
                  ? "bg-yc-subtle font-medium text-yc-ink"
                  : "text-yc-ink-2 hover:bg-yc-hover"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
