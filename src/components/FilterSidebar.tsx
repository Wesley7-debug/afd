"use client";

import { useState, useCallback, useEffect } from "react";

interface FacetItem {
  label: string;
  count: number;
}

interface Facets {
  industries: FacetItem[];
  locations: FacetItem[];
  roles: FacetItem[];
  countries: FacetItem[];
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

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  onClose?: () => void;
  isOpen?: boolean;
}

const YEAR_OPTIONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function FilterSidebar({ filters, onFiltersChange, totalResults, onClose, isOpen }: FilterSidebarProps) {
  const [facets, setFacets] = useState<Facets>({ industries: [], locations: [], roles: [], countries: [] });
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ country: true, industry: false, location: false, year: false, role: false, more: false });

  useEffect(() => {
    setFacetsLoading(true);
    fetch("/api/facets")
      .then((r) => r.json())
      .then((data: Facets) => {
        setFacets(data);
        setFacetsLoading(false);
      })
      .catch(() => setFacetsLoading(false));
  }, []);

  const toggleArrayFilter = useCallback(
    (key: "industries" | "locations" | "roles" | "countries", value: string) => {
      const current = filters[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFiltersChange({ ...filters, [key]: next });
    },
    [filters, onFiltersChange]
  );

  const toggleYearFilter = useCallback(
    (year: number) => {
      const current = filters.foundedYears;
      const next = current.includes(year)
        ? current.filter((y) => y !== year)
        : [...current, year];
      onFiltersChange({ ...filters, foundedYears: next });
    },
    [filters, onFiltersChange]
  );

  const toggleBooleanFilter = useCallback(
    (key: "hasX" | "isHiring" | "hasBio") => {
      onFiltersChange({ ...filters, [key]: !filters[key] });
    },
    [filters, onFiltersChange]
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({
      industries: [],
      locations: [],
      roles: [],
      countries: [],
      foundedYears: [],
      hasX: false,
      isHiring: false,
      hasBio: false,
    });
  }, [onFiltersChange]);

  const activeFilterCount =
    filters.industries.length +
    filters.locations.length +
    filters.roles.length +
    filters.countries.length +
    filters.foundedYears.length +
    (filters.hasX ? 1 : 0) +
    (filters.isHiring ? 1 : 0) +
    (filters.hasBio ? 1 : 0);

  const filteredIndustries = facets.industries.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLocations = facets.locations.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRoles = facets.roles.filter((r) =>
    r.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCountries = facets.countries.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const content = (
    <>
      <div className="flex items-center justify-between border-b border-yc-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-yc-ink">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-yc-focus/10 px-1.5 font-mono text-xs font-medium text-yc-focus shadow-[inset_0_0_0_0.8px_rgba(73,119,240,0.4)]">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-sm text-yc-focus hover:underline">
              Reset
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="rounded p-1 text-yc-ink-muted hover:text-yc-ink md:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="relative border-b border-yc-line-subtle px-4 py-2">
        <svg className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-yc-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Find a filter"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-yc-line bg-transparent py-1.5 pl-8 pr-3 text-sm text-yc-ink placeholder-yc-ink-3 focus:border-yc-focus focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto yc-thin-scroll">
        <div className="py-1">
          <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.72px] text-yc-ink-3">
            Founder — Profile
          </div>

          <FilterSection
            label="Country"
            count={filteredCountries.length}
            isOpen={openSections.country}
            onToggle={() => toggleSection("country")}
          >
            {facetsLoading ? (
              <div className="px-4 py-2 text-xs text-yc-ink-3">Loading...</div>
            ) : (
              filteredCountries.map((c) => (
                <FilterOptionRow
                  key={c.label}
                  label={c.label}
                  count={c.count}
                  checked={filters.countries.includes(c.label)}
                  onChange={() => toggleArrayFilter("countries", c.label)}
                />
              ))
            )}
          </FilterSection>

          <FilterSection
            label="Industry"
            count={filteredIndustries.length}
            isOpen={openSections.industry}
            onToggle={() => toggleSection("industry")}
          >
            {facetsLoading ? (
              <div className="px-4 py-2 text-xs text-yc-ink-3">Loading...</div>
            ) : (
              filteredIndustries.map((ind) => (
                <FilterOptionRow
                  key={ind.label}
                  label={ind.label}
                  count={ind.count}
                  checked={filters.industries.includes(ind.label)}
                  onChange={() => toggleArrayFilter("industries", ind.label)}
                />
              ))
            )}
          </FilterSection>

          <FilterSection
            label="Location"
            count={filteredLocations.length}
            isOpen={openSections.location}
            onToggle={() => toggleSection("location")}
          >
            {facetsLoading ? (
              <div className="px-4 py-2 text-xs text-yc-ink-3">Loading...</div>
            ) : (
              filteredLocations.map((loc) => (
                <FilterOptionRow
                  key={loc.label}
                  label={loc.label}
                  count={loc.count}
                  checked={filters.locations.includes(loc.label)}
                  onChange={() => toggleArrayFilter("locations", loc.label)}
                />
              ))
            )}
          </FilterSection>

          <FilterSection
            label="Founded Year"
            count={YEAR_OPTIONS.length}
            isOpen={openSections.year}
            onToggle={() => toggleSection("year")}
          >
            {YEAR_OPTIONS.map((year) => (
              <FilterOptionRow
                key={year}
                label={year.toString()}
                count={0}
                checked={filters.foundedYears.includes(year)}
                onChange={() => toggleYearFilter(year)}
              />
            ))}
          </FilterSection>

          <FilterSection
            label="Role"
            count={filteredRoles.length}
            isOpen={openSections.role}
            onToggle={() => toggleSection("role")}
          >
            {facetsLoading ? (
              <div className="px-4 py-2 text-xs text-yc-ink-3">Loading...</div>
            ) : (
              filteredRoles.map((role) => (
                <FilterOptionRow
                  key={role.label}
                  label={role.label}
                  count={role.count}
                  checked={filters.roles.includes(role.label)}
                  onChange={() => toggleArrayFilter("roles", role.label)}
                />
              ))
            )}
          </FilterSection>

          <FilterSection label="More" count={3} isOpen={openSections.more} onToggle={() => toggleSection("more")}>
            <FilterOptionRow
              label="Has bio"
              count={0}
              checked={filters.hasBio}
              onChange={() => toggleBooleanFilter("hasBio")}
            />
            <FilterOptionRow
              label="Has X/Twitter"
              count={0}
              checked={filters.hasX}
              onChange={() => toggleBooleanFilter("hasX")}
            />
            <FilterOptionRow
              label="Hiring"
              count={0}
              checked={filters.isHiring}
              onChange={() => toggleBooleanFilter("isHiring")}
            />
          </FilterSection>
        </div>
      </div>

      {onClose && (
        <div className="border-t border-yc-line p-4 md:hidden">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-yc-ink py-2.5 text-sm font-medium text-white hover:bg-yc-ink/90 transition-colors"
          >
            Show {totalResults} founders
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="hidden md:flex h-full w-[340px] flex-col border-r border-yc-line bg-yc-surface">
        {content}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 flex w-[85vw] max-w-[360px] flex-col bg-yc-surface shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({
  label,
  count,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-yc-line-subtle">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2.5 text-[13px] font-medium text-yc-ink hover:bg-yc-hover transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[11px] text-yc-ink-3">({count})</span>
        </div>
        <svg
          className={`h-4 w-4 text-yc-ink-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-1">{children}</div>}
    </div>
  );
}

function FilterOptionRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 px-4 py-1.5 text-[13px] text-yc-ink hover:bg-yc-hover transition-colors">
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? "border-yc-focus bg-yc-focus text-white"
            : "border-yc-line bg-transparent"
        }`}
      >
        {checked && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && <span className="text-[11px] text-yc-ink-3">{count}</span>}
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
    </label>
  );
}
