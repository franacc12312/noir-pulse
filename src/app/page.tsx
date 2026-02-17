import Dashboard from "@/components/Dashboard";
import { getWeeklyStats, getOverviewStats, getTopRepos, getRepoGrowth } from "@/lib/queries";

// Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  let weeklyData: Awaited<ReturnType<typeof getWeeklyStats>> = [];
  let overview = {
    totalCommits: 0,
    totalRepos: 0,
    totalDevs: 0,
    thisWeekCommits: 0,
    thisWeekDevs: 0,
    activeReposThisWeek: 0,
  };
  let topRepos: Awaited<ReturnType<typeof getTopRepos>> = [];
  let repoGrowth: Awaited<ReturnType<typeof getRepoGrowth>> = [];
  let dbConnected = true;

  try {
    [weeklyData, overview, topRepos, repoGrowth] = await Promise.all([
      getWeeklyStats("all"),
      getOverviewStats(),
      getTopRepos(30),
      getRepoGrowth(),
    ]);
  } catch {
    dbConnected = false;
  }

  const serializedWeekly = weeklyData.map((w) => ({
    weekStart: w.weekStart.toISOString().split("T")[0],
    totalCommits: w.totalCommits,
    uniqueDevs: w.uniqueDevs,
    activeRepos: w.activeRepos,
    newRepos: w.newRepos,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, #f28a35, transparent 60%), radial-gradient(ellipse at 80% 50%, #8b5cf6, transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-lg"
                style={{ background: "linear-gradient(135deg, #f28a35 0%, #fbc0b4 100%)" }}
              >
                N
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  <span
                    style={{
                      background: "linear-gradient(135deg, #fff 0%, #a1a1a1 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    NOIR
                  </span>
                </h1>
                <p className="text-text-secondary text-sm mt-0.5 hidden sm:block">
                  Ecosystem Activity Index
                </p>
              </div>
            </div>
            <a
              href="https://github.com/noir-lang/noir"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              noir-lang
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {!dbConnected && (
          <div className="mb-6 bg-surface border border-accent-orange/30 rounded-xl p-4 text-sm">
            <p className="text-accent-orange font-medium">Database not connected</p>
            <p className="text-text-secondary mt-1">
              Set your <code className="text-accent-salmon">DATABASE_URL</code> in{" "}
              <code className="text-accent-salmon">.env</code> and run{" "}
              <code className="text-accent-salmon">npx prisma db push</code> to get started.
            </p>
          </div>
        )}

        <Dashboard
          weeklyData={serializedWeekly}
          repoGrowth={repoGrowth}
          topRepos={topRepos}
          overview={overview}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-text-secondary text-xs">
              Data sourced from public GitHub repositories. Updated weekly.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://noir-lang.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-orange transition-colors text-xs"
              >
                noir-lang.org
              </a>
              <a
                href="https://github.com/noir-lang/noir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-orange transition-colors text-xs"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
