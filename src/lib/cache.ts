"use client";

import { useState, useEffect, useCallback } from "react";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useDataCache<T>(key: string, fetcher: () => Promise<T>): {
  data: T | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    try {
      if (!force) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached);
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            setData(entry.data);
            setLoading(false);
            return;
          }
        }
      }

      const freshData = await fetcher();
      const entry: CacheEntry<T> = { data: freshData, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(entry));
      setData(freshData);
    } catch {
      const cached = localStorage.getItem(key);
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached);
        setData(entry.data);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    localStorage.removeItem(key);
    await load(true);
  }, [key, load]);

  return { data, loading, refresh };
}
