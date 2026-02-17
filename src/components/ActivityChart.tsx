"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DataPoint {
  weekStart: string;
  value: number;
}

interface ActivityChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  valueLabel?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  valueLabel: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="bg-surface-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-text-secondary text-xs mb-1">
        {format(parseISO(label), "MMM d, yyyy")}
      </p>
      <p className="text-white font-semibold">
        {payload[0].value.toLocaleString()} {valueLabel}
      </p>
    </div>
  );
}

export default function ActivityChart({
  data,
  title,
  color,
  valueLabel = "",
}: ActivityChartProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">{title}</h3>
      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary text-sm">
            No data available. Run the pipeline to populate.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id={`gradient-${color.replace("#", "")}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="weekStart"
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
                width={45}
              />
              <Tooltip
                content={<CustomTooltip valueLabel={valueLabel} />}
                cursor={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${color.replace("#", "")})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: color,
                  stroke: "#0a0a0a",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
