const GITHUB_API = "https://api.github.com";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function githubFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: getHeaders() });

  if (res.status === 403 || res.status === 429) {
    const resetTime = res.headers.get("X-RateLimit-Reset");
    if (resetTime) {
      const waitMs = parseInt(resetTime) * 1000 - Date.now() + 1000;
      console.log(`  Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(Math.max(waitMs, 1000));
      return githubFetch(url);
    }
    await sleep(60_000);
    return githubFetch(url);
  }

  if (res.status === 409) {
    // Empty repo
    return res;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body} (${url})`);
  }

  return res;
}

export interface GitHubSearchRepo {
  id: number;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
}

export async function searchNoirRepos(): Promise<GitHubSearchRepo[]> {
  const allRepos: GitHubSearchRepo[] = [];

  for (let page = 1; page <= 10; page++) {
    const url = `${GITHUB_API}/search/repositories?q=language:Noir&per_page=100&page=${page}&sort=updated`;
    console.log(`  Fetching repos page ${page}...`);

    const res = await githubFetch(url);
    const data = await res.json();

    allRepos.push(...data.items);
    console.log(`  Got ${data.items.length} repos (total: ${allRepos.length}/${data.total_count})`);

    if (data.items.length < 100) break;
    await sleep(2500); // Search API: 30 req/min
  }

  return allRepos;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  author: {
    login: string;
  } | null;
}

const BOT_PATTERNS = [
  /\[bot\]$/,
  /^dependabot$/,
  /^renovate$/,
  /^github-actions$/,
  /^web-flow$/,
];

function isBot(username: string): boolean {
  return BOT_PATTERNS.some((p) => p.test(username));
}

// Monorepos where we filter by path to only get Noir-related commits
const MONOREPO_PATHS: Record<string, string[]> = {
  "AztecProtocol/aztec-packages": ["noir-projects", "noir"],
};

export async function fetchRepoCommits(
  fullName: string,
  since?: Date
): Promise<GitHubCommit[]> {
  const paths = MONOREPO_PATHS[fullName];

  if (paths) {
    // For monorepos, fetch commits for each Noir-related path
    const allCommits: GitHubCommit[] = [];
    const seenShas = new Set<string>();

    for (const path of paths) {
      const commits = await fetchCommitsForPath(fullName, path, since);
      for (const c of commits) {
        if (!seenShas.has(c.sha)) {
          seenShas.add(c.sha);
          allCommits.push(c);
        }
      }
    }
    return allCommits;
  }

  return fetchCommitsForPath(fullName, undefined, since);
}

async function fetchCommitsForPath(
  fullName: string,
  path?: string,
  since?: Date
): Promise<GitHubCommit[]> {
  const allCommits: GitHubCommit[] = [];

  for (let page = 1; page <= 100; page++) {
    const url = new URL(`${GITHUB_API}/repos/${fullName}/commits`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    if (since) url.searchParams.set("since", since.toISOString());
    if (path) url.searchParams.set("path", path);

    const res = await githubFetch(url.toString());

    if (res.status === 409) {
      // Empty repository
      break;
    }

    const commits: GitHubCommit[] = await res.json();

    if (!Array.isArray(commits) || commits.length === 0) break;

    // Filter out bots
    const filtered = commits.filter((c) => {
      const username = c.author?.login || "unknown";
      return !isBot(username);
    });

    allCommits.push(...filtered);

    if (commits.length < 100) break;
    await sleep(100);
  }

  return allCommits;
}
