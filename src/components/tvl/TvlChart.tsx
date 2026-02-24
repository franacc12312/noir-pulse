"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { formatUsd } from "@/lib/format";

interface TvlDataPoint {
  date: string;
  tvlUsd: number;
}

interface TvlChartProps {
  data: TvlDataPoint[];
}

const timeframes = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 0 },
];

function TvlTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="bg-surface-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-text-secondary text-xs mb-1">
        {format(parseISO(label), "MMM d, yyyy")}
      </p>
      <p className="text-white font-semibold">{formatUsd(payload[0].value)}</p>
    </div>
  );
}

export default function TvlChart({ data }: TvlChartProps) {
  const [days, setDays] = useState(365);

  const filteredData = useMemo(() => {
    if (days === 0) return data;
    const cutoff = subDays(new Date(), days);
    return data.filter((d) => new Date(d.date) >= cutoff);
  }, [data, days]);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">
          Total Value Locked Over Time
        </h3>
        <div className="flex gap-1 bg-background rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.days}
              onClick={() => setDays(tf.days)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                days === tf.days
                  ? "bg-surface-elevated text-white"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[340px]">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary text-sm">
            No TVL data available. Run{" "}
            <code className="text-accent-salmon mx-1">npm run pipeline:tvl</code>{" "}
            to populate.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(parseISO(v), "MMM yy")}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={(v) => formatUsd(v)}
              />
              <Tooltip content={<TvlTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
              <Area
                type="monotone"
                dataKey="tvlUsd"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#tvlGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e", stroke: "#0a0a0a", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
