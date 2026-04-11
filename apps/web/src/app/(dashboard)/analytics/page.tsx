'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, LogIn, Activity } from 'lucide-react';

// Design system–aligned chart palette
const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  // Dashboard Overview — Real-time stats
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboard').then((r) => r.data),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => apiClient.get('/analytics/revenue').then((r) => r.data),
  });

  const { data: peakHours } = useQuery({
    queryKey: ['analytics-peak-hours'],
    queryFn: () => apiClient.get('/analytics/peak-hours').then((r) => r.data),
  });

  const { data: planPop } = useQuery({
    queryKey: ['analytics-plan-popularity'],
    queryFn: () => apiClient.get('/analytics/plan-popularity').then((r) => r.data),
  });

  const { data: churn } = useQuery({
    queryKey: ['analytics-churn-risk'],
    queryFn: () => apiClient.get('/analytics/churn-risk').then((r) => r.data),
  });

  const { data: growth } = useQuery({
    queryKey: ['analytics-member-growth'],
    queryFn: () => apiClient.get('/analytics/member-growth').then((r) => r.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 stagger-1">
        <div>
          <h1 className="text-page-title text-text-primary">Analytics</h1>
          <p className="text-body text-text-secondary mt-2">Real-time gym performance dashboard</p>
        </div>
      </div>

      {/* Dashboard Overview Stats — 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-2">
        {dashLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-caption text-text-secondary font-medium mb-2">Active Members</p>
                  <p className="text-heading text-text-primary">{dashboard?.stats?.activeMembers || 0}</p>
                  <p className="text-caption text-text-muted mt-1">of {dashboard?.stats?.totalMembers || 0} total</p>
                </div>
                <Users size={20} className="text-primary opacity-40" strokeWidth={1.5} />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-caption text-text-secondary font-medium mb-2">Today's Check-ins</p>
                  <p className="text-heading text-text-primary">{dashboard?.stats?.todayCheckIns || 0}</p>
                  <p className="text-caption text-text-muted mt-1">{dashboard?.stats?.mobileCheckInsToday || 0} from mobile</p>
                </div>
                <LogIn size={20} className="text-success opacity-40" strokeWidth={1.5} />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-caption text-text-secondary font-medium mb-2">Revenue (This Month)</p>
                  <p className="text-heading text-text-primary">₹{(dashboard?.stats?.revenueThisMonth || 0).toLocaleString('en-IN')}</p>
                  <p className="text-caption text-text-muted mt-1">{dashboard?.stats?.paymentsThisMonth || 0} payments</p>
                </div>
                <DollarSign size={20} className="text-warning opacity-40" strokeWidth={1.5} />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-caption text-text-secondary font-medium mb-2">At Risk</p>
                  <p className="text-heading text-text-primary">{dashboard?.stats?.overdueMembers || 0}</p>
                  <p className="text-caption text-text-muted mt-1">{dashboard?.stats?.expiringSoonMembers || 0} expiring soon</p>
                </div>
                <AlertTriangle size={20} className="text-danger opacity-40" strokeWidth={1.5} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 stagger-3">
        {revLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="card p-4">
              <p className="text-caption text-text-secondary font-medium mb-2">This Month Revenue</p>
              <p className="text-heading text-text-primary">
                ₹{(revenue?.currentMonth || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-caption text-text-secondary font-medium mb-2">Last Month Revenue</p>
              <p className="text-heading text-text-primary">
                ₹{(revenue?.lastMonth || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-caption text-text-secondary font-medium mb-2">Month-over-Month</p>
              <div className="flex items-baseline gap-2">
                <p className="text-heading text-text-primary">
                  {revenue?.changePercent >= 0 ? '+' : ''}{revenue?.changePercent || 0}%
                </p>
                {revenue && (
                  <span className={`flex items-center gap-1 text-caption font-medium ${revenue.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                    {revenue.changePercent >= 0 ? (
                      <TrendingUp size={14} strokeWidth={1.5} />
                    ) : (
                      <TrendingDown size={14} strokeWidth={1.5} />
                    )}
                    {revenue.changePercent >= 0 ? 'Growth' : 'Decline'}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 stagger-5">
        {/* Peak hours chart */}
        <div className="card">
          <h3 className="text-section-heading text-text-primary mb-6">Peak Hours (Last 30 Days)</h3>
          <div className="h-64">
            {peakHours?.hours && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours.hours.filter((h: { hour: number }) => h.hour >= 5 && h.hour <= 23)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                  <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}:00`} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(h: number) => `${h}:00 - ${h + 1}:00`}
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--color-divider)', fontSize: 13 }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Plan popularity chart */}
        <div className="card">
          <h3 className="text-section-heading text-text-primary mb-6">Plan Popularity</h3>
          <div className="h-64">
            {planPop?.plans && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planPop.plans} dataKey="count" nameKey="planName" cx="50%" cy="50%" outerRadius={80} label>
                    {planPop.plans.map((_: unknown, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-divider)', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Member growth chart */}
      <div className="card mb-8 stagger-6">
        <h3 className="text-section-heading text-text-primary mb-6">Member Growth (12 Months)</h3>
        <div className="h-64">
          {growth?.monthly && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-divider)', fontSize: 13 }} />
                <Line type="monotone" dataKey="totalMembers" stroke="#4F46E5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="newMembers" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Check-ins & Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 stagger-7">
        {/* Recent Check-ins */}
        <div className="card p-0 overflow-hidden">
          <div className="px-card-pad py-4 border-b border-divider">
            <h3 className="text-section-heading text-text-primary">Recent Check-ins</h3>
          </div>
          {!dashboard?.recentCheckIns || dashboard.recentCheckIns.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={LogIn}
                title="No check-ins"
                description="Check-ins will appear here"
              />
            </div>
          ) : (
            <div className="divide-y divide-divider">
              {dashboard.recentCheckIns.slice(0, 6).map((ci: Record<string, unknown>) => (
                <div key={ci.id as string} className="px-card-pad py-3 hover:bg-page transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                      {((ci.member as Record<string, unknown>)?.name as string)?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-text-primary truncate">{(ci.member as Record<string, unknown>)?.name as string}</p>
                      <p className="text-caption text-text-muted font-mono">{new Date(ci.checkedInAt as string).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <Badge variant={ci.source === 'app' ? 'default' : 'info'}>
                      {ci.source === 'app' ? '📱' : '🔲'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Joined Members */}
        <div className="card p-0 overflow-hidden">
          <div className="px-card-pad py-4 border-b border-divider">
            <h3 className="text-section-heading text-text-primary">Recently Joined</h3>
          </div>
          {!dashboard?.recentMembers || dashboard.recentMembers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Users}
                title="No new members"
                description="New members will appear here"
              />
            </div>
          ) : (
            <div className="divide-y divide-divider">
              {dashboard.recentMembers.slice(0, 6).map((m: Record<string, unknown>) => (
                <div key={m.id as string} className="px-card-pad py-3 hover:bg-page transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-text-primary truncate">{m.name as string}</p>
                      <p className="text-caption text-text-muted font-mono">{m.phone as string}</p>
                      <p className="text-caption text-text-secondary mt-1">{m.planName as string}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Churn risk table */}
      <div className="stagger-8">
        <div className="card p-0 overflow-hidden">
          <div className="px-card-pad py-4 border-b border-divider">
            <h3 className="text-section-heading text-text-primary">At-Risk Members (7+ Days Inactive)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr className="border-b border-divider">
                  <th className="table-header text-left">Member</th>
                  <th className="table-header text-left">Phone</th>
                  <th className="table-header text-left">Plan</th>
                  <th className="table-header text-left">Days Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {churn?.members?.length > 0 ? (
                  churn.members.map((m: Record<string, unknown>) => (
                    <tr key={m.memberId as string} className="hover:bg-page transition-colors duration-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-xs">
                            {(m.name as string)?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-body font-medium text-text-primary">{m.name as string}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body font-mono text-text-secondary">{m.phone as string}</td>
                      <td className="px-4 py-3 text-body text-text-secondary">{m.planName as string}</td>
                      <td className="px-4 py-3">
                        <Badge variant="overdue">
                          {m.daysSinceLastVisit ? `${m.daysSinceLastVisit} days` : 'Never'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="p-8">
                        <EmptyState
                          icon={AlertTriangle}
                          title="No at-risk members"
                          description="All members have been active recently"
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
