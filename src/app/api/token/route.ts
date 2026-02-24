import { NextResponse } from "next/server";
import type { TokenData } from "@/lib/types";

let cache: { data: TokenData; timestamp: number } | null = null;
const CACHE_DURATION = 60_000; // 60 seconds

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/aztec",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const coin = await res.json();

    const data: TokenData = {
      price: coin.market_data?.current_price?.usd ?? 0,
      priceChange24h: coin.market_data?.price_change_24h ?? 0,
      priceChangePercentage24h: coin.market_data?.price_change_percentage_24h ?? 0,
      marketCap: coin.market_data?.market_cap?.usd ?? 0,
      totalVolume: coin.market_data?.total_volume?.usd ?? 0,
      circulatingSupply: coin.market_data?.circulating_supply ?? 0,
      totalSupply: coin.market_data?.total_supply ?? null,
      maxSupply: coin.market_data?.max_supply ?? null,
      ath: coin.market_data?.ath?.usd ?? 0,
      athDate: coin.market_data?.ath_date?.usd ?? "",
      atl: coin.market_data?.atl?.usd ?? 0,
      atlDate: coin.market_data?.atl_date?.usd ?? "",
      lastUpdated: coin.last_updated ?? new Date().toISOString(),
    };

    cache = { data, timestamp: now };
    return NextResponse.json(data);
  } catch {
    // Return stale cache if available
    if (cache) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 502 }
    );
  }
}
