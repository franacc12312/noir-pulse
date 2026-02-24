"use client";

import type { NetworkData } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface NetworkStatsCardsProps {
  data: NetworkData;
}

export default function NetworkStatsCards({ data }: NetworkStatsCardsProps) {
  const statusColor =
    data.status === "synced"
      ? "var(--accent-green)"
      : data.status === "syncing"
        ? "var(--accent-orange)"
        : "var(--accent-red)";

  const statusLabel =
    data.status === "synced"
      ? "Synced"
      : data.status === "syncing"
        ? "Syncing"
        : "Unavailable";

  const cards = [
    {
      label: "Block Height",
      value: formatNumber(data.blockHeight),
      sub: "Latest block",
      color: "var(--accent-blue)",
    },
    {
      label: "Proven Block",
      value: formatNumber(data.provenBlockHeight),
      sub: "Latest proven block",
      color: "var(--accent-purple)",
    },
    {
      label: "Finality Gap",
      value: formatNumber(data.finalityGap),
      sub: "Blocks behind tip",
      color: data.finalityGap <= 5 ? "var(--accent-green)" : "var(--accent-orange)",
    },
    {
      label: "Status",
      value: statusLabel,
      sub: "Network sync status",
      color: statusColor,
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
          <p className="text-text-secondary text-xs mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
