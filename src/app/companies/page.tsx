"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompanyFilterSidebar from "@/components/CompanyFilterSidebar";
import CompanyDataTable from "@/components/CompanyDataTable";
import CompanyPeek from "@/components/CompanyPeek";
import CompanyCard from "@/components/CompanyCard";
import SearchBar from "@/components/SearchBar";
import ViewSwitcher from "@/components/ViewSwitcher";
import SortDropdown from "@/components/SortDropdown";
import QuickFilters from "@/components/QuickFilters";
import StatsBar from "@/components/StatsBar";
import Pagination from "@/components/Pagination";

const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CompanyData {
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
  tags: string[];
  foundedYear?: number;
  founders: { name: string; slug: string; role: string }[];
  createdAt: string;
}

interface PaginatedResponse {
  companies: CompanyData[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  industries: string[];
  locations: string[];
  countries: string[];
  foundedYears: number[];
  isHiring: boolean;
  isAiNative: boolean;
}

function getCacheKey(params: URLSearchParams): string {
  return `nf_companies_${params.toString()}`;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function CompaniesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [view, setView] = useState("table");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickFilters, setQuickFilters] = useState<Record<string, boolean>>({});

  const [filters, setFilters] = useState<FilterState>({
    industries: [],
    locations: [],
    countries: [],
    foundedYears: [],
    isHiring: false,
    isAiNative: false,
  });

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const urlSort = searchParams.get("sort") || "newest";
  const urlView = searchParams.get("view") || "table";
  const peekId = searchParams.get("peek");

  useEffect(() => {
    setSort(urlSort);
    setView(urlView);
  }, [urlSort, urlView]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (filters.industries.length) params.set("industry", filters.industries.join(","));
    if (filters.locations.length) params.set("location", filters.locations.join(","));
    if (filters.countries.length) params.set("country", filters.countries.join(","));
    if (filters.foundedYears.length) params.set("foundedYear", filters.foundedYears.join(","));
    if (quickFilters.isHiring) params.set("isHiring", "true");
    if (quickFilters.isAiNative) params.set("isAiNative", "true");

    const cacheKey = getCacheKey(params);
    const cached = getCached<PaginatedResponse>(cacheKey);
    if (cached) {
      setCompanies(cached.companies || []);
      setPagination(cached.pagination || null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/companies?${params.toString()}`);
      const data = await res.json();
      setCache(cacheKey, data);
      setCompanies(data.companies || []);
      setPagination(data.pagination || null);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, filters, quickFilters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!peekId) {
      setSelectedCompany(null);
      setSelectedId(null);
      return;
    }
    const company = companies.find((c) => c._id === peekId);
    if (company) {
      setSelectedCompany(company);
      setSelectedId(peekId);
    } else if (peekId) {
      fetch(`/api/companies/${peekId}`)
        .then((r) => r.json())
        .then((data) => {
          setSelectedCompany(data);
          setSelectedId(peekId);
        })
        .catch(() => {});
    }
  }, [peekId, companies]);

  const handleSelect = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (selectedId === id) {
        params.delete("peek");
        setSelectedId(null);
        setSelectedCompany(null);
      } else {
        params.set("peek", id);
      }
      router.push(`/companies?${params.toString()}`, { scroll: false });
    },
    [selectedId, searchParams, router]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/companies?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleSort = useCallback(
    (field: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", field);
      params.delete("page");
      router.push(`/companies?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleViewChange = useCallback(
    (newView: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", newView);
      router.push(`/companies?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleQuickFilterToggle = useCallback((id: string) => {
    setQuickFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1440px] flex-col gap-4 px-8 py-6 max-md:px-4 max-md:py-5">
      <div>
        <h1 className="text-lg font-semibold tracking-[-0.2px] text-yc-ink">
          Company Directory
        </h1>
        <p className="text-sm text-yc-ink-muted">
          Startups and companies founded across Africa.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <SearchBar />
        <ViewSwitcher current={view} onChange={handleViewChange} />
        <SortDropdown value={sort} onChange={handleSort} />
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-1.5 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink hover:bg-yc-hover transition-colors md:hidden"
        >
          <svg className="h-4 w-4 text-yc-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <QuickFilters active={quickFilters} onToggle={handleQuickFilterToggle} />
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] font-medium uppercase tracking-[0.72px] text-yc-ink-3">
            Active
          </span>
          <button className="flex items-center gap-1 rounded-lg border border-dashed border-yc-focus px-2.5 py-1 text-xs font-medium text-yc-focus hover:bg-yc-blue-soft transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add filter
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-yc-line">
        <CompanyFilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={pagination?.total || 0}
          onClose={() => setFiltersOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-yc-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yc-ink">Companies</span>
              {pagination && <StatsBar total={pagination.total} />}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-yc-line border-t-yc-focus" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-yc-ink-muted">No companies found.</p>
              <p className="mt-1 text-xs text-yc-ink-3">
                {search
                  ? "Try a different search term."
                  : "The crawler hasn't discovered any companies yet."}
              </p>
            </div>
          ) : view === "table" ? (
            <div className="flex-1 overflow-y-auto yc-thin-scroll">
              <CompanyDataTable
                companies={companies}
                selectedId={selectedId || undefined}
                onSelect={handleSelect}
                sortField={sort === "newest" ? "name" : sort}
                sortDirection="asc"
                onSort={handleSort}
              />
            </div>
          ) : view === "people" ? (
            <div className="flex-1 overflow-y-auto yc-thin-scroll">
              {companies.map((company) => (
                <CompanyCard
                  key={company._id}
                  company={company}
                  onSelect={handleSelect}
                  isSelected={selectedId === company._id}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 yc-thin-scroll">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((company) => (
                  <CompanyGridCard key={company._id} company={company} />
                ))}
              </div>
            </div>
          )}

          {pagination && (
            <div className="border-t border-yc-line px-4">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        <CompanyPeek
          company={selectedCompany}
          onClose={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("peek");
            router.push(`/companies?${params.toString()}`, { scroll: false });
          }}
        />
      </div>
    </div>
  );
}

function CompanyGridCard({ company }: { company: CompanyData }) {
  const founderNames = company.founders?.map((f) => f.name).join(", ");

  return (
    <a
      href={`/companies/${company.slug}`}
      className="block rounded-xl border border-yc-line bg-yc-surface p-4 transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-yc-line-strong"
    >
      <div className="flex items-start gap-3">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-lg object-contain shrink-0" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yc-focus/10 text-sm font-bold text-yc-focus">
            {company.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-medium text-yc-ink">{company.name}</h3>
            {company.isAiNative && (
              <span className="shrink-0 rounded-md bg-yc-purple-soft px-1.5 py-0.5 text-[10px] font-medium text-yc-purple">AI</span>
            )}
          </div>
          {company.oneLiner && (
            <p className="mt-0.5 line-clamp-2 text-xs text-yc-ink-muted">{company.oneLiner}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-yc-ink-3">
        {company.location && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {company.location}
          </span>
        )}
        {company.industry && (
          <span className="rounded-md bg-yc-subtle px-1.5 py-0.5 font-medium text-yc-ink-muted border border-yc-line-subtle">
            {company.industry}
          </span>
        )}
        {company.teamSize > 0 && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {company.teamSize}
          </span>
        )}
      </div>

      {founderNames && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-yc-ink-muted border-t border-yc-line-subtle pt-2.5">
          <svg className="h-3 w-3 shrink-0 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">{founderNames}</span>
        </div>
      )}
    </a>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yc-line border-t-yc-focus" />
        </div>
      }
    >
      <CompaniesContent />
    </Suspense>
  );
}
