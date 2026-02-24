"use client";

import { useState, useEffect, useRef } from "react";
import TvlStatsCards from "@/components/tvl/TvlStatsCards";
import TvlChart from "@/components/tvl/TvlChart";

interface TvlDataPoint {
  date: string;
  tvlUsd: number;
}

interface TvlTabProps {
  tvlHistory: TvlDataPoint[];
}

export default function TvlTab({ tvlHistory }: TvlTabProps) {
  const [liveTvl, setLiveTvl] = useState<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let interval: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const res = await fetch("/api/tvl");
        if (!res.ok) return;
        const json = await res.json();
        if (json.tvl && mountedRef.current) setLiveTvl(json.tvl);
      } catch {
        // silently fail, use historical data
      }
    }

    // Use setTimeout for initial fetch to avoid sync setState in effect
    const timeout = setTimeout(() => {
      poll();
      interval = setInterval(poll, 5 * 60_000); // poll every 5min
    }, 0);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <TvlStatsCards data={tvlHistory} liveTvl={liveTvl} />
      <TvlChart data={tvlHistory} />
    </div>
  );
}
