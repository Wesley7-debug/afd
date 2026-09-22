"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const INDUSTRIES = [
  "Fintech", "SaaS", "AI", "E-commerce", "Healthtech", "Edtech",
  "Logistics", "Climate", "Media", "Other",
];

const LOCATIONS = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Other",
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentIndustry = searchParams.get("industry") || "";
  const currentLocation = searchParams.get("location") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentIndustry}
        onChange={(e) => updateFilter("industry", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        <option value="">All Industries</option>
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </select>

      <select
        value={currentLocation}
        onChange={(e) => updateFilter("location", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        <option value="">All Locations</option>
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {(currentIndustry || currentLocation) && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("industry");
            params.delete("location");
            params.delete("page");
            router.push(`/?${params.toString()}`);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
