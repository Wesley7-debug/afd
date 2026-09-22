"use client";

import { useState, useEffect, useCallback } from "react";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

interface RejectionCount {
  reason: string;
  count: number;
}

interface ResumableSource {
  name: string;
  baseUrl: string;
  pagesCrawled: number;
  queueSize: number;
  foundersFound: number;
  companiesFound: number;
  lastSavedAt: string;
}

interface SourceStat {
  name: string;
  baseUrl: string;
  crawlStatus: string;
  pagesDiscovered: number;
  pagesCrawled: number;
  pagesRemaining: number;
  founderCandidates: number;
  foundersDiscovered: number;
  companiesDiscovered: number;
  relationshipsCreated: number;
  relationshipsRejected: number;
  rejectionCounts: RejectionCount[];
  errors: number;
  lastActivityAt: string | null;
  nextCrawlAt: string | null;
}

interface RecentJob {
  _id: string;
  sourceName: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  pagesCrawled: number;
  newFounders: number;
  relationshipsCreated: number;
  relationshipsRejected: number;
  rejectionReasons: RejectionCount[];
  errors: number;
}

interface Stats {
  founders: number;
  companies: number;
  crawlJobs: number;
  totalSources: number;
  runningJobs: number;
  queuedUrls: number;
  completedUrls: number;
  failedUrls: number;
  resumableSources: number;
  resumableList: ResumableSource[];
  crawler: {
    running: boolean;
    workers: number;
    startedAt: string | null;
    ticks: number;
  };
  founderQuality: {
    withSourceSentence: number;
    withEmail: number;
    withX: number;
    withCompany: number;
    hiringTrue: number;
    hiringFalse: number;
    hiringUnknown: number;
  };
  companyQuality: {
    hiringTrue: number;
    hiringFalse: number;
    hiringUnknown: number;
    withHiringEvidence: number;
  };
  relationships: {
    created: number;
    rejected: number;
  };
  recentJobs: RecentJob[];
  sourceStats: SourceStat[];
  lastCrawl: {
    pagesCrawled: number;
    foundersDiscovered: number;
    companiesDiscovered: number;
    createdAt: string;
    status: string;
  } | null;
}

interface CrawlResult {
  ok: boolean;
  message?: string;
  crawl?: {
    pagesCrawled: number;
    foundersDiscovered: number;
    companiesDiscovered: number;
    queued: number;
    crawling: number;
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
  const [statsError, setStatsError] = useState("");
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [clearTarget, setClearTarget] = useState<
    "all" | "founders" | "companies" | "queue"
  >("all");
  const [clearResult, setClearResult] = useState<string>("");
  const [clearing, setClearing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/admin/api/crawl", { method: "GET" });
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats);
        setStatsError("");
        setLastRefresh(new Date());
      } else {
        setStatsError(data.error || "Failed to load stats");
      }
    } catch (err) {
      setStatsError(String(err));
    }
  }, []);

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
  }, [loadStats]);

  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(loadStats, 15000);
    return () => clearInterval(id);
  }, [authenticated, loadStats]);

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
        setAuthError("Invalid credentials");
      }
    } catch {
      setAuthError("Connection failed");
    }
    setLoading(false);
  }

  async function handleCrawl() {
    setCrawling(true);
    setCrawlResult(null);
    try {
      const res = await fetch("/admin/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
    if (
      !confirm(
        `Delete ${clearTarget === "all" ? "ALL data" : clearTarget} from the database? This cannot be undone.`,
      )
    )
      return;
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
        const parts: string[] = [];
        if (data.deleted.founders) parts.push(`${data.deleted.founders} founders`);
        if (data.deleted.companies) parts.push(`${data.deleted.companies} companies`);
        if (data.deleted.crawlJobs) parts.push(`${data.deleted.crawlJobs} jobs`);
        if (data.deleted.queue) parts.push(`${data.deleted.queue} queue urls`);
        if (data.deleted.progress) parts.push(`${data.deleted.progress} progress`);
        setClearResult(
          parts.length ? `Deleted: ${parts.join(", ")}` : "Nothing to delete",
        );
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 w-full max-w-sm"
        >
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-1">
            Admin Access
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Sign in to manage the crawler
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
            {authError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const q = stats?.founderQuality;
  const cq = stats?.companyQuality;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Admin Panel
              </h1>
              <p className="text-xs text-slate-500">
                African Founders · crawler dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-xs text-slate-400">
                refreshed {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadStats}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {statsError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{statsError}</p>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <StatCard label="Founders" value={stats.founders} accent="blue" />
              <StatCard
                label="Linked"
                value={q ? `${q.withCompany}/${stats.founders}` : stats.founders}
                accent="violet"
                sub="founder → company"
              />
              <StatCard
                label="Sources"
                value={stats.totalSources}
                accent="slate"
              />
              <StatCard
                label="Queue"
                value={stats.queuedUrls}
                accent="amber"
                sub={`${stats.runningJobs} crawling`}
                pulse={stats.runningJobs > 0}
              />
              <StatCard
                label="Completed"
                value={stats.completedUrls}
                accent="emerald"
                sub={`${stats.failedUrls} failed`}
              />
              <StatCard
                label="Daemon"
                value={stats.crawler.running ? "Running" : "Stopped"}
                accent={stats.crawler.running ? "emerald" : "amber"}
                sub={`${stats.crawler.workers} workers · ${stats.crawler.ticks} ticks`}
                pulse={stats.crawler.running}
              />
            </div>

            {/* Founder data quality */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Extraction Quality
                  </h2>
                  <p className="text-xs text-slate-500">
                    Strict tri-state hiring · evidence-backed founder links
                  </p>
                </div>
                <button
                  onClick={loadStats}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Reload
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QualityTile
                  label="sourceSentence"
                  value={q?.withSourceSentence ?? 0}
                  total={stats.founders}
                  hint="every founder needs an evidence sentence"
                />
                <QualityTile
                  label="With company"
                  value={q?.withCompany ?? 0}
                  total={stats.founders}
                  hint="explicit founder–company statement"
                />
                <QualityTile
                  label="With email"
                  value={q?.withEmail ?? 0}
                  total={stats.founders}
                />
                <QualityTile
                  label="With X/Twitter"
                  value={q?.withX ?? 0}
                  total={stats.founders}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Founders hiring
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-sm">
                    <span className="text-emerald-600 font-bold">
                      {q?.hiringTrue ?? 0} yes
                    </span>
                    <span className="text-red-500 font-bold">
                      {q?.hiringFalse ?? 0} no
                    </span>
                    <span className="text-slate-400 font-bold">
                      {q?.hiringUnknown ?? 0} unknown
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Companies hiring
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-sm">
                    <span className="text-emerald-600 font-bold">
                      {cq?.hiringTrue ?? 0} yes
                    </span>
                    <span className="text-red-500 font-bold">
                      {cq?.hiringFalse ?? 0} no
                    </span>
                    <span className="text-slate-400 font-bold">
                      {cq?.hiringUnknown ?? 0} unknown
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    hiringEvidence
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {cq?.withHiringEvidence ?? 0}
                    <span className="text-xs font-normal text-slate-400">
                      {" "}
                      of {stats.companies} companies
                    </span>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Relationships
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-sm">
                    <span className="text-emerald-600 font-bold">
                      {stats.relationships.created} created
                    </span>
                    <span className="text-amber-600 font-bold">
                      {stats.relationships.rejected} rejected
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent jobs */}
            {stats.recentJobs.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm overflow-hidden">
                <h2 className="text-base font-semibold text-slate-900 mb-4">
                  Recent Crawl Jobs
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                        <th className="pb-2 pr-4 font-medium">Source</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 pr-4 font-medium">Pages</th>
                        <th className="pb-2 pr-4 font-medium">New founders</th>
                        <th className="pb-2 pr-4 font-medium">Rel +/−</th>
                        <th className="pb-2 pr-4 font-medium">Errors</th>
                        <th className="pb-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentJobs.map((job) => (
                        <tr
                          key={job._id}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-2.5 pr-4 text-slate-900 max-w-[180px] truncate">
                            {job.sourceName}
                          </td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge status={job.status} />
                          </td>
                          <td className="py-2.5 pr-4 text-slate-600">
                            {job.pagesCrawled}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold text-emerald-600">
                            {job.newFounders}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className="text-emerald-600">
                              {job.relationshipsCreated}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="text-amber-600">
                              {job.relationshipsRejected}
                            </span>
                          </td>
                          <td
                            className={`py-2.5 pr-4 ${job.errors > 0 ? "text-red-500 font-medium" : "text-slate-400"}`}
                          >
                            {job.errors}
                          </td>
                          <td className="py-2.5 text-slate-400 text-xs">
                            {new Date(job.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Source stats */}
            {stats.sourceStats.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Sources
                  </h2>
                  <span className="text-xs text-slate-400">
                    {stats.resumableSources} with pending work
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                        <th className="pb-2 pr-4 font-medium">Source</th>
                        <th className="pb-2 pr-4 font-medium">Crawled</th>
                        <th className="pb-2 pr-4 font-medium">Remaining</th>
                        <th className="pb-2 pr-4 font-medium">Founders</th>
                        <th className="pb-2 pr-4 font-medium">Rel +/−</th>
                        <th className="pb-2 pr-4 font-medium">Top rejections</th>
                        <th className="pb-2 pr-4 font-medium">Errors</th>
                        <th className="pb-2 font-medium">Last activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.sourceStats.slice(0, 20).map((s) => (
                        <tr
                          key={s.baseUrl}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-2.5 pr-4">
                            <p className="text-slate-900 font-medium max-w-[160px] truncate">
                              {s.name}
                            </p>
                            <p className="text-slate-400 text-xs max-w-[160px] truncate">
                              {s.baseUrl}
                            </p>
                          </td>
                          <td className="py-2.5 pr-4 text-slate-600">
                            {s.pagesCrawled}
                          </td>
                          <td className="py-2.5 pr-4">
                            {s.pagesRemaining > 0 ? (
                              <span className="text-amber-600 font-medium">
                                {s.pagesRemaining}
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold text-emerald-600">
                            {s.foundersDiscovered}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className="text-emerald-600">
                              {s.relationshipsCreated}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="text-amber-600">
                              {s.relationshipsRejected}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {s.rejectionCounts
                                .slice()
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 2)
                                .map((r) => (
                                  <span
                                    key={r.reason}
                                    title={r.reason}
                                    className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
                                  >
                                    {r.reason} ({r.count})
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td
                            className={`py-2.5 pr-4 ${s.errors > 0 ? "text-red-500 font-medium" : "text-slate-400"}`}
                          >
                            {s.errors}
                          </td>
                          <td className="py-2.5 text-slate-400 text-xs">
                            {s.lastActivityAt
                              ? new Date(s.lastActivityAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Resumable Sources */}
            {stats.resumableSources > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-base font-semibold text-slate-900">
                    Saved Crawl Progress
                  </h2>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                    {stats.resumableSources} source
                    {stats.resumableSources !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {stats.resumableList.map((s, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-medium text-sm truncate">
                          {s.name}
                        </p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">
                          {s.baseUrl}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {s.pagesCrawled}
                          </span>{" "}
                          pages
                        </span>
                        <span className="text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {s.queueSize}
                          </span>{" "}
                          queued
                        </span>
                        <span className="text-emerald-600 font-medium">
                          <span className="font-bold">{s.foundersFound}</span>{" "}
                          founders
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Run Crawler
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enqueue all seed websites · daemon processes continuously
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      stats.crawler.running
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${stats.crawler.running ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                    />
                    daemon {stats.crawler.running ? "running" : "stopped"}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {stats.queuedUrls} queued · {stats.runningJobs} crawling ·{" "}
                    {stats.failedUrls} failed
                  </span>
                </div>

                <button
                  onClick={handleCrawl}
                  disabled={crawling}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                >
                  {crawling ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Enqueuing...
                    </span>
                  ) : (
                    "Enqueue Crawl"
                  )}
                </button>

                {crawlResult && (
                  <div
                    className={`mt-5 p-4 rounded-xl border ${
                      crawlResult.ok
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-red-50 border-red-100"
                    }`}
                  >
                    {crawlResult.ok ? (
                      <div className="space-y-1.5 text-sm">
                        <p className="text-emerald-700 font-semibold">
                          {crawlResult.message || "Crawl enqueued"}
                        </p>
                        {crawlResult.crawl && (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                            <p className="text-slate-600">
                              Queued:{" "}
                              <span className="font-semibold text-slate-900">
                                {crawlResult.crawl.queued}
                              </span>
                            </p>
                            <p className="text-slate-600">
                              Already crawled:{" "}
                              <span className="font-semibold text-slate-900">
                                {crawlResult.crawl.pagesCrawled}
                              </span>
                            </p>
                            <p className="text-slate-600">
                              Founders in DB:{" "}
                              <span className="font-semibold text-emerald-600">
                                {crawlResult.crawl.foundersDiscovered}
                              </span>
                            </p>
                            <p className="text-slate-600">
                              Failed URLs:{" "}
                              <span className="font-semibold text-amber-600">
                                {crawlResult.crawl.errors}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-600 text-sm">
                        {crawlResult.error}
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Clear Database
                    </h2>
                    <p className="text-xs text-slate-500">
                      Permanently delete records
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Target
                    </label>
                    <select
                      value={clearTarget}
                      onChange={(e) =>
                        setClearTarget(e.target.value as typeof clearTarget)
                      }
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                    >
                      <option value="all">All records</option>
                      <option value="founders">Founders only</option>
                      <option value="companies">Companies only</option>
                      <option value="queue">Queue only</option>
                    </select>
                  </div>

                  <button
                    onClick={handleClear}
                    disabled={clearing}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {clearing ? "Deleting..." : "Delete"}
                  </button>

                  {clearResult && (
                    <div
                      className={`p-3 rounded-xl text-sm ${
                        clearResult.startsWith("Error")
                          ? "bg-red-50 border border-red-100 text-red-600"
                          : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                      }`}
                    >
                      {clearResult}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {!stats && !statsError && (
          <p className="text-slate-400 text-sm text-center py-20">
            Loading stats...
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "slate",
  pulse = false,
  sub,
}: {
  label: string;
  value: string | number;
  accent?: "slate" | "blue" | "violet" | "emerald" | "amber";
  pulse?: boolean;
  sub?: string;
}) {
  const accentStyles = {
    slate: "border-l-slate-400",
    blue: "border-l-blue-500",
    violet: "border-l-violet-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  };

  const valueStyles = {
    slate: "text-slate-900",
    blue: "text-blue-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <div
      className={`bg-white border border-slate-200 border-l-4 ${accentStyles[accent]} rounded-xl p-4 shadow-sm`}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <p className={`text-xl font-bold ${valueStyles[accent]}`}>{value}</p>
        {pulse && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function QualityTile({
  label,
  value,
  total,
  hint,
}: {
  label: string;
  value: number;
  total: number;
  hint?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const good = pct >= 90;
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <span
          className={`text-xs font-semibold ${good ? "text-emerald-600" : "text-amber-600"}`}
        >
          {pct}%
        </span>
      </div>
      <p className="text-lg font-bold text-slate-900 mt-1">
        {value}
        <span className="text-xs font-normal text-slate-400"> / {total}</span>
      </p>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${good ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    running: "bg-blue-50 text-blue-700 border-blue-100",
    queued: "bg-slate-50 text-slate-600 border-slate-100",
    failed: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles.queued}`}
    >
      {status}
    </span>
  );
}
