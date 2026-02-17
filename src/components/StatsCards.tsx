"use client";

interface StatsCardsProps {
  stats: {
    totalCommits: number;
    totalRepos: number;
    totalDevs: number;
    thisWeekCommits: number;
    thisWeekDevs: number;
    activeReposThisWeek: number;
  };
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

const cards = [
  {
    key: "totalCommits",
    label: "Total Noir Commits",
    sub: (s: StatsCardsProps["stats"]) => `${s.thisWeekCommits} this week`,
    color: "var(--accent-orange)",
  },
  {
    key: "totalDevs",
    label: "Total Developers",
    sub: (s: StatsCardsProps["stats"]) => `${s.thisWeekDevs} active this week`,
    color: "var(--accent-blue)",
  },
  {
    key: "totalRepos",
    label: "Tracked Repos",
    sub: (s: StatsCardsProps["stats"]) =>
      `${s.activeReposThisWeek} active this week`,
    color: "var(--accent-salmon)",
  },
  {
    key: "activeReposThisWeek",
    label: "Active Repos (7d)",
    sub: () => "repos with commits",
    color: "var(--accent-purple)",
  },
] as const;

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="relative overflow-hidden rounded-xl bg-surface border border-border p-5"
        >
          <div
            className="absolute top-0 left-0 w-full h-[2px]"
            style={{ background: card.color }}
          />
          <p className="text-text-secondary text-sm font-medium mb-2">
            {card.label}
          </p>
          <p className="text-3xl font-bold tracking-tight">
            {formatNumber(stats[card.key])}
          </p>
          <p className="text-text-secondary text-xs mt-1">
            {card.sub(stats)}
          </p>
        </div>
      ))}
    </div>
  );
}
