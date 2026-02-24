// Token data from CoinGecko
export interface TokenData {
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  totalVolume: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  lastUpdated: string;
}

// Token chart data point
export interface TokenChartPoint {
  timestamp: number;
  price: number;
  volume: number;
}

// Network data from Aztec RPC
export interface NetworkData {
  blockHeight: number;
  provenBlockHeight: number;
  finalityGap: number;
  status: "synced" | "syncing" | "unavailable";
}

// TVL snapshot from DB or DeFiLlama
export interface TvlSnapshot {
  date: string;
  tvlUsd: number;
}

// Live TVL data
export interface LiveTvlData {
  currentTvl: number;
  change7d: number;
  change30d: number;
}

// Developer tab data (reused from existing)
export interface WeeklyData {
  weekStart: string;
  totalCommits: number;
  uniqueDevs: number;
  activeRepos: number;
  newRepos: number;
}

export interface RepoGrowthPoint {
  weekStart: string;
  cumulative: number;
}

export interface TopRepo {
  fullName: string;
  stars: number;
  commits: number;
}

export interface OverviewStats {
  totalCommits: number;
  totalRepos: number;
  totalDevs: number;
  thisWeekCommits: number;
  thisWeekDevs: number;
  activeReposThisWeek: number;
}
