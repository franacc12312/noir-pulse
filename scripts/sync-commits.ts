import { prisma } from "./db";
import { fetchRepoCommits } from "../src/lib/github";

async function syncRepo(repo: {
  id: number;
  fullName: string;
  lastSyncedAt: Date | null;
}) {
  const since = repo.lastSyncedAt || undefined;
  console.log(
    `  Syncing ${repo.fullName}${since ? ` (since ${since.toISOString().split("T")[0]})` : " (full history)"}...`
  );

  try {
    const commits = await fetchRepoCommits(repo.fullName, since);

    let newCount = 0;
    for (const commit of commits) {
      const username = commit.author?.login || "unknown";
      const date = new Date(commit.commit.author.date);
      const message = commit.commit.message?.substring(0, 255) || null;

      try {
        await prisma.commit.upsert({
          where: { sha: commit.sha },
          create: {
            sha: commit.sha,
            repoId: repo.id,
            authorUsername: username,
            committedAt: date,
            message,
          },
          update: {},
        });
        newCount++;
      } catch {
        // Duplicate SHA, skip
      }
    }

    await prisma.repo.update({
      where: { id: repo.id },
      data: { lastSyncedAt: new Date() },
    });

    console.log(`    → ${newCount} commits synced`);
    return newCount;
  } catch (error) {
    console.error(`    ✗ Error syncing ${repo.fullName}:`, error);
    return 0;
  }
}

async function main() {
  console.log("=== Syncing Commits ===\n");

  const batchSize = parseInt(process.env.BATCH_SIZE || "0") || 0;
  const batchOffset = parseInt(process.env.BATCH_OFFSET || "0") || 0;

  const query = {
    where: { isFork: false, archived: false },
    orderBy: { fullName: "asc" as const },
    ...(batchSize > 0 ? { take: batchSize, skip: batchOffset } : {}),
  };

  const repos = await prisma.repo.findMany(query);
  const totalRepos = await prisma.repo.count({ where: query.where });

  console.log(
    `Processing ${repos.length} repos${batchSize ? ` (batch: offset=${batchOffset}, size=${batchSize})` : ""} of ${totalRepos} total\n`
  );

  let totalCommits = 0;

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    console.log(`[${i + 1}/${repos.length}]`);
    totalCommits += await syncRepo(repo);
  }

  console.log(`\nDone. Total new commits synced: ${totalCommits}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
