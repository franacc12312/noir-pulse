import "dotenv/config";
import { prisma } from "./db";

interface DefiLlamaChainTvl {
  date: number;
  totalLiquidityUSD: number;
}

interface DefiLlamaResponse {
  tvl: { date: number; totalLiquidityUSD: number }[];
  chainTvls?: Record<string, { tvl: DefiLlamaChainTvl[] }>;
}

async function main() {
  console.log("Fetching TVL data from DeFiLlama...");

  const res = await fetch("https://api.llama.fi/protocol/aztec");
  if (!res.ok) {
    throw new Error(`DeFiLlama API error: ${res.status} ${res.statusText}`);
  }

  const data: DefiLlamaResponse = await res.json();
  const tvlData = data.tvl ?? [];

  console.log(`Got ${tvlData.length} TVL data points`);

  let upserted = 0;
  for (const point of tvlData) {
    const date = new Date(point.date * 1000);
    // Normalize to start of day UTC
    date.setUTCHours(0, 0, 0, 0);

    await prisma.tvlSnapshot.upsert({
      where: { date },
      create: { date, tvlUsd: point.totalLiquidityUSD },
      update: { tvlUsd: point.totalLiquidityUSD },
    });
    upserted++;
  }

  console.log(`Upserted ${upserted} TVL snapshots`);
}

main()
  .then(() => {
    console.log("TVL sync complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("TVL sync failed:", err);
    process.exit(1);
  });
