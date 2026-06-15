import { prisma } from "./db";

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

function startOfUtcWeek(date: Date): Date {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = weekStart.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  weekStart.setUTCHours(0, 0, 0, 0);
  return weekStart;
}

function addUtcWeeks(date: Date, weeks: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + weeks * 7);
  return next;
}

interface WeekBucket {
  totalCommits: number;
  devs: Set<string>;
  activeRepos: Set<number>;
  communityCommits: number;
  communityDevs: Set<string>;
  communityActiveRepos: Set<number>;
}

function getBucket(buckets: Map<number, WeekBucket>, weekStart: Date): WeekBucket {
  const key = weekStart.getTime();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = {
      totalCommits: 0,
      devs: new Set(),
      activeRepos: new Set(),
      communityCommits: 0,
      communityDevs: new Set(),
      communityActiveRepos: new Set(),
    };
    buckets.set(key, bucket);
  }
  return bucket;
}

function increment(map: Map<number, number>, weekStart: Date) {
  const key = weekStart.getTime();
  map.set(key, (map.get(key) ?? 0) + 1);
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

  const deleted = await prisma.weeklyStats.deleteMany();
  console.log(`Cleared ${deleted.count} existing weekly records`);

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
  const coreRepoIdSet = new Set(coreRepoIds);
  console.log(`Found ${coreRepoIds.length} core team repos to exclude for community stats`);

  const firstWeek = startOfUtcWeek(earliest.committedAt);
  const now = new Date();

  const allRepos = await prisma.repo.findMany({
    where: { isFork: false },
    select: { id: true, fullName: true, createdAt: true },
  });

  const commits = await prisma.commit.findMany({
    select: {
      repoId: true,
      authorUsername: true,
      committedAt: true,
    },
  });
  console.log(`Loaded ${commits.length} commits and ${allRepos.length} repos`);

  const buckets = new Map<number, WeekBucket>();
  const newReposByWeek = new Map<number, number>();
  const communityNewReposByWeek = new Map<number, number>();

  for (const commit of commits) {
    const weekStart = startOfUtcWeek(commit.committedAt);
    const bucket = getBucket(buckets, weekStart);
    bucket.totalCommits++;
    bucket.devs.add(commit.authorUsername);
    bucket.activeRepos.add(commit.repoId);

    if (!coreRepoIdSet.has(commit.repoId)) {
      bucket.communityCommits++;
      bucket.communityDevs.add(commit.authorUsername);
      bucket.communityActiveRepos.add(commit.repoId);
    }
  }

  for (const repo of allRepos) {
    const weekStart = startOfUtcWeek(repo.createdAt);
    increment(newReposByWeek, weekStart);
    if (!isCoreRepo(repo.fullName)) {
      increment(communityNewReposByWeek, weekStart);
    }
  }

  let currentWeek = firstWeek;
  let weeksProcessed = 0;
  const rows = [];

  while (currentWeek < now) {
    const key = currentWeek.getTime();
    const bucket = buckets.get(key);
    const totalCommits = bucket?.totalCommits ?? 0;

    rows.push({
      weekStart: new Date(currentWeek),
      totalCommits,
      uniqueDevs: bucket?.devs.size ?? 0,
      activeRepos: bucket?.activeRepos.size ?? 0,
      newRepos: newReposByWeek.get(key) ?? 0,
      communityCommits: bucket?.communityCommits ?? 0,
      communityDevs: bucket?.communityDevs.size ?? 0,
      communityActiveRepos: bucket?.communityActiveRepos.size ?? 0,
      communityNewRepos: communityNewReposByWeek.get(key) ?? 0,
    });

    if (totalCommits > 0) weeksProcessed++;
    currentWeek = addUtcWeeks(currentWeek, 1);
  }

  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    await prisma.weeklyStats.createMany({
      data: rows.slice(i, i + batchSize),
    });
  }

  console.log(`Processed ${weeksProcessed} weeks with activity`);

  const totalStats = await prisma.weeklyStats.count();
  console.log(`Total weekly records: ${totalStats}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
