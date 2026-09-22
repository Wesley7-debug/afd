"use client";

import { useState, useEffect } from "react";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

interface Stats {
  founders: number;
  companies: number;
  crawlJobs: number;
  lastCrawl: {
    pagesCrawled: number;
    foundersDiscovered: number;
    companiesDiscovered: number;
    createdAt: string;
    duration: number;
  } | null;
}

interface CrawlResult {
  ok: boolean;
  crawl?: {
    pagesCrawled: number;
    foundersDiscovered: number;
    companiesDiscovered: number;
    duration: number;
    errors: number;
  };
  totals?: {
    founders: number;
    companies: number;
  };
  error?: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [clearTarget, setClearTarget] = useState<"all" | "founders" | "companies">("all");
  const [clearResult, setClearResult] = useState<string>("");
  const [clearing, setClearing] = useState(false);

  const [maxPages, setMaxPages] = useState(500);
  const [maxDepth, setMaxDepth] = useState(8);
  const [maxConcurrent, setMaxConcurrent] = useState(3);

  useEffect(() => {
    fetch("/admin/api/auth", { method: "GET" })
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setAuthenticated(true);
          loadStats();
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("/admin/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secret: ADMIN_SECRET }),
      });
      const data = await res.json();
      if (data.ok) {
        setAuthenticated(true);
        loadStats();
      } else {
        setAuthError("Invalid email or password");
      }
    } catch {
      setAuthError("Connection failed");
    }
    setLoading(false);
  }

  async function loadStats() {
    try {
      const res = await fetch("/admin/api/crawl", { method: "GET" });
      const data = await res.json();
      if (data.ok) setStats(data.stats);
    } catch {}
  }

  async function handleCrawl() {
    setCrawling(true);
    setCrawlResult(null);
    try {
      const res = await fetch("/admin/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPages, maxDepth, maxConcurrent }),
      });
      const data = await res.json();
      setCrawlResult(data);
      loadStats();
    } catch (err) {
      setCrawlResult({ ok: false, error: String(err) });
    }
    setCrawling(false);
  }

  async function handleClear() {
    if (!confirm(`Delete ALL ${clearTarget} from the database? This cannot be undone.`)) return;
    setClearing(true);
    setClearResult("");
    try {
      const res = await fetch("/admin/api/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: clearTarget }),
      });
      const data = await res.json();
      if (data.ok) {
        const parts = [];
        if (data.deleted.founders) parts.push(`${data.deleted.founders} founders`);
        if (data.deleted.companies) parts.push(`${data.deleted.companies} companies`);
        if (data.deleted.crawlJobs) parts.push(`${data.deleted.crawlJobs} crawl jobs`);
        setClearResult(`Deleted: ${parts.join(", ")}`);
        loadStats();
      } else {
        setClearResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setClearResult(`Error: ${String(err)}`);
    }
    setClearing(false);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-white mb-6">Admin Access</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:outline-none focus:border-amber-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:outline-none focus:border-amber-500"
          />
          {authError && <p className="text-red-400 text-sm mb-4">{authError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <span className="text-zinc-500 text-sm">African Founders</span>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Founders" value={stats.founders} />
            <StatCard label="Companies" value={stats.companies} />
            <StatCard label="Crawl Jobs" value={stats.crawlJobs} />
            <StatCard
              label="Last Crawl"
              value={stats.lastCrawl ? `${stats.lastCrawl.foundersDiscovered} founders` : "None"}
            />
          </div>
        )}

        {/* Crawler Controls */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Run Crawler</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Max Pages</label>
              <input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Max Depth</label>
              <input
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Concurrent</label>
              <input
                type="number"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleCrawl}
            disabled={crawling}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {crawling ? "Crawling... (this may take a while)" : "Start Crawl"}
          </button>

          {crawlResult && (
            <div className={`mt-4 p-4 rounded-lg ${crawlResult.ok ? "bg-emerald-950 border border-emerald-800" : "bg-red-950 border border-red-800"}`}>
              {crawlResult.ok && crawlResult.crawl ? (
                <div className="space-y-1 text-sm">
                  <p className="text-emerald-400 font-medium">Crawl Complete</p>
                  <p className="text-zinc-300">Pages crawled: {crawlResult.crawl.pagesCrawled}</p>
                  <p className="text-zinc-300">Founders discovered: {crawlResult.crawl.foundersDiscovered}</p>
                  <p className="text-zinc-300">Companies discovered: {crawlResult.crawl.companiesDiscovered}</p>
                  <p className="text-zinc-300">Duration: {(crawlResult.crawl.duration / 1000).toFixed(1)}s</p>
                  {crawlResult.crawl.errors > 0 && (
                    <p className="text-amber-400">Errors: {crawlResult.crawl.errors}</p>
                  )}
                  {crawlResult.totals && (
                    <p className="text-zinc-400 mt-2">Total in DB: {crawlResult.totals.founders} founders, {crawlResult.totals.companies} companies</p>
                  )}
                </div>
              ) : (
                <p className="text-red-400">{crawlResult.error}</p>
              )}
            </div>
          )}
        </section>

        {/* Clear Database */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Clear Database</h2>
          <div className="flex items-center gap-4 mb-4">
            <select
              value={clearTarget}
              onChange={(e) => setClearTarget(e.target.value as typeof clearTarget)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All (founders + companies + jobs)</option>
              <option value="founders">Founders only</option>
              <option value="companies">Companies only</option>
            </select>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {clearing ? "Deleting..." : "Delete"}
            </button>
          </div>
          {clearResult && (
            <p className={`text-sm ${clearResult.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
              {clearResult}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
