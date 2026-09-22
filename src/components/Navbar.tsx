"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nf_last_refresh");
    }
    return null;
  });

  const isStale = (() => {
    if (!lastRefresh) return true;
    const elapsed = Date.now() - parseInt(lastRefresh, 10);
    return elapsed > 24 * 60 * 60 * 1000;
  })();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      localStorage.removeItem("nf_founders_cache");
      localStorage.removeItem("nf_companies_cache");
      localStorage.removeItem("nf_last_refresh");
      localStorage.setItem("nf_last_refresh", Date.now().toString());
      setLastRefresh(Date.now().toString());
      router.refresh();
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [router]);

  return (
    <header className="sticky top-0 z-50 border-b border-yc-line bg-yc-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between px-8 max-md:px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-yc-ink tracking-[-0.1px]">
            African Founders
          </Link>
          <nav className="flex items-center gap-5 text-[13px]">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === "/"
                  ? "font-medium text-yc-ink"
                  : "text-yc-ink-muted hover:text-yc-ink"
              }`}
            >
              Directory
            </Link>
            <Link
              href="/companies"
              className={`transition-colors ${
                pathname === "/companies"
                  ? "font-medium text-yc-ink"
                  : "text-yc-ink-muted hover:text-yc-ink"
              }`}
            >
              Companies
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-yc-line bg-yc-surface px-2.5 py-1.5 text-xs font-medium text-yc-ink-muted hover:bg-yc-hover hover:text-yc-ink transition-colors disabled:opacity-50"
            title={isStale ? "Data is stale (older than 24h). Click to refresh." : "Refresh data"}
          >
            <svg
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="max-md:hidden">Refresh</span>
          </button>

          <a
            href="https://x.com/slycodez"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-yc-ink-3 hover:text-yc-ink transition-colors"
          >
            Made by <span className="font-medium text-yc-ink-muted hover:text-yc-ink">slycodez</span>
          </a>
        </div>
      </div>
    </header>
  );
}
