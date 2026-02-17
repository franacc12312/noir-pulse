import { prisma } from "./db";
import { searchNoirRepos } from "../src/lib/github";

async function main() {
  console.log("=== Discovering Noir Repos ===\n");

  const repos = await searchNoirRepos();
  console.log(`\nFound ${repos.length} repos total`);

  // Filter out forks
  const nonForks = repos.filter((r) => !r.fork);
  console.log(`Non-fork repos: ${nonForks.length}`);

  let created = 0;
  let updated = 0;

  for (const repo of nonForks) {
    const result = await prisma.repo.upsert({
      where: { githubId: repo.id },
      create: {
        githubId: repo.id,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        isFork: repo.fork,
        archived: repo.archived,
        createdAt: new Date(repo.created_at),
      },
      update: {
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        archived: repo.archived,
      },
    });

    if (!result.lastSyncedAt) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`\nCreated: ${created}, Updated: ${updated}`);

  const archivedRepos = repos.filter((r) => r.archived);
  if (archivedRepos.length > 0) {
    console.log(`Archived repos found: ${archivedRepos.length}`);
  }

  const totalTracked = await prisma.repo.count({
    where: { isFork: false },
  });
  console.log(`Total tracked repos: ${totalTracked}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
