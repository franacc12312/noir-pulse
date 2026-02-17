"use client";

import type { Timeframe } from "@/lib/queries";

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (t: Timeframe) => void;
}

const options: { value: Timeframe; label: string }[] = [
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "ALL" },
];

export default function TimeframeSelector({
  value,
  onChange,
}: TimeframeSelectorProps) {
  return (
    <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-surface-elevated text-white"
              : "text-text-secondary hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
