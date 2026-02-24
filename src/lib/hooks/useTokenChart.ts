"use client";

import { useState, useEffect, useCallback } from "react";
import type { TokenChartPoint } from "@/lib/types";

export function useTokenChart(days: number) {
  const [data, setData] = useState<TokenChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/token/chart?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
