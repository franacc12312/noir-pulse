"use client";

import { useTokenData } from "@/lib/hooks/useTokenData";
import TokenStatsCards from "@/components/token/TokenStatsCards";
import PriceChart from "@/components/token/PriceChart";
import VolumeChart from "@/components/token/VolumeChart";
import SupplyInfo from "@/components/token/SupplyInfo";
import { SkeletonStatsGrid, SkeletonChart } from "@/components/ui/Skeleton";
import ErrorCard from "@/components/ui/ErrorCard";

export default function TokenTab() {
  const { data, loading, error, refetch } = useTokenData();

  if (error && !data) {
    return (
      <ErrorCard
        title="Token data unavailable"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {loading && !data ? (
        <>
          <SkeletonStatsGrid count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </>
      ) : data ? (
        <>
          <TokenStatsCards data={data} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceChart />
            <VolumeChart />
          </div>
          <SupplyInfo data={data} />
        </>
      ) : null}
    </div>
  );
}
