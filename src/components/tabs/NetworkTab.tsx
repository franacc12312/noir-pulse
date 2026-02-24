"use client";

import { useNetworkData } from "@/lib/hooks/useNetworkData";
import NetworkStatsCards from "@/components/network/NetworkStatsCards";
import BlocksTable from "@/components/network/BlocksTable";
import { SkeletonStatsGrid, SkeletonChart } from "@/components/ui/Skeleton";
import ErrorCard from "@/components/ui/ErrorCard";

export default function NetworkTab() {
  const { data, loading, error, notConfigured, refetch } = useNetworkData();

  if (notConfigured) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-white font-medium mb-2">Network Data Coming Soon</h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Requires an Aztec node RPC endpoint. Set the{" "}
          <code className="text-accent-salmon bg-surface-elevated px-1 py-0.5 rounded text-xs">
            AZTEC_NODE_URL
          </code>{" "}
          environment variable to enable live network metrics.
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <ErrorCard
        title="Network data unavailable"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <SkeletonStatsGrid count={4} />
        <SkeletonChart />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <NetworkStatsCards data={data} />
      <BlocksTable data={data} />
    </div>
  );
}
