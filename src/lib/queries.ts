import { prisma } from "./prisma";
import { subDays, startOfWeek } from "date-fns";

export type Timeframe = "30d" | "90d" | "1y" | "all";

export async function getWeeklyStats(timeframe: Timeframe = "all") {
  if (!prisma) return [];

  const now = new Date();
  let since: Date | undefined;

  switch (timeframe) {
    case "30d":
      since = subDays(now, 30);
      break;
    case "90d":
      since = subDays(now, 90);
      break;
    case "1y":
      since = subDays(now, 365);
      break;
    case "all":
      since = undefined;
      break;
  }

  return prisma.weeklyStats.findMany({
    where: since ? { weekStart: { gte: since } } : undefined,
    orderBy: { weekStart: "asc" },
  });
}

export async function getOverviewStats() {
  const empty = {
    totalCommits: 0,
    totalRepos: 0,
    totalDevs: 0,
    thisWeekCommits: 0,
    thisWeekDevs: 0,
    activeReposThisWeek: 0,
  };

  if (!prisma) return empty;

  const now = new Date();
  const weekAgo = subDays(now, 7);

  const [totalCommits, totalRepos, totalDevsResult, thisWeekCommits, thisWeekDevsResult, activeReposThisWeek] =
    await Promise.all([
      prisma.commit.count(),
      prisma.repo.count({ where: { isFork: false, archived: false } }),
      prisma.commit.findMany({
        select: { authorUsername: true },
        distinct: ["authorUsername"],
      }),
      prisma.commit.count({
        where: { committedAt: { gte: weekAgo } },
      }),
      prisma.commit.findMany({
        where: { committedAt: { gte: weekAgo } },
        select: { authorUsername: true },
        distinct: ["authorUsername"],
      }),
      prisma.commit.groupBy({
        by: ["repoId"],
        where: { committedAt: { gte: weekAgo } },
      }),
    ]);

  return {
    totalCommits,
    totalRepos,
    totalDevs: totalDevsResult.length,
    thisWeekCommits,
    thisWeekDevs: thisWeekDevsResult.length,
    activeReposThisWeek: activeReposThisWeek.length,
  };
}

export async function getTopRepos(days: number = 30) {
  if (!prisma) return [];

  const since = subDays(new Date(), days);

  const results = await prisma.commit.groupBy({
    by: ["repoId"],
    where: { committedAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const repoIds = results.map((r) => r.repoId);
  const repos = await prisma.repo.findMany({
    where: { id: { in: repoIds } },
    select: { id: true, fullName: true, stars: true },
  });

  const repoMap = new Map(repos.map((r) => [r.id, r]));

  return results.map((r) => ({
    fullName: repoMap.get(r.repoId)?.fullName || "unknown",
    stars: repoMap.get(r.repoId)?.stars || 0,
    commits: r._count.id,
  }));
}

export async function getRepoGrowth() {
  if (!prisma) return [];

  const repos = await prisma.repo.findMany({
    where: { isFork: false, archived: false },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const weekMap = new Map<string, number>();

  for (const repo of repos) {
    const week = startOfWeek(repo.createdAt, { weekStartsOn: 1 })
      .toISOString()
      .split("T")[0];
    weekMap.set(week, (weekMap.get(week) || 0) + 1);
  }

  const sortedWeeks = [...weekMap.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  );

  let cumulative = 0;
  return sortedWeeks.map(([week, count]) => {
    cumulative += count;
    return { weekStart: week, cumulative };
  });
}
