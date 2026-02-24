"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useTokenChart } from "@/lib/hooks/useTokenChart";
import { formatUsd } from "@/lib/format";
import { SkeletonChart } from "@/components/ui/Skeleton";

function VolumeTooltip({
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
        {format(new Date(payload[0].payload.timestamp), "MMM d, yyyy")}
      </p>
      <p className="text-white font-semibold">{formatUsd(payload[0].value)}</p>
    </div>
  );
}

export default function VolumeChart() {
  const { data, loading } = useTokenChart(30);

  if (loading && data.length === 0) return <SkeletonChart />;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Trading Volume (30D)
      </h3>
      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary text-sm">
            No volume data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) => format(new Date(v), "MMM d")}
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
              <Tooltip content={<VolumeTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar
                dataKey="volume"
                fill="#8b5cf6"
                radius={[2, 2, 0, 0]}
                maxBarSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
