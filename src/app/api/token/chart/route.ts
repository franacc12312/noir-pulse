import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { TokenChartPoint } from "@/lib/types";

const chartCache = new Map<string, { data: TokenChartPoint[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60_000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = searchParams.get("days") || "7";
  const cacheKey = `chart-${days}`;

  const now = Date.now();
  const cached = chartCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/aztec/market_chart?vs_currency=usd&days=${days}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const raw = await res.json();

    const prices: [number, number][] = raw.prices ?? [];
    const volumes: [number, number][] = raw.total_volumes ?? [];

    const volumeMap = new Map(volumes.map(([t, v]) => [t, v]));

    const data: TokenChartPoint[] = prices.map(([timestamp, price]) => ({
      timestamp,
      price,
      volume: volumeMap.get(timestamp) ?? 0,
    }));

    chartCache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data);
  } catch {
    const cached = chartCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached.data);
    }
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 502 }
    );
  }
}
