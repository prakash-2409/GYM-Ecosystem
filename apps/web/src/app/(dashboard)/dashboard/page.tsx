'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Users, CalendarCheck, CreditCard, AlertTriangle } from 'lucide-react';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function DashboardPage() {
  const { data: checkIns, isLoading: checkInsLoading } = useQuery({
    queryKey: ['checkins-today'],
    queryFn: () => apiClient.get('/checkins/today').then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: dueMembers, isLoading: dueLoading } = useQuery({
    queryKey: ['payments-due'],
    queryFn: () => apiClient.get('/payments/due').then((r) => r.data),
  });

  const todayCount = checkIns?.checkIns?.length || 0;
  const dueCount = dueMembers?.members?.length || 0;

  return (
    <div>
      <h1 className="text-page-title text-text-primary mb-8 stagger-1">Dashboard</h1>

      {/* Stat cards — design system spec: #F5F5F4 bg, no border, 12px radius */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-between-cards mb-between-sections stagger-2">
        {checkInsLoading || dueLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={CalendarCheck}
              label="Check-ins Today"
              value={todayCount}
              trend={todayCount > 0 ? { direction: 'up', label: 'active' } : undefined}
            />
            <StatCard
              icon={AlertTriangle}
              label="Fees Due"
              value={dueCount}
              trend={dueCount > 0 ? { direction: 'down', label: 'pending' } : undefined}
            />
            <StatCard icon={Users} label="Total Members" value="—" />
            <StatCard icon={CreditCard} label="Revenue (Month)" value="—" />
          </>
        )}
      </div>

      {/* Today's check-ins table */}
      <div className="stagger-3">
        {checkInsLoading ? (
          <TableSkeleton rows={5} cols={3} />
        ) : (
          <div className="card p-0 overflow-hidden">
            {/* Section heading */}
            <div className="px-card-pad py-4 border-b border-divider">
              <h2 className="text-section-heading text-text-primary">Today&apos;s Check-ins</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header text-left">Time</th>
                    <th className="table-header text-left">Member</th>
                    <th className="table-header text-left">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns?.checkIns?.length > 0 ? (
                    checkIns.checkIns.map((ci: Record<string, unknown>) => (
                      <tr key={ci.id as string} className="table-row">
                        <td className="px-4 text-table-row text-text-secondary">
                          {new Date(ci.checkedInAt as string).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 text-table-row text-text-primary font-medium">
                          {(ci.member as Record<string, Record<string, string>>)?.user?.name || '—'}
                        </td>
                        <td className="px-4 text-table-row text-text-secondary">
                          {((ci.member as Record<string, Array<Record<string, Record<string, string>>>>)?.subscriptions?.[0]?.plan?.name) || 'No plan'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <EmptyState
                          icon={CalendarCheck}
                          title="No check-ins yet today"
                          description="Members will appear here as they check in"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card — matches design system exactly ──────────────
function StatCard({ icon: Icon, label, value, trend }: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down'; label: string };
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-card-label">{label}</span>
        <Icon size={20} strokeWidth={1.5} className="text-text-muted" />
      </div>
      <p className="stat-card-value">{value}</p>
      {trend && (
        <span className={`stat-card-trend ${trend.direction === 'up' ? 'up' : 'down'} mt-1`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.label}
        </span>
      )}
    </div>
  );
}
