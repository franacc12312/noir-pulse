import "dotenv/config";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not set. Cannot inspect persisted data.");
    process.exit(1);
  }

  const { prisma } = await import("./db");

  const [
    repoCount,
    commitCount,
    weeklyCount,
    tvlCount,
    latestCommit,
    latestWeek,
    latestTvl,
    latestRepoSync,
  ] = await Promise.all([
    prisma.repo.count(),
    prisma.commit.count(),
    prisma.weeklyStats.count(),
    prisma.tvlSnapshot.count(),
    prisma.commit.findFirst({
      orderBy: { committedAt: "desc" },
      select: { committedAt: true, repo: { select: { fullName: true } } },
    }),
    prisma.weeklyStats.findFirst({
      orderBy: { weekStart: "desc" },
      select: { weekStart: true, totalCommits: true, communityCommits: true },
    }),
    prisma.tvlSnapshot.findFirst({
      orderBy: { date: "desc" },
      select: { date: true, tvlUsd: true },
    }),
    prisma.repo.findFirst({
      where: { lastSyncedAt: { not: null } },
      orderBy: { lastSyncedAt: "desc" },
      select: { lastSyncedAt: true, fullName: true },
    }),
  ]);

  console.log("=== Aztec Pulse Data Status ===");
  console.log(`Repos: ${repoCount}`);
  console.log(`Commits: ${commitCount}`);
  console.log(`Weekly records: ${weeklyCount}`);
  console.log(`TVL snapshots: ${tvlCount}`);
  console.log(
    `Latest commit: ${
      latestCommit
        ? `${latestCommit.committedAt.toISOString()} (${latestCommit.repo.fullName})`
        : "none"
    }`
  );
  console.log(
    `Latest weekly stat: ${
      latestWeek
        ? `${latestWeek.weekStart.toISOString().split("T")[0]} (${latestWeek.totalCommits} commits, ${latestWeek.communityCommits} community)`
        : "none"
    }`
  );
  console.log(
    `Latest TVL: ${
      latestTvl
        ? `${latestTvl.date.toISOString().split("T")[0]} ($${latestTvl.tvlUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })})`
        : "none"
    }`
  );
  console.log(
    `Latest repo sync: ${
      latestRepoSync?.lastSyncedAt
        ? `${latestRepoSync.lastSyncedAt.toISOString()} (${latestRepoSync.fullName})`
        : "none"
    }`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    if (process.env.DATABASE_URL) {
      const { prisma } = await import("./db");
      await prisma.$disconnect();
    }
  });
