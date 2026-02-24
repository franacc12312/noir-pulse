"use client";

import { useState, useMemo } from "react";
import type { Timeframe } from "@/lib/queries";
import StatsCards from "../StatsCards";
import TimeframeSelector from "../TimeframeSelector";
import ActivityChart from "../ActivityChart";
import TopRepos from "../TopRepos";
import Methodology from "../Methodology";
import { subDays } from "date-fns";

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

interface DeveloperTabProps {
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

export default function DeveloperTab({
  weeklyData,
  repoGrowth,
  topRepos,
  overview,
}: DeveloperTabProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1y");
  const [communityOnly, setCommunityOnly] = useState(false);

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
    value: communityOnly ? (d.communityCommits ?? 0) : d.totalCommits,
  }));

  const devsData = filteredWeekly.map((d) => ({
    weekStart: d.weekStart,
    value: communityOnly ? (d.communityDevs ?? 0) : d.uniqueDevs,
  }));

  const activeReposData = filteredWeekly.map((d) => ({
    weekStart: d.weekStart,
    value: communityOnly ? (d.communityActiveRepos ?? 0) : d.activeRepos,
  }));

  const growthData = filteredGrowth.map((d) => ({
    weekStart: d.weekStart,
    value: d.cumulative,
  }));

  // Derive overview stats based on toggle — sum from the full (unfiltered) weekly data
  const displayedOverview = useMemo(() => {
    if (!communityOnly) return overview;

    const totalCommunityCommits = weeklyData.reduce((s, w) => s + (w.communityCommits ?? 0), 0);
    const lastWeek = weeklyData[weeklyData.length - 1];

    return {
      ...overview,
      totalCommits: totalCommunityCommits,
      thisWeekCommits: lastWeek?.communityCommits ?? 0,
      thisWeekDevs: lastWeek?.communityDevs ?? 0,
      activeReposThisWeek: lastWeek?.communityActiveRepos ?? 0,
    };
  }, [communityOnly, overview, weeklyData]);

  return (
    <div className="space-y-6">
      <StatsCards stats={displayedOverview} />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCommunityOnly(!communityOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
            communityOnly
              ? "border-accent-orange/40 bg-accent-orange/10 text-accent-orange"
              : "border-border bg-surface text-text-secondary hover:text-white"
          }`}
        >
          <div className={`relative w-7 h-4 rounded-full transition-colors ${
            communityOnly ? "bg-accent-orange" : "bg-border"
          }`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
              communityOnly ? "left-3.5" : "left-0.5"
            }`} />
          </div>
          Exclude core team repos
        </button>
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart
          data={commitsData}
          title="Commits per Week"
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
