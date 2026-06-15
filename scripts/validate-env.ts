import "dotenv/config";

const required = ["DATABASE_URL", "GITHUB_TOKEN"] as const;
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error("Missing required sync environment variables:");
  for (const name of missing) {
    console.error(`  - ${name}`);
  }
  console.error("");
  console.error("Set DATABASE_URL as a GitHub Actions secret.");
  console.error("GITHUB_TOKEN is provided automatically in GitHub Actions.");
  process.exit(1);
}

console.log("Sync environment OK");
