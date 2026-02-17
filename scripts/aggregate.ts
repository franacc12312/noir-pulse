import { prisma } from "./db";
import { startOfWeek, addWeeks, isBefore } from "date-fns";

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

  const firstWeek = startOfWeek(earliest.committedAt, { weekStartsOn: 1 });
  const now = new Date();
  let currentWeek = firstWeek;
  let weeksProcessed = 0;

  const allRepos = await prisma.repo.findMany({
    where: { isFork: false },
    select: { createdAt: true },
  });

  while (isBefore(currentWeek, now)) {
    const weekEnd = addWeeks(currentWeek, 1);

    const totalCommits = await prisma.commit.count({
      where: {
        committedAt: { gte: currentWeek, lt: weekEnd },
      },
    });

    const uniqueDevs = await prisma.commit.findMany({
      where: {
        committedAt: { gte: currentWeek, lt: weekEnd },
      },
      select: { authorUsername: true },
      distinct: ["authorUsername"],
    });

    const activeRepos = await prisma.commit.groupBy({
      by: ["repoId"],
      where: {
        committedAt: { gte: currentWeek, lt: weekEnd },
      },
    });

    const newRepos = allRepos.filter(
      (r) => r.createdAt >= currentWeek && r.createdAt < weekEnd
    ).length;

    await prisma.weeklyStats.upsert({
      where: { weekStart: currentWeek },
      create: {
        weekStart: currentWeek,
        totalCommits,
        uniqueDevs: uniqueDevs.length,
        activeRepos: activeRepos.length,
        newRepos,
      },
      update: {
        totalCommits,
        uniqueDevs: uniqueDevs.length,
        activeRepos: activeRepos.length,
        newRepos,
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
