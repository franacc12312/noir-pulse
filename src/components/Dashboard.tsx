"use client";

import { useState, useMemo } from "react";
import type { Timeframe } from "@/lib/queries";
import StatsCards from "./StatsCards";
import TimeframeSelector from "./TimeframeSelector";
import ActivityChart from "./ActivityChart";
import TopRepos from "./TopRepos";
import Methodology from "./Methodology";
import { subDays } from "date-fns";

interface WeeklyData {
  weekStart: string;
  totalCommits: number;
  uniqueDevs: number;
  activeRepos: number;
  newRepos: number;
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

interface DashboardProps {
  weeklyData: WeeklyData[];
  repoGrowth: RepoGrowthPoint[];
  topRepos: TopRepo[];
  overview: OverviewStats;
}

function filterByTimeframe<T extends { weekStart: string }>(
  data: T[],
  timeframe: Timeframe
): T[] {
  if (timeframe === "all") return data;

  const days = timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365;
  const cutoff = subDays(new Date(), days);

  return data.filter((d) => new Date(d.weekStart) >= cutoff);
}

export default function Dashboard({
  weeklyData,
  repoGrowth,
  topRepos,
  overview,
}: DashboardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1y");

  const filteredWeekly = useMemo(
    () => filterByTimeframe(weeklyData, timeframe),
    [weeklyData, timeframe]
  );

  const filteredGrowth = useMemo(
    () => filterByTimeframe(repoGrowth, timeframe),
    [repoGrowth, timeframe]
  );

  const commitsData = filteredWeekly.map((d) => ({
    weekStart: d.weekStart,
    value: d.totalCommits,
  }));

  const devsData = filteredWeekly.map((d) => ({
    weekStart: d.weekStart,
    value: d.uniqueDevs,
  }));

  const activeReposData = filteredWeekly.map((d) => ({
    weekStart: d.weekStart,
    value: d.activeRepos,
  }));

  const growthData = filteredGrowth.map((d) => ({
    weekStart: d.weekStart,
    value: d.cumulative,
  }));

  return (
    <div className="space-y-6">
      <StatsCards stats={overview} />

      <div className="flex justify-end">
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart
          data={commitsData}
          title="Noir Commits per Week"
          color="#f28a35"
          valueLabel="commits"
        />
        <ActivityChart
          data={devsData}
          title="Active Developers per Week"
          color="#3366ff"
          valueLabel="developers"
        />
        <ActivityChart
          data={activeReposData}
          title="Active Repos per Week"
          color="#fbc0b4"
          valueLabel="repos"
        />
        <ActivityChart
          data={growthData}
          title="Total Repos Over Time"
          color="#8b5cf6"
          valueLabel="repos"
        />
      </div>

      <TopRepos repos={topRepos} />

      <Methodology />
    </div>
  );
}
