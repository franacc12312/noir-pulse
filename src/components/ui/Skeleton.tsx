export function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface border border-border p-5 animate-pulse">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-surface-elevated" />
      <div className="h-3 w-24 bg-surface-elevated rounded mb-3" />
      <div className="h-8 w-20 bg-surface-elevated rounded mb-2" />
      <div className="h-2.5 w-32 bg-surface-elevated rounded" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="h-3 w-40 bg-surface-elevated rounded mb-4" />
      <div className="h-[280px] bg-surface-elevated rounded" />
    </div>
  );
}

export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
