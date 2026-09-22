"use client";

import { useState, useCallback } from "react";
import { FilterFacet, FilterOption } from "./FilterFacet";

const INDUSTRIES = [
  { label: "Fintech", count: 0 },
  { label: "SaaS", count: 0 },
  { label: "AI", count: 0 },
  { label: "E-commerce", count: 0 },
  { label: "Healthtech", count: 0 },
  { label: "Edtech", count: 0 },
  { label: "Logistics", count: 0 },
  { label: "Climate", count: 0 },
  { label: "Media", count: 0 },
  { label: "Agritech", count: 0 },
];

const LOCATIONS = [
  { label: "Lagos", count: 0 },
  { label: "Nairobi", count: 0 },
  { label: "Cape Town", count: 0 },
  { label: "Accra", count: 0 },
  { label: "Cairo", count: 0 },
  { label: "Abuja", count: 0 },
  { label: "Kigali", count: 0 },
  { label: "Dar es Salaam", count: 0 },
];

const COUNTRIES = [
  { label: "Nigeria", count: 0 },
  { label: "Kenya", count: 0 },
  { label: "South Africa", count: 0 },
  { label: "Ghana", count: 0 },
  { label: "Egypt", count: 0 },
  { label: "Rwanda", count: 0 },
  { label: "Ethiopia", count: 0 },
  { label: "Tanzania", count: 0 },
  { label: "Uganda", count: 0 },
  { label: "Senegal", count: 0 },
  { label: "Morocco", count: 0 },
];

const YEAR_OPTIONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

interface FilterState {
  industries: string[];
  locations: string[];
  countries: string[];
  foundedYears: number[];
  isHiring: boolean;
  isAiNative: boolean;
}

interface CompanyFilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  onClose?: () => void;
}

export default function CompanyFilterSidebar({ filters, onFiltersChange, totalResults, onClose }: CompanyFilterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const toggleArrayFilter = useCallback(
    (key: "industries" | "locations" | "countries", value: string) => {
      const current = filters[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFiltersChange({ ...filters, [key]: next });
    },
    [filters, onFiltersChange]
  );

  const toggleYearFilter = useCallback(
    (year: number) => {
      const current = filters.foundedYears || [];
      const next = current.includes(year)
        ? current.filter((y) => y !== year)
        : [...current, year];
      onFiltersChange({ ...filters, foundedYears: next });
    },
    [filters, onFiltersChange]
  );

  const toggleBooleanFilter = useCallback(
    (key: "isHiring" | "isAiNative") => {
      onFiltersChange({ ...filters, [key]: !filters[key] });
    },
    [filters, onFiltersChange]
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({
      industries: [],
      locations: [],
      countries: [],
      foundedYears: [],
      isHiring: false,
      isAiNative: false,
    });
  }, [onFiltersChange]);

  const activeFilterCount =
    (filters.industries?.length || 0) +
    (filters.locations?.length || 0) +
    (filters.countries?.length || 0) +
    (filters.foundedYears?.length || 0) +
    (filters.isHiring ? 1 : 0) +
    (filters.isAiNative ? 1 : 0);

  const filteredIndustries = INDUSTRIES.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLocations = LOCATIONS.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCountries = COUNTRIES.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-[340px] flex-col border-r border-yc-line bg-yc-surface max-md:hidden">
      <div className="flex items-center justify-between border-b border-yc-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-yc-ink">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-yc-focus/10 px-1.5 font-mono text-xs font-medium text-yc-focus shadow-[inset_0_0_0_0.8px_rgba(73,119,240,0.4)]">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-yc-focus hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="relative border-b border-yc-line-subtle px-4 py-2">
        <svg
          className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-yc-ink-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
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
            Company — Classification
          </div>

          <FilterFacet label="Country" count={filteredCountries.length} defaultOpen>
            {filteredCountries.map((c) => (
              <FilterOption
                key={c.label}
                label={c.label}
                optionCount={c.count}
                checked={(filters.countries || []).includes(c.label)}
                onChange={() => toggleArrayFilter("countries", c.label)}
              />
            ))}
          </FilterFacet>

          <FilterFacet label="Industry" count={filteredIndustries.length}>
            {filteredIndustries.map((ind) => (
              <FilterOption
                key={ind.label}
                label={ind.label}
                optionCount={ind.count}
                checked={filters.industries.includes(ind.label)}
                onChange={() => toggleArrayFilter("industries", ind.label)}
              />
            ))}
          </FilterFacet>

          <FilterFacet label="Location" count={filteredLocations.length}>
            {filteredLocations.map((loc) => (
              <FilterOption
                key={loc.label}
                label={loc.label}
                optionCount={loc.count}
                checked={filters.locations.includes(loc.label)}
                onChange={() => toggleArrayFilter("locations", loc.label)}
              />
            ))}
          </FilterFacet>

          <FilterFacet label="Founded Year" count={YEAR_OPTIONS.length}>
            {YEAR_OPTIONS.map((year) => (
              <FilterOption
                key={year}
                label={year.toString()}
                optionCount={0}
                checked={(filters.foundedYears || []).includes(year)}
                onChange={() => toggleYearFilter(year)}
              />
            ))}
          </FilterFacet>

          <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.72px] text-yc-ink-3">
            Company — Other
          </div>
          <FilterFacet label="More" count={2}>
            <FilterOption
              label="Hiring now"
              checked={filters.isHiring}
              onChange={() => toggleBooleanFilter("isHiring")}
            />
            <FilterOption
              label="AI-native"
              checked={filters.isAiNative}
              onChange={() => toggleBooleanFilter("isAiNative")}
            />
          </FilterFacet>
        </div>
      </div>

      {onClose && (
        <div className="border-t border-yc-line p-4 md:hidden">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-yc-ink py-2.5 text-sm font-medium text-white hover:bg-yc-ink/90 transition-colors"
          >
            Show {totalResults} companies
          </button>
        </div>
      )}
    </div>
  );
}
