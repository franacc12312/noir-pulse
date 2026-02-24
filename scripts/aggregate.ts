import { prisma } from "./db";
import { startOfWeek, addWeeks, isBefore } from "date-fns";

const CORE_TEAM_PREFIXES = [
  "noir-lang/",
  "AztecProtocol/",
  "iAmMichaelConnor/",
  "zac-williamson/",
  "critesjosh/",
  "signorecello/",
  "benesjan/",
  "rahul-kothari/",
  "bajpai244/",
  "catmcgee/",
  "Thunkar/",
  "sklppy88/",
  "saleel/",
];
const CORE_TEAM_REPOS: string[] = [];

function isCoreRepo(fullName: string): boolean {
  return (
    CORE_TEAM_PREFIXES.some((p) => fullName.startsWith(p)) ||
    CORE_TEAM_REPOS.includes(fullName)
  );
}

async function main() {
  console.log("=== Aggregating Weekly Stats ===\n");

  const earliest = await prisma.commit.findFirst({
    orderBy: { committedAt: "asc" },
    select: { committedAt: true },
  });

  if (!earliest) {
    console.log("No commits found. Run sync-commits first.");
    return;
  }

  // Identify core team repo IDs once
  const coreRepos = await prisma.repo.findMany({
    where: {
      OR: [
        ...CORE_TEAM_PREFIXES.map((p) => ({ fullName: { startsWith: p } })),
        { fullName: { in: CORE_TEAM_REPOS } },
      ],
    },
    select: { id: true },
  });
  const coreRepoIds = coreRepos.map((r) => r.id);
  console.log(`Found ${coreRepoIds.length} core team repos to exclude for community stats`);

  const firstWeek = startOfWeek(earliest.committedAt, { weekStartsOn: 1 });
  const now = new Date();
  let currentWeek = firstWeek;
  let weeksProcessed = 0;

  const allRepos = await prisma.repo.findMany({
    where: { isFork: false },
    select: { id: true, fullName: true, createdAt: true },
  });

  while (isBefore(currentWeek, now)) {
    const weekEnd = addWeeks(currentWeek, 1);
    const timeRange = { gte: currentWeek, lt: weekEnd };

    // --- All stats (existing) ---
    const totalCommits = await prisma.commit.count({
      where: { committedAt: timeRange },
    });

    const uniqueDevs = await prisma.commit.findMany({
      where: { committedAt: timeRange },
      select: { authorUsername: true },
      distinct: ["authorUsername"],
    });

    const activeRepos = await prisma.commit.groupBy({
      by: ["repoId"],
      where: { committedAt: timeRange },
    });

    const newRepos = allRepos.filter(
      (r) => r.createdAt >= currentWeek && r.createdAt < weekEnd
    ).length;

    // --- Community stats (excluding core team repos) ---
    const communityCommits = await prisma.commit.count({
      where: {
        committedAt: timeRange,
        repoId: { notIn: coreRepoIds },
      },
    });

    const communityDevsResult = await prisma.commit.findMany({
      where: {
        committedAt: timeRange,
        repoId: { notIn: coreRepoIds },
      },
      select: { authorUsername: true },
      distinct: ["authorUsername"],
    });

    const communityActiveReposResult = await prisma.commit.groupBy({
      by: ["repoId"],
      where: {
        committedAt: timeRange,
        repoId: { notIn: coreRepoIds },
      },
    });

    const communityNewRepos = allRepos.filter(
      (r) =>
        r.createdAt >= currentWeek &&
        r.createdAt < weekEnd &&
        !isCoreRepo(r.fullName)
    ).length;

    await prisma.weeklyStats.upsert({
      where: { weekStart: currentWeek },
      create: {
        weekStart: currentWeek,
        totalCommits,
        uniqueDevs: uniqueDevs.length,
        activeRepos: activeRepos.length,
        newRepos,
        communityCommits,
        communityDevs: communityDevsResult.length,
        communityActiveRepos: communityActiveReposResult.length,
        communityNewRepos,
      },
      update: {
        totalCommits,
        uniqueDevs: uniqueDevs.length,
        activeRepos: activeRepos.length,
        newRepos,
        communityCommits,
        communityDevs: communityDevsResult.length,
        communityActiveRepos: communityActiveReposResult.length,
        communityNewRepos,
      },
    });

    if (totalCommits > 0) {
      weeksProcessed++;
    }

    currentWeek = weekEnd;
  }

  console.log(`Processed ${weeksProcessed} weeks with activity`);

  const totalStats = await prisma.weeklyStats.count();
  console.log(`Total weekly records: ${totalStats}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
