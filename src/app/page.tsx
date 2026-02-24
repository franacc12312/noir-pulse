import AztecDashboard from "@/components/AztecDashboard";
import { getWeeklyStats, getOverviewStats, getTopRepos, getRepoGrowth, getTvlHistory } from "@/lib/queries";

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
  let tvlHistory: Awaited<ReturnType<typeof getTvlHistory>> = [];
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

  // TVL fetched separately so a missing table doesn't break the rest
  try {
    tvlHistory = await getTvlHistory("all");
  } catch {
    // TvlSnapshot table may not exist yet — that's fine
  }

  const serializedWeekly = weeklyData.map((w) => ({
    weekStart: w.weekStart.toISOString().split("T")[0],
    totalCommits: w.totalCommits,
    uniqueDevs: w.uniqueDevs,
    activeRepos: w.activeRepos,
    newRepos: w.newRepos,
    communityCommits: w.communityCommits,
    communityDevs: w.communityDevs,
    communityActiveRepos: w.communityActiveRepos,
    communityNewRepos: w.communityNewRepos,
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
                A
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
                    AZTEC PULSE
                  </span>
                </h1>
                <p className="text-text-secondary text-sm mt-0.5 hidden sm:block">
                  Ecosystem Health Dashboard
                </p>
              </div>
            </div>
            <a
              href="https://aztec.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              aztec.network
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

        <AztecDashboard
          weeklyData={serializedWeekly}
          repoGrowth={repoGrowth}
          topRepos={topRepos}
          overview={overview}
          tvlHistory={tvlHistory}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-text-secondary text-xs">
              Data sourced from CoinGecko, DeFiLlama, and public GitHub repositories.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://aztec.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-orange transition-colors text-xs"
              >
                aztec.network
              </a>
              <a
                href="https://github.com/AztecProtocol"
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
