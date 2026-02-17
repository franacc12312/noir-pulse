"use client";

interface TopRepo {
  fullName: string;
  stars: number;
  commits: number;
}

interface TopReposProps {
  repos: TopRepo[];
}

export default function TopRepos({ repos }: TopReposProps) {
  if (repos.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">
          Most Active Repos (30d)
        </h3>
        <div className="h-32 flex items-center justify-center text-text-secondary text-sm">
          No data available.
        </div>
      </div>
    );
  }

  const maxCommits = Math.max(...repos.map((r) => r.commits));

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Most Active Repos (30d)
      </h3>
      <div className="space-y-3">
        {repos.map((repo, i) => (
          <div key={repo.fullName} className="flex items-center gap-3">
            <span className="text-text-secondary text-xs w-5 text-right font-mono">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <a
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-salmon hover:text-white transition-colors truncate"
                >
                  {repo.fullName}
                </a>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className="text-xs text-text-secondary">
                    {repo.commits} commits
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(repo.commits / maxCommits) * 100}%`,
                    background:
                      "linear-gradient(90deg, var(--accent-orange), var(--accent-salmon))",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
