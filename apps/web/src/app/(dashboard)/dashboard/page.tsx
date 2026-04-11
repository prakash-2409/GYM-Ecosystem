'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  RefreshCcw,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton';

type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  todayCheckIns: number;
  mobileCheckInsToday: number;
  mobileConnectedMembers: number;
  bodyStatsThisMonth: number;
  workoutAssignments: number;
  dietAssignments: number;
  overdueMembers: number;
  expiringSoonMembers: number;
  revenueThisMonth: number;
  paymentsThisMonth: number;
};

type CheckInRow = {
  id: string;
  checkedInAt: string;
  source: string;
  member: {
    id: string;
    name: string;
    avatarUrl: string | null;
    memberCode: string;
  };
  planName: string | null;
};

type RecentMember = {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  joinedAt: string;
  planName: string | null;
  subscriptionEndDate: string | null;
};

type MobileActivityRow = {
  memberId: string;
  name: string;
  memberCode: string;
  phone: string;
  planName: string | null;
  subscriptionEndDate: string | null;
  daysRemaining: number | null;
  lastCheckInAt: string | null;
  lastCheckInSource: string | null;
  monthlyVisits: number;
  lastPaymentAt: string | null;
  lastPaymentAmount: number | null;
  lastPaymentMethod: string | null;
  lastBodyStatAt: string | null;
  latestWeightKg: number | null;
  workoutPlanName: string | null;
  dietChartName: string | null;
  mobileConnected: boolean;
  lastLoginAt: string | null;
  lastNotificationAt: string | null;
  lastNotificationChannel: string | null;
  lastNotificationStatus: string | null;
  lastActivityAt: string;
};

type DashboardOverview = {
  stats: DashboardStats;
  recentCheckIns: CheckInRow[];
  recentMembers: RecentMember[];
  mobileActivity: MobileActivityRow[];
};

function formatDateTime(value: string | null) {
  if (!value) return 'No data';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string | null) {
  if (!value) return 'No plan';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value: number) {
  return `INR ${value.toLocaleString('en-IN')}`;
}

function subscriptionBadge(daysRemaining: number | null) {
  if (daysRemaining == null) return <Badge variant="expired">No plan</Badge>;
  if (daysRemaining <= 0) return <Badge variant="overdue">Overdue</Badge>;
  if (daysRemaining <= 7) return <Badge variant="expiring">Expiring</Badge>;
  return <Badge variant="active">{daysRemaining} days left</Badge>;
}

function sourceBadge(source: string | null) {
  if (source === 'app') return <Badge variant="active">App</Badge>;
  if (source === 'kiosk') return <Badge variant="info">Kiosk</Badge>;
  return <Badge variant="default">Unknown</Badge>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-caption uppercase tracking-[0.16em] text-text-muted">{label}</p>
          <p className="text-page-title text-text-primary mt-3">{value}</p>
          <p className="text-caption text-text-secondary mt-2">{helper}</p>
        </div>
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isRefetching } = useQuery<DashboardOverview>({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiClient.get('/analytics/dashboard').then((r) => r.data),
    refetchInterval: 15000,
  });

  const stats = data?.stats;
  const primaryStats = stats
    ? [
        {
          icon: CalendarCheck,
          label: 'Check-ins Today',
          value: stats.todayCheckIns,
          helper: `${stats.mobileCheckInsToday} came from the mobile app`,
        },
        {
          icon: Users,
          label: 'Active Members',
          value: stats.activeMembers,
          helper: `${stats.totalMembers} total members in the gym`,
        },
        {
          icon: Smartphone,
          label: 'Mobile Connected',
          value: stats.mobileConnectedMembers,
          helper: 'Members with recent app login or push token',
        },
        {
          icon: Sparkles,
          label: 'Needs Attention',
          value: stats.overdueMembers + stats.expiringSoonMembers,
          helper: `${stats.overdueMembers} overdue, ${stats.expiringSoonMembers} expiring soon`,
        },
      ]
    : [];

  const secondaryStats = stats
    ? [
        user?.role === 'coach'
          ? {
              icon: Activity,
              label: 'Progress Logs',
              value: stats.bodyStatsThisMonth,
              helper: 'Body stat entries recorded this month',
            }
          : {
              icon: CreditCard,
              label: 'Collections',
              value: formatCurrency(stats.revenueThisMonth),
              helper: `${stats.paymentsThisMonth} payments recorded this month`,
            },
        {
          icon: UserPlus,
          label: 'New Members',
          value: stats.newMembersThisMonth,
          helper: 'Joined this month',
        },
        {
          icon: Dumbbell,
          label: 'Workout Assignments',
          value: stats.workoutAssignments,
          helper: 'Members with active workout plans',
        },
        {
          icon: UtensilsCrossed,
          label: 'Diet Assignments',
          value: stats.dietAssignments,
          helper: 'Members with active diet charts',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-page-title text-text-primary">Admin Dashboard</h1>
          <p className="text-body text-text-secondary mt-2 max-w-3xl">
            This view tracks live member operations from check-ins, mobile usage, progress entries, assignments, and payments so admin data reflects what members do in the app.
          </p>
        </div>
        <div className="flex items-center gap-2 text-caption text-text-muted">
          <RefreshCcw size={14} className={isRefetching ? 'animate-spin' : ''} />
          Refreshes every 15 seconds
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-between-cards">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={`primary-${index}`} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-between-cards">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={`secondary-${index}`} />
            ))}
          </div>
          <TableSkeleton rows={6} cols={5} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-between-cards">
            {primaryStats.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-between-cards">
            {secondaryStats.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-between-sections">
            <div className="xl:col-span-2 card p-0 overflow-hidden">
              <div className="px-card-pad py-4 border-b border-divider flex items-center justify-between">
                <div>
                  <h2 className="text-section-heading text-text-primary">Recent Check-ins</h2>
                  <p className="text-caption text-text-secondary mt-1">
                    Live attendance coming from kiosk and mobile QR check-in flows.
                  </p>
                </div>
                <Badge variant="info">{data?.recentCheckIns.length || 0} recent</Badge>
              </div>
              {data?.recentCheckIns.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-surface">
                      <tr>
                        <th className="table-header text-left">Member</th>
                        <th className="table-header text-left">Plan</th>
                        <th className="table-header text-left">Source</th>
                        <th className="table-header text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentCheckIns.map((row) => (
                        <tr key={row.id} className="table-row">
                          <td className="px-4">
                            <div className="flex items-center gap-3">
                              {row.member.avatarUrl ? (
                                <img src={row.member.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                              ) : (
                                <div className="avatar text-badge">{row.member.name[0]?.toUpperCase() || '?'}</div>
                              )}
                              <div>
                                <p className="text-table-row font-medium text-text-primary">{row.member.name}</p>
                                <p className="text-caption text-text-muted font-mono">{row.member.memberCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 text-table-row text-text-secondary">{row.planName || 'No plan'}</td>
                          <td className="px-4">{sourceBadge(row.source)}</td>
                          <td className="px-4 text-table-row font-mono text-text-secondary">
                            {formatDateTime(row.checkedInAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={CalendarCheck}
                  title="No recent check-ins"
                  description="Check-ins from kiosk and mobile QR will appear here."
                />
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-section-heading text-text-primary">Recent Members</h2>
                  <p className="text-caption text-text-secondary mt-1">
                    Newly added members and their active plan state.
                  </p>
                </div>
                <Badge variant="default">{data?.recentMembers.length || 0}</Badge>
              </div>
              <div className="mt-5 space-y-4">
                {data?.recentMembers.length ? (
                  data.recentMembers.map((member) => (
                    <div key={member.id} className="rounded-btn border border-divider p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-body font-medium text-text-primary">{member.name}</p>
                          <p className="text-caption text-text-muted font-mono mt-1">{member.memberCode}</p>
                        </div>
                        <Badge variant="default">{formatDate(member.joinedAt)}</Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-caption text-text-secondary">{member.phone}</p>
                        <p className="text-caption text-text-secondary">
                          {member.planName || 'No active plan'} {member.subscriptionEndDate ? `until ${formatDate(member.subscriptionEndDate)}` : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No members yet"
                    description="Newly joined members will appear here."
                  />
                )}
              </div>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-card-pad py-4 border-b border-divider flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <h2 className="text-section-heading text-text-primary">Mobile Member Reflection</h2>
                <p className="text-caption text-text-secondary mt-1">
                  End-to-end admin visibility for members actively using the app: login, app check-ins, payments, body stats, workout assignment, diet assignment, and notification status.
                </p>
              </div>
              <Badge variant="active">{data?.mobileActivity.length || 0} tracked members</Badge>
            </div>

            {data?.mobileActivity.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px]">
                  <thead className="sticky top-0 z-10 bg-surface">
                    <tr>
                      <th className="table-header text-left">Member</th>
                      <th className="table-header text-left">Membership</th>
                      <th className="table-header text-left">Attendance</th>
                      <th className="table-header text-left">Payments</th>
                      <th className="table-header text-left">Progress</th>
                      <th className="table-header text-left">Programs</th>
                      <th className="table-header text-left">App / Notifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mobileActivity.map((row) => (
                      <tr key={row.memberId} className="table-row align-top">
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-table-row font-medium text-text-primary">{row.name}</p>
                            <p className="text-caption text-text-muted font-mono">{row.memberCode}</p>
                            <p className="text-caption text-text-secondary">{row.phone}</p>
                            <p className="text-caption text-text-muted">
                              Last activity: {formatDateTime(row.lastActivityAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-table-row text-text-primary">{row.planName || 'No plan assigned'}</p>
                            {subscriptionBadge(row.daysRemaining)}
                            <p className="text-caption text-text-secondary">
                              Ends: {formatDate(row.subscriptionEndDate)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            {sourceBadge(row.lastCheckInSource)}
                            <p className="text-caption text-text-secondary">
                              Last check-in: {formatDateTime(row.lastCheckInAt)}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Visits this month: {row.monthlyVisits}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-caption text-text-secondary">
                              Last payment: {row.lastPaymentAmount != null ? formatCurrency(row.lastPaymentAmount) : 'No payment yet'}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Method: {row.lastPaymentMethod || 'No payment'}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Recorded: {formatDateTime(row.lastPaymentAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-caption text-text-secondary">
                              Latest weight: {row.latestWeightKg != null ? `${row.latestWeightKg.toFixed(1)} kg` : 'Not recorded'}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Last body stat: {formatDateTime(row.lastBodyStatAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-caption text-text-secondary">
                              Workout: {row.workoutPlanName || 'Not assigned'}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Diet: {row.dietChartName || 'Not assigned'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <Badge variant={row.mobileConnected ? 'active' : 'default'}>
                              {row.mobileConnected ? 'App connected' : 'No app signal'}
                            </Badge>
                            <p className="text-caption text-text-secondary">
                              Last login: {formatDateTime(row.lastLoginAt)}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Last notification: {row.lastNotificationChannel || 'None'} {row.lastNotificationStatus ? `(${row.lastNotificationStatus})` : ''}
                            </p>
                            <p className="text-caption text-text-secondary">
                              Notification time: {formatDateTime(row.lastNotificationAt)}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No mobile activity captured yet"
                description="As members log in on mobile, check in, pay, or update progress, their records will appear here automatically."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
