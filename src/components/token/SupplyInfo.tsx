"use client";

import type { TokenData } from "@/lib/types";
import { formatUsd, formatNumber } from "@/lib/format";
import { format, parseISO } from "date-fns";

interface SupplyInfoProps {
  data: TokenData;
}

export default function SupplyInfo({ data }: SupplyInfoProps) {
  const rows = [
    { label: "Circulating Supply", value: formatNumber(data.circulatingSupply) },
    { label: "Total Supply", value: data.totalSupply ? formatNumber(data.totalSupply) : "N/A" },
    { label: "Max Supply", value: data.maxSupply ? formatNumber(data.maxSupply) : "N/A" },
    {
      label: "All-Time High",
      value: formatUsd(data.ath),
      sub: data.athDate ? format(parseISO(data.athDate), "MMM d, yyyy") : undefined,
    },
    {
      label: "All-Time Low",
      value: formatUsd(data.atl),
      sub: data.atlDate ? format(parseISO(data.atlDate), "MMM d, yyyy") : undefined,
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Supply & Historical
      </h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <span className="text-text-secondary text-sm">{row.label}</span>
            <div className="text-right">
              <span className="text-sm font-medium text-white">{row.value}</span>
              {row.sub && (
                <p className="text-xs text-text-secondary">{row.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
