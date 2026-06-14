'use client';

// ─── Skeleton Screens for Member App ────────────────────────
// Per DESIGN_SYSTEM.md: NEVER show a spinner alone. Always skeleton shimmer.

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-white/[0.06] rounded-2xl animate-pulse ${className || ''}`} />
  );
}

export function HomeTabSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-14 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <ShimmerBlock className="w-28 h-3 mb-2 rounded-lg" />
            <ShimmerBlock className="w-40 h-6 rounded-lg" />
          </div>
          <ShimmerBlock className="w-11 h-11 rounded-full" />
        </div>
        {/* CTA button */}
        <ShimmerBlock className="w-full h-14 rounded-2xl" />
      </div>

      {/* Stats row */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Plan card */}
      <div className="px-5 mb-6">
        <ShimmerBlock className="h-36 rounded-2xl" />
      </div>

      {/* Attendance */}
      <div className="px-5 mb-6">
        <ShimmerBlock className="w-32 h-4 mb-3 rounded-lg" />
        <ShimmerBlock className="h-32 rounded-2xl" />
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-6 space-y-2">
        <ShimmerBlock className="w-28 h-4 mb-1 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <ShimmerBlock key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function NotificationsTabSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-14 pb-4">
        <ShimmerBlock className="w-36 h-7 rounded-lg mb-2" />
        <ShimmerBlock className="w-20 h-3 rounded-lg" />
      </div>
      {/* Filter pills */}
      <div className="px-5 mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerBlock key={i} className="w-16 h-8 rounded-full" />
        ))}
      </div>
      {/* Notification cards */}
      <div className="px-5 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <ShimmerBlock key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function ProgressTabSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-14 pb-4">
        <ShimmerBlock className="w-28 h-7 rounded-lg mb-2" />
        <ShimmerBlock className="w-36 h-3 rounded-lg" />
      </div>
      {/* Stats cards */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <ShimmerBlock className="h-24 rounded-2xl" />
          <ShimmerBlock className="h-24 rounded-2xl" />
        </div>
      </div>
      {/* Chart */}
      <div className="px-5 mb-5">
        <ShimmerBlock className="h-64 rounded-2xl" />
      </div>
      {/* Measurements */}
      <div className="px-5 mb-5">
        <ShimmerBlock className="w-40 h-4 rounded-lg mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShimmerBlock key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileTabSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-14 pb-4 flex flex-col items-center">
        <ShimmerBlock className="w-20 h-20 rounded-full mb-4" />
        <ShimmerBlock className="w-32 h-6 rounded-lg mb-2" />
        <ShimmerBlock className="w-24 h-3 rounded-lg" />
      </div>
      {/* QR Card */}
      <div className="px-5 mb-5">
        <ShimmerBlock className="h-56 rounded-2xl" />
      </div>
      {/* Info rows */}
      <div className="px-5 mb-5">
        <ShimmerBlock className="h-64 rounded-2xl" />
      </div>
      {/* Actions */}
      <div className="px-5 mb-5 space-y-3">
        <ShimmerBlock className="h-12 rounded-2xl" />
        <ShimmerBlock className="h-12 rounded-2xl" />
      </div>
    </div>
  );
}
