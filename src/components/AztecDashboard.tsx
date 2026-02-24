"use client";

import { useState } from "react";
import TabNavigation, { type TabId } from "./TabNavigation";
import DeveloperTab from "./tabs/DeveloperTab";
import TokenTab from "./tabs/TokenTab";
import NetworkTab from "./tabs/NetworkTab";
import TvlTab from "./tabs/TvlTab";

interface WeeklyData {
  weekStart: string;
  totalCommits: number;
  uniqueDevs: number;
  activeRepos: number;
  newRepos: number;
  communityCommits: number;
  communityDevs: number;
  communityActiveRepos: number;
  communityNewRepos: number;
}

interface RepoGrowthPoint {
  weekStart: string;
  cumulative: number;
}

interface TopRepo {
  fullName: string;
  stars: number;
  commits: number;
}

interface OverviewStats {
  totalCommits: number;
  totalRepos: number;
  totalDevs: number;
  thisWeekCommits: number;
  thisWeekDevs: number;
  activeReposThisWeek: number;
}

interface TvlDataPoint {
  date: string;
  tvlUsd: number;
}

interface AztecDashboardProps {
  weeklyData: WeeklyData[];
  repoGrowth: RepoGrowthPoint[];
  topRepos: TopRepo[];
  overview: OverviewStats;
  tvlHistory: TvlDataPoint[];
}

export default function AztecDashboard({
  weeklyData,
  repoGrowth,
  topRepos,
  overview,
  tvlHistory,
}: AztecDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("developer");

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <TabNavigation active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "token" && <TokenTab />}
      {activeTab === "network" && <NetworkTab />}
      {activeTab === "developer" && (
        <DeveloperTab
          weeklyData={weeklyData}
          repoGrowth={repoGrowth}
          topRepos={topRepos}
          overview={overview}
        />
      )}
      {activeTab === "tvl" && <TvlTab tvlHistory={tvlHistory} />}
    </div>
  );
}
