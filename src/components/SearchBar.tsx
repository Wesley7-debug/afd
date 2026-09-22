"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("omnibox")?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [query, router, searchParams]
  );

  return (
    <form onSubmit={handleSearch} className="relative flex-1">
      <div className="relative flex items-center rounded-lg border border-yc-line bg-yc-surface">
        <svg
          className="absolute left-3 h-4 w-4 text-yc-ink-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="omnibox"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search founders, companies, industries, locations..."
          className="w-full bg-transparent py-2 pl-9 pr-16 text-sm text-yc-ink placeholder-yc-ink-3 focus:outline-none"
          role="combobox"
          aria-autocomplete="list"
        />
        <kbd className="absolute right-3 hidden items-center gap-0.5 rounded border border-yc-line bg-yc-subtle px-1.5 py-0.5 text-[10px] font-medium text-yc-ink-3 sm:inline-flex">
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
