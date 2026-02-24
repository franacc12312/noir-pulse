import { NextResponse } from "next/server";

let cache: { data: { tvl: number; timestamp: number }; cachedAt: number } | null = null;
const CACHE_DURATION = 5 * 60_000; // 5 minutes

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.cachedAt < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch("https://api.llama.fi/protocol/aztec", {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`DeFiLlama API error: ${res.status}`);
    }

    const protocol = await res.json();
    const tvlData = protocol.tvl ?? [];
    const currentTvl = tvlData.length > 0 ? tvlData[tvlData.length - 1].totalLiquidityUSD : 0;

    const data = { tvl: currentTvl, timestamp: Date.now() };
    cache = { data, cachedAt: now };
    return NextResponse.json(data);
  } catch {
    if (cache) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      { error: "Failed to fetch TVL data" },
      { status: 502 }
    );
  }
}
