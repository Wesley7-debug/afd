// "use client";

// import { useState, useEffect } from "react";

// const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

// interface ResumableSource {
//   name: string;
//   baseUrl: string;
//   pagesCrawled: number;
//   queueSize: number;
//   foundersFound: number;
//   companiesFound: number;
//   lastSavedAt: string;
// }

// interface Stats {
//   founders: number;
//   companies: number;
//   crawlJobs: number;
//   totalSources: number;
//   runningJobs: number;
//   resumableSources: number;
//   resumableList: ResumableSource[];
//   lastCrawl: {
//     pagesCrawled: number;
//     foundersDiscovered: number;
//     companiesDiscovered: number;
//     createdAt: string;
//     status: string;
//   } | null;
// }

// interface CrawlResult {
//   ok: boolean;
//   crawl?: {
//     pagesCrawled: number;
//     foundersDiscovered: number;
//     companiesDiscovered: number;
//     duration: number;
//     errors: number;
//   };
//   totals?: {
//     founders: number;
//     companies: number;
//   };
//   resumableSources?: number;
//   error?: string;
// }

// export default function AdminPage() {
//   const [authenticated, setAuthenticated] = useState(false);
//   const [email, setEmail] = useState("");
//   const [authError, setAuthError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [stats, setStats] = useState<Stats | null>(null);
//   const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
//   const [crawling, setCrawling] = useState(false);
//   const [clearTarget, setClearTarget] = useState<"all" | "founders" | "companies">("all");
//   const [clearResult, setClearResult] = useState<string>("");
//   const [clearing, setClearing] = useState(false);

//   const [maxPages, setMaxPages] = useState(500);
//   const [maxDepth, setMaxDepth] = useState(8);
//   const [maxConcurrent, setMaxConcurrent] = useState(3);

//   useEffect(() => {
//     fetch("/admin/api/auth", { method: "GET" })
//       .then((r) => r.json())
//       .then((d) => {
//         if (d.authenticated) {
//           setAuthenticated(true);
//           loadStats();
//         }
//       })
//       .catch(() => {});
//   }, []);

//   async function handleLogin(e: React.FormEvent) {
//     e.preventDefault();
//     setAuthError("");
//     setLoading(true);
//     try {
//       const res = await fetch("/admin/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, secret: ADMIN_SECRET }),
//       });
//       const data = await res.json();
//       if (data.ok) {
//         setAuthenticated(true);
//         loadStats();
//       } else {
//         setAuthError("Invalid credentials");
//       }
//     } catch {
//       setAuthError("Connection failed");
//     }
//     setLoading(false);
//   }

//   async function loadStats() {
//     try {
//       const res = await fetch("/admin/api/crawl", { method: "GET" });
//       const data = await res.json();
//       if (data.ok) setStats(data.stats);
//     } catch {}
//   }

//   async function handleCrawl() {
//     setCrawling(true);
//     setCrawlResult(null);
//     try {
//       const res = await fetch("/admin/api/crawl", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ maxPages, maxDepth, maxConcurrent }),
//       });
//       const data = await res.json();
//       setCrawlResult(data);
//       loadStats();
//     } catch (err) {
//       setCrawlResult({ ok: false, error: String(err) });
//     }
//     setCrawling(false);
//   }

//   async function handleClear() {
//     if (!confirm(`Delete ALL ${clearTarget} from the database? This cannot be undone.`)) return;
//     setClearing(true);
//     setClearResult("");
//     try {
//       const res = await fetch("/admin/api/clear", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ collection: clearTarget }),
//       });
//       const data = await res.json();
//       if (data.ok) {
//         const parts = [];
//         if (data.deleted.founders) parts.push(`${data.deleted.founders} founders`);
//         if (data.deleted.companies) parts.push(`${data.deleted.companies} companies`);
//         if (data.deleted.crawlJobs) parts.push(`${data.deleted.crawlJobs} crawl jobs`);
//         setClearResult(`Deleted: ${parts.join(", ")}`);
//         loadStats();
//       } else {
//         setClearResult(`Error: ${data.error}`);
//       }
//     } catch (err) {
//       setClearResult(`Error: ${String(err)}`);
//     }
//     setClearing(false);
//   }

//   if (!authenticated) {
//     return (
//       <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
//         <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-sm">
//           <h1 className="text-xl font-bold text-white mb-6">Admin Access</h1>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email"
//             required
//             className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:outline-none focus:border-amber-500"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             required
//             className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:outline-none focus:border-amber-500"
//           />
//           {authError && <p className="text-red-400 text-sm mb-4">{authError}</p>}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:opacity-50"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-zinc-950 text-white">
//       <div className="max-w-5xl mx-auto px-6 py-12">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-2xl font-bold">Admin Panel</h1>
//           <span className="text-zinc-500 text-sm">African Founders</span>
//         </div>

//         {/* Stats */}
//         {stats && (
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
//             <StatCard label="Founders" value={stats.founders} />
//             <StatCard label="Companies" value={stats.companies} />
//             <StatCard label="Sources" value={`${stats.totalSources}`} />
//             <StatCard label="Running" value={stats.runningJobs} highlight={stats.runningJobs > 0} />
//             <StatCard
//               label="Last Crawl"
//               value={stats.lastCrawl ? `${stats.lastCrawl.foundersDiscovered} founders` : "None"}
//             />
//           </div>
//         )}

//         {/* Crawl State / Resumable Sources */}
//         {stats && stats.resumableSources > 0 && (
//           <section className="bg-zinc-900 border border-amber-800/50 rounded-xl p-6 mb-8">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
//               <h2 className="text-lg font-semibold text-amber-400">
//                 Saved Crawl Progress ({stats.resumableSources} source{stats.resumableSources !== 1 ? "s" : ""})
//               </h2>
//             </div>
//             <p className="text-zinc-400 text-sm mb-4">
//               These sources were interrupted and have saved state. They will resume automatically when you start a crawl.
//             </p>
//             <div className="space-y-2">
//               {stats.resumableList.map((s, i) => (
//                 <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
//                   <div className="flex-1 min-w-0">
//                     <p className="text-white font-medium truncate">{s.name}</p>
//                     <p className="text-zinc-500 text-xs truncate">{s.baseUrl}</p>
//                   </div>
//                   <div className="flex items-center gap-4 ml-4 text-sm">
//                     <span className="text-zinc-400">{s.pagesCrawled} pages crawled</span>
//                     <span className="text-zinc-400">{s.queueSize} queued</span>
//                     <span className="text-emerald-400">{s.foundersFound} founders</span>
//                     <span className="text-blue-400">{s.companiesFound} companies</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* Crawler Controls */}
//         <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
//           <h2 className="text-lg font-semibold mb-4">Run Crawler</h2>
//           <p className="text-zinc-400 text-sm mb-4">
//             Crawls ALL seed websites. Each site gets 3 minutes. Interrupted crawls resume automatically.
//           </p>
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div>
//               <label className="block text-sm text-zinc-400 mb-1">Max Pages/Site</label>
//               <input
//                 type="number"
//                 value={maxPages}
//                 onChange={(e) => setMaxPages(Number(e.target.value))}
//                 className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-zinc-400 mb-1">Max Depth</label>
//               <input
//                 type="number"
//                 value={maxDepth}
//                 onChange={(e) => setMaxDepth(Number(e.target.value))}
//                 className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-zinc-400 mb-1">Concurrent</label>
//               <input
//                 type="number"
//                 value={maxConcurrent}
//                 onChange={(e) => setMaxConcurrent(Number(e.target.value))}
//                 className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
//               />
//             </div>
//           </div>

//           <button
//             onClick={handleCrawl}
//             disabled={crawling}
//             className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
//           >
//             {crawling ? "Crawling... (this may take a while)" : "Start Crawl"}
//           </button>

//           {crawlResult && (
//             <div className={`mt-4 p-4 rounded-lg ${crawlResult.ok ? "bg-emerald-950 border border-emerald-800" : "bg-red-950 border border-red-800"}`}>
//               {crawlResult.ok && crawlResult.crawl ? (
//                 <div className="space-y-1 text-sm">
//                   <p className="text-emerald-400 font-medium">Crawl Complete</p>
//                   <p className="text-zinc-300">Pages crawled: {crawlResult.crawl.pagesCrawled}</p>
//                   <p className="text-zinc-300">Founders discovered: {crawlResult.crawl.foundersDiscovered}</p>
//                   <p className="text-zinc-300">Companies discovered: {crawlResult.crawl.companiesDiscovered}</p>
//                   <p className="text-zinc-300">Duration: {(crawlResult.crawl.duration / 1000).toFixed(1)}s</p>
//                   {crawlResult.crawl.errors > 0 && (
//                     <p className="text-amber-400">Errors: {crawlResult.crawl.errors}</p>
//                   )}
//                   {crawlResult.resumableSources !== undefined && crawlResult.resumableSources > 0 && (
//                     <p className="text-amber-400">{crawlResult.resumableSources} source(s) saved progress for next run</p>
//                   )}
//                   {crawlResult.totals && (
//                     <p className="text-zinc-400 mt-2">Total in DB: {crawlResult.totals.founders} founders, {crawlResult.totals.companies} companies</p>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-red-400">{crawlResult.error}</p>
//               )}
//             </div>
//           )}
//         </section>

//         {/* Clear Database */}
//         <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
//           <h2 className="text-lg font-semibold mb-4">Clear Database</h2>
//           <div className="flex items-center gap-4 mb-4">
//             <select
//               value={clearTarget}
//               onChange={(e) => setClearTarget(e.target.value as typeof clearTarget)}
//               className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
//             >
//               <option value="all">All (founders + companies + jobs)</option>
//               <option value="founders">Founders only</option>
//               <option value="companies">Companies only</option>
//             </select>
//             <button
//               onClick={handleClear}
//               disabled={clearing}
//               className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
//             >
//               {clearing ? "Deleting..." : "Delete"}
//             </button>
//           </div>
//           {clearResult && (
//             <p className={`text-sm ${clearResult.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
//               {clearResult}
//             </p>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
//   return (
//     <div className={`bg-zinc-900 border rounded-lg p-4 ${highlight ? "border-amber-700" : "border-zinc-800"}`}>
//       <p className="text-zinc-500 text-sm">{label}</p>
//       <p className={`text-2xl font-bold ${highlight ? "text-amber-400" : "text-white"}`}>{value}</p>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

interface ResumableSource {
  name: string;
  baseUrl: string;
  pagesCrawled: number;
  queueSize: number;
  foundersFound: number;
  companiesFound: number;
  lastSavedAt: string;
}

interface Stats {
  founders: number;
  companies: number;
  crawlJobs: number;
  totalSources: number;
  runningJobs: number;
  resumableSources: number;
  resumableList: ResumableSource[];
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
  resumableSources?: number;
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
  const [clearTarget, setClearTarget] = useState<
    "all" | "founders" | "companies"
  >("all");
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
        setAuthError("Invalid credentials");
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
    if (
      !confirm(
        `Delete ALL ${clearTarget} from the database? This cannot be undone.`,
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
        const parts = [];
        if (data.deleted.founders)
          parts.push(`${data.deleted.founders} founders`);
        if (data.deleted.companies)
          parts.push(`${data.deleted.companies} companies`);
        if (data.deleted.crawlJobs)
          parts.push(`${data.deleted.crawlJobs} crawl jobs`);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
              <p className="text-xs text-slate-500">African Founders</p>
            </div>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Founders" value={stats.founders} accent="blue" />
            <StatCard
              label="Companies"
              value={stats.companies}
              accent="violet"
            />
            <StatCard
              label="Sources"
              value={stats.totalSources}
              accent="slate"
            />
            <StatCard
              label="Running"
              value={stats.runningJobs}
              accent={stats.runningJobs > 0 ? "amber" : "slate"}
              pulse={stats.runningJobs > 0}
            />
            <StatCard
              label="Last Crawl"
              value={
                stats.lastCrawl
                  ? `${stats.lastCrawl.foundersDiscovered} found`
                  : "None"
              }
              accent="emerald"
            />
          </div>
        )}

        {/* Resumable Sources */}
        {stats && stats.resumableSources > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
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
            <p className="text-slate-500 text-sm mb-5">
              These sources were interrupted and have saved state. They will
              resume automatically when you start a crawl.
            </p>
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
                    <span className="text-blue-600 font-medium">
                      <span className="font-bold">{s.companiesFound}</span>{" "}
                      companies
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Crawler Controls - spans 2 cols */}
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
                  Crawl all seed websites
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-sm mb-5">
              Each site gets 3 minutes. Interrupted crawls resume automatically.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Max Pages/Site
                </label>
                <input
                  type="number"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Max Depth
                </label>
                <input
                  type="number"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Concurrent
                </label>
                <input
                  type="number"
                  value={maxConcurrent}
                  onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>
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
                  Crawling...
                </span>
              ) : (
                "Start Crawl"
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
                {crawlResult.ok && crawlResult.crawl ? (
                  <div className="space-y-1.5 text-sm">
                    <p className="text-emerald-700 font-semibold flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Crawl Complete
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3">
                      <p className="text-slate-600">
                        Pages:{" "}
                        <span className="font-semibold text-slate-900">
                          {crawlResult.crawl.pagesCrawled}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        Founders:{" "}
                        <span className="font-semibold text-emerald-600">
                          {crawlResult.crawl.foundersDiscovered}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        Companies:{" "}
                        <span className="font-semibold text-blue-600">
                          {crawlResult.crawl.companiesDiscovered}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        Duration:{" "}
                        <span className="font-semibold text-slate-900">
                          {(crawlResult.crawl.duration / 1000).toFixed(1)}s
                        </span>
                      </p>
                    </div>
                    {crawlResult.crawl.errors > 0 && (
                      <p className="text-amber-600 text-xs mt-2">
                        Errors: {crawlResult.crawl.errors}
                      </p>
                    )}
                    {crawlResult.resumableSources !== undefined &&
                      crawlResult.resumableSources > 0 && (
                        <p className="text-amber-600 text-xs">
                          {crawlResult.resumableSources} source(s) saved
                          progress for next run
                        </p>
                      )}
                    {crawlResult.totals && (
                      <p className="text-slate-500 text-xs mt-2 pt-2 border-t border-emerald-100">
                        Total in DB: {crawlResult.totals.founders} founders,{" "}
                        {crawlResult.totals.companies} companies
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">{crawlResult.error}</p>
                )}
              </div>
            )}
          </section>

          {/* Clear Database */}
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
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "slate",
  pulse = false,
}: {
  label: string;
  value: string | number;
  accent?: "slate" | "blue" | "violet" | "emerald" | "amber";
  pulse?: boolean;
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
        <p className={`text-2xl font-bold ${valueStyles[accent]}`}>{value}</p>
        {pulse && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>
    </div>
  );
}
