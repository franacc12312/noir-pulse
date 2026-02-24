import "dotenv/config";
import { execSync } from "child_process";

const steps = [
  { name: "Discover Repos", script: "scripts/discover-repos.ts" },
  { name: "Sync Commits", script: "scripts/sync-commits.ts" },
  { name: "Aggregate Weekly Stats", script: "scripts/aggregate.ts" },
  { name: "Sync TVL", script: "scripts/sync-tvl.ts" },
];

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   Aztec Pulse Pipeline               ║");
  console.log("╚══════════════════════════════════════╝\n");

  const startTime = Date.now();

  for (const step of steps) {
    console.log(`\n▶ ${step.name}`);
    console.log("─".repeat(40));

    try {
      execSync(`npx tsx ${step.script}`, {
        stdio: "inherit",
        env: process.env,
      });
      console.log(`✓ ${step.name} complete`);
    } catch (error) {
      console.error(`✗ ${step.name} failed:`, error);
      process.exit(1);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n══════════════════════════════════════`);
  console.log(`Pipeline complete in ${elapsed}s`);
}

main();
