"use client";

import { useState, useEffect, useCallback } from "react";
import type { NetworkData } from "@/lib/types";

interface NetworkState {
  data: NetworkData | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
}

export function useNetworkData() {
  const [state, setState] = useState<NetworkState>({
    data: null,
    loading: true,
    error: null,
    notConfigured: false,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/network");
      const json = await res.json();

      if (json.error === "not_configured") {
        setState({ data: null, loading: false, error: null, notConfigured: true });
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || "Failed to fetch network data");
      }

      setState({ data: json, loading: false, error: null, notConfigured: false });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15_000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
