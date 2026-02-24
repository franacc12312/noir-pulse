"use client";

import type { TokenData } from "@/lib/types";
import { formatUsd, formatNumber, formatPercent } from "@/lib/format";

interface TokenStatsCardsProps {
  data: TokenData;
}

export default function TokenStatsCards({ data }: TokenStatsCardsProps) {
  const isPositive = data.priceChangePercentage24h >= 0;

  const cards = [
    {
      label: "Price",
      value: formatUsd(data.price),
      sub: `${formatPercent(data.priceChangePercentage24h)} (24h)`,
      color: isPositive ? "var(--accent-green)" : "var(--accent-red)",
      subColor: isPositive ? "text-accent-green" : "text-accent-red",
    },
    {
      label: "Market Cap",
      value: formatUsd(data.marketCap),
      sub: `Rank by market cap`,
      color: "var(--accent-blue)",
      subColor: "text-text-secondary",
    },
    {
      label: "24h Volume",
      value: formatUsd(data.totalVolume),
      sub: data.marketCap > 0
        ? `${((data.totalVolume / data.marketCap) * 100).toFixed(1)}% of market cap`
        : "",
      color: "var(--accent-purple)",
      subColor: "text-text-secondary",
    },
    {
      label: "Circulating Supply",
      value: formatNumber(data.circulatingSupply),
      sub: data.totalSupply
        ? `${((data.circulatingSupply / data.totalSupply) * 100).toFixed(1)}% of total`
        : "Total supply unknown",
      color: "var(--accent-orange)",
      subColor: "text-text-secondary",
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
          <p className="text-3xl font-bold tracking-tight">{card.value}</p>
          <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
