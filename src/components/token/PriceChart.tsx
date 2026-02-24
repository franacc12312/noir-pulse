"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useTokenChart } from "@/lib/hooks/useTokenChart";
import { formatUsd } from "@/lib/format";
import { SkeletonChart } from "@/components/ui/Skeleton";

const timeframes = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

function PriceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { timestamp: number } }[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-text-secondary text-xs mb-1">
        {format(new Date(payload[0].payload.timestamp), "MMM d, yyyy HH:mm")}
      </p>
      <p className="text-white font-semibold">{formatUsd(payload[0].value)}</p>
    </div>
  );
}

export default function PriceChart() {
  const [days, setDays] = useState(7);
  const { data, loading } = useTokenChart(days);

  if (loading && data.length === 0) return <SkeletonChart />;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">Price</h3>
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
      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary text-sm">
            No price data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) =>
                  days <= 7
                    ? format(new Date(v), "MMM d")
                    : format(new Date(v), "MMM yy")
                }
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
                width={55}
                tickFormatter={(v) => formatUsd(v)}
              />
              <Tooltip content={<PriceTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#priceGradient)"
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
