"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar";
import DataTable from "@/components/DataTable";
import FounderModal from "@/components/FounderModal";
import FounderCard from "@/components/FounderCard";
import SearchBar from "@/components/SearchBar";
import ViewSwitcher from "@/components/ViewSwitcher";
import SortDropdown from "@/components/SortDropdown";
import QuickFilters from "@/components/QuickFilters";
import StatsBar from "@/components/StatsBar";
import Pagination from "@/components/Pagination";

interface FounderData {
  _id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  location: string;
  country: string;
  industry: string;
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  profileImageUrl: string;
  lastVerifiedAt: string;
  discoveredAt?: string;
  foundedYear?: number;
  isHiring?: boolean;
  companies: { name: string; slug: string; industry: string; logoUrl?: string; teamSize?: number; description?: string; websiteUrl?: string; oneLiner?: string; foundedYear?: number; isHiring?: boolean; country?: string }[];
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
  roles: string[];
  countries: string[];
  foundedYears: number[];
  hasX: boolean;
  isHiring: boolean;
  hasBio: boolean;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [founders, setFounders] = useState<FounderData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFounder, setSelectedFounder] = useState<FounderData | null>(null);
  const [view, setView] = useState("table");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickFilters, setQuickFilters] = useState<Record<string, boolean>>({});
  const [navIndex, setNavIndex] = useState(-1);

  const [filters, setFilters] = useState<FilterState>({
    industries: [],
    locations: [],
    roles: [],
    countries: [],
    foundedYears: [],
    hasX: false,
    isHiring: false,
    hasBio: false,
  });

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("q") || "";
  const urlSort = searchParams.get("sort") || "newest";
  const urlView = searchParams.get("view") || "table";
  const founderId = searchParams.get("founder");
  const urlCountry = searchParams.get("country") || "";
  const urlIndustry = searchParams.get("industry") || "";
  const urlYear = searchParams.get("year") || "";

  const [lastRefresh, setLastRefresh] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("nf_last_refresh");
    return null;
  });

  const newIds = new Set(
    founders
      .filter((f) => f.discoveredAt && lastRefresh && new Date(f.discoveredAt).getTime() > parseInt(lastRefresh, 10))
      .map((f) => f._id)
  );

  useEffect(() => {
    setSort(urlSort);
    setView(urlView);
  }, [urlSort, urlView]);

  useEffect(() => {
    if (urlCountry) {
      setFilters((prev) => ({
        ...prev,
        countries: urlCountry.split(",").filter(Boolean),
      }));
    }
    if (urlIndustry) {
      setFilters((prev) => ({
        ...prev,
        industries: urlIndustry.split(",").filter(Boolean),
      }));
    }
    if (urlYear) {
      setFilters((prev) => ({
        ...prev,
        foundedYears: urlYear.split(",").map(Number).filter(Boolean),
      }));
    }
  }, [urlCountry, urlIndustry, urlYear]);

  const fetchFounders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (filters.industries.length) params.set("industry", filters.industries.join(","));
    if (filters.locations.length) params.set("location", filters.locations.join(","));
    if (filters.roles.length) params.set("role", filters.roles.join(","));
    if (filters.countries.length) params.set("country", filters.countries.join(","));
    if (filters.foundedYears.length) params.set("foundedYear", filters.foundedYears.join(","));
    if (quickFilters.hasX) params.set("hasX", "true");
    if (quickFilters.isHiring) params.set("isHiring", "true");

    try {
      const res = await fetch(`/api/founders?${params.toString()}`);
      const data = await res.json();
      setFounders(data.founders || []);
      setPagination(data.pagination || null);
    } catch {
      setFounders([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, filters, quickFilters]);

  useEffect(() => {
    fetchFounders();
  }, [fetchFounders]);

  useEffect(() => {
    if (!founderId) {
      setSelectedFounder(null);
      setSelectedId(null);
      return;
    }
    const founder = founders.find((f) => f._id === founderId);
    if (founder) {
      setSelectedFounder(founder);
      setSelectedId(founderId);
    } else if (founderId) {
      fetch(`/api/founders/${founderId}`)
        .then((r) => r.json())
        .then((data) => {
          setSelectedFounder(data);
          setSelectedId(founderId);
        })
        .catch(() => {});
    }
  }, [founderId, founders]);

  const handleSelect = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (selectedId === id) {
        params.delete("founder");
        setSelectedId(null);
        setSelectedFounder(null);
      } else {
        params.set("founder", id);
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [selectedId, searchParams, router]
  );

  const handleCloseModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("founder");
    router.push(`/?${params.toString()}`, { scroll: false });
    setSelectedId(null);
    setSelectedFounder(null);
  }, [searchParams, router]);

  const handlePrevFounder = useCallback(() => {
    if (!selectedId || founders.length === 0) return;
    const currentIdx = founders.findIndex((f) => f._id === selectedId);
    if (currentIdx > 0) {
      const prevFounder = founders[currentIdx - 1];
      handleSelect(prevFounder._id);
    }
  }, [selectedId, founders, handleSelect]);

  const handleNextFounder = useCallback(() => {
    if (!selectedId || founders.length === 0) return;
    const currentIdx = founders.findIndex((f) => f._id === selectedId);
    if (currentIdx < founders.length - 1) {
      const nextFounder = founders[currentIdx + 1];
      handleSelect(nextFounder._id);
    }
  }, [selectedId, founders, handleSelect]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleSort = useCallback(
    (field: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", field);
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleViewChange = useCallback(
    (newView: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", newView);
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleQuickFilterToggle = useCallback((id: string) => {
    setQuickFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const navigateUp = useCallback(() => {
    if (founders.length === 0) return;
    const newIndex = navIndex <= 0 ? founders.length - 1 : navIndex - 1;
    setNavIndex(newIndex);
    handleSelect(founders[newIndex]._id);
    const container = scrollContainerRef.current;
    if (container) {
      const row = container.querySelector(`[data-index="${newIndex}"]`);
      row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [founders, navIndex, handleSelect]);

  const navigateDown = useCallback(() => {
    if (founders.length === 0) return;
    const newIndex = navIndex >= founders.length - 1 ? 0 : navIndex + 1;
    setNavIndex(newIndex);
    handleSelect(founders[newIndex]._id);
    const container = scrollContainerRef.current;
    if (container) {
      const row = container.querySelector(`[data-index="${newIndex}"]`);
      row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [founders, navIndex, handleSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (selectedId) return;
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        navigateUp();
      }
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        navigateDown();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateUp, navigateDown, selectedId]);

  const currentFounderIndex = selectedId ? founders.findIndex((f) => f._id === selectedId) : -1;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1440px] flex-col gap-4 px-8 py-6 max-md:px-4 max-md:py-5">
      <div>
        <h1 className="text-lg font-semibold tracking-[-0.2px] text-yc-ink">
          Founder Directory
        </h1>
        <p className="text-sm text-yc-ink-muted">
          Every African founder, filterable by country, industry, role and more.
        </p>
      </div>

      <div className="flex items-center gap-3 max-md:gap-2">
        <div className="flex-1">
          <SearchBar />
        </div>
        <ViewSwitcher current={view} onChange={handleViewChange} />
        <SortDropdown value={sort} onChange={handleSort} />
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-1.5 rounded-lg border border-yc-line bg-yc-surface px-3 py-2 text-sm font-medium text-yc-ink hover:bg-yc-hover transition-colors"
        >
          <svg className="h-4 w-4 text-yc-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="max-md:hidden">Filters</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <QuickFilters active={quickFilters} onToggle={handleQuickFilterToggle} />
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={navigateUp}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-yc-line bg-yc-surface text-yc-ink-muted hover:bg-yc-hover hover:text-yc-ink transition-colors"
            title="Previous (↑ or K)"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={navigateDown}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-yc-line bg-yc-surface text-yc-ink-muted hover:bg-yc-hover hover:text-yc-ink transition-colors"
            title="Next (↓ or J)"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {navIndex >= 0 && founders.length > 0 && (
            <span className="text-[11px] text-yc-ink-3 ml-1">
              {navIndex + 1}/{founders.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-yc-line">
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={pagination?.total || 0}
          onClose={() => setFiltersOpen(false)}
          isOpen={filtersOpen}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-yc-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yc-ink">Founders</span>
              {pagination && <StatsBar total={pagination.total} />}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-yc-line border-t-yc-focus" />
            </div>
          ) : founders.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-yc-ink-muted">No founders found.</p>
              <p className="mt-1 text-xs text-yc-ink-3">
                {search
                  ? "Try a different search term."
                  : "The crawler hasn't discovered any founders yet."}
              </p>
            </div>
          ) : view === "table" ? (
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto yc-thin-scroll">
              <DataTable
                founders={founders}
                selectedId={selectedId || undefined}
                onSelect={handleSelect}
                sortField={sort === "newest" ? "name" : sort}
                sortDirection="asc"
                onSort={handleSort}
                newIds={newIds}
                navIndex={navIndex}
              />
            </div>
          ) : view === "people" ? (
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto yc-thin-scroll">
              {founders.map((founder, i) => (
                <FounderCard
                  key={founder._id}
                  founder={founder}
                  view="people"
                  onSelect={handleSelect}
                  isSelected={selectedId === founder._id}
                  isNew={newIds.has(founder._id)}
                />
              ))}
            </div>
          ) : (
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 yc-thin-scroll">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {founders.map((founder) => (
                  <FounderCard key={founder._id} founder={founder} view="cards" isNew={newIds.has(founder._id)} />
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
      </div>

      {selectedFounder && (
        <FounderModal
          founder={selectedFounder}
          currentIndex={currentFounderIndex >= 0 ? currentFounderIndex : 0}
          totalCount={pagination?.total || founders.length}
          onClose={handleCloseModal}
          onPrev={handlePrevFounder}
          onNext={handleNextFounder}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yc-line border-t-yc-focus" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
