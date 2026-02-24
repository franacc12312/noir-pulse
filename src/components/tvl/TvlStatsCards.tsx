"use client";

import { useMemo } from "react";
import { formatUsd, formatPercent } from "@/lib/format";

interface TvlDataPoint {
  date: string;
  tvlUsd: number;
}

interface TvlStatsCardsProps {
  data: TvlDataPoint[];
  liveTvl: number | null;
}

export default function TvlStatsCards({ data, liveTvl }: TvlStatsCardsProps) {
  const stats = useMemo(() => {
    const currentTvl = liveTvl ?? (data.length > 0 ? data[data.length - 1].tvlUsd : 0);
    const ath = data.reduce((max, d) => Math.max(max, d.tvlUsd), 0);

    // 7-day change
    let change7d = 0;
    if (data.length > 7) {
      const prev = data[data.length - 8].tvlUsd;
      if (prev > 0) change7d = ((currentTvl - prev) / prev) * 100;
    }

    // 30-day change
    let change30d = 0;
    if (data.length > 30) {
      const prev = data[data.length - 31].tvlUsd;
      if (prev > 0) change30d = ((currentTvl - prev) / prev) * 100;
    }

    return { currentTvl, ath, change7d, change30d };
  }, [data, liveTvl]);

  const cards = [
    {
      label: "Total Value Locked",
      value: formatUsd(stats.currentTvl),
      sub: "Current TVL",
      color: "var(--accent-green)",
    },
    {
      label: "7D Change",
      value: formatPercent(stats.change7d),
      sub: "vs 7 days ago",
      color: stats.change7d >= 0 ? "var(--accent-green)" : "var(--accent-red)",
      textColor: stats.change7d >= 0 ? "text-accent-green" : "text-accent-red",
    },
    {
      label: "30D Change",
      value: formatPercent(stats.change30d),
      sub: "vs 30 days ago",
      color: stats.change30d >= 0 ? "var(--accent-green)" : "var(--accent-red)",
      textColor: stats.change30d >= 0 ? "text-accent-green" : "text-accent-red",
    },
    {
      label: "All-Time High TVL",
      value: formatUsd(stats.ath),
      sub: "Peak TVL",
      color: "var(--accent-purple)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl bg-surface border border-border p-5"
        >
          <div
            className="absolute top-0 left-0 w-full h-[2px]"
            style={{ background: card.color }}
          />
          <p className="text-text-secondary text-sm font-medium mb-2">
            {card.label}
          </p>
          <p className={`text-3xl font-bold tracking-tight ${card.textColor ?? ""}`}>
            {card.value}
          </p>
          <p className="text-text-secondary text-xs mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
