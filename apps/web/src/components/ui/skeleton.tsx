import { cn } from '@/lib/utils';

// ─── Base skeleton with shimmer animation ──────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton', className)} />
  );
}

// ─── Table skeleton — 5 rows matching real table dimensions ─
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface rounded-card border border-border-default overflow-hidden">
      {/* Header — 40px height */}
      <div className="flex items-center gap-6 px-4 h-table-header border-b border-divider">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-24" />
        ))}
      </div>

      {/* Rows — 52px height each */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-6 px-4 h-table-row border-b border-divider last:border-b-0"
        >
          {/* Avatar skeleton for first column */}
          {row >= 0 && (
            <Skeleton className="skeleton-avatar flex-shrink-0" />
          )}
          {Array.from({ length: cols - 1 }).map((_, col) => (
            <Skeleton
              key={col}
              className={cn(
                'skeleton-text',
                col === 0 ? 'w-32' : 'w-20'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Stat card skeleton — matches stat card dimensions ──────
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="skeleton-stat mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

// ─── Card skeleton — generic card shape ─────────────────────
export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton className="skeleton-text w-32 mb-4" />
      <Skeleton className="skeleton-heading w-20 mb-2" />
      <Skeleton className="skeleton-text w-48" />
    </div>
  );
}

// ─── Page skeleton — full page layout with stagger effect ───
export function PageSkeleton() {
  return (
    <div className="space-y-between-sections">
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-between-cards stagger-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <div className="stagger-2">
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-surface rounded-card border border-border p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-[46px] w-[46px] rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}
