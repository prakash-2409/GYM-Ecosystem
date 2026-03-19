'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

// Design system–aligned chart palette
const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
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
      <h1 className="text-page-title text-text-primary mb-8 stagger-1">Analytics</h1>

      {/* Revenue stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-between-cards mb-between-sections stagger-2">
        {revLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-card-label">This Month</span>
              <p className="stat-card-value mt-2">
                {revenue ? `₹${revenue.currentMonth.toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Last Month</span>
              <p className="stat-card-value mt-2">
                {revenue ? `₹${revenue.lastMonth.toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Change</span>
              <p className="stat-card-value mt-2">
                {revenue ? `${revenue.changePercent >= 0 ? '+' : ''}${revenue.changePercent}%` : '—'}
              </p>
              {revenue && (
                <span className={`stat-card-trend ${revenue.changePercent >= 0 ? 'up' : 'down'} mt-1`}>
                  {revenue.changePercent >= 0 ? <TrendingUp size={13} strokeWidth={1.5} /> : <TrendingDown size={13} strokeWidth={1.5} />}
                  {revenue.changePercent >= 0 ? 'growth' : 'decline'}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-between-sections mb-between-sections stagger-3">
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
      <div className="card mb-between-sections stagger-4">
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

      {/* Churn risk table */}
      <div className="stagger-5">
        <div className="card p-0 overflow-hidden">
          <div className="px-card-pad py-4 border-b border-divider">
            <h3 className="text-section-heading text-text-primary">Churn Risk (7+ days inactive)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr>
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left">Phone</th>
                  <th className="table-header text-left">Plan</th>
                  <th className="table-header text-left">Days Absent</th>
                </tr>
              </thead>
              <tbody>
                {churn?.members?.length > 0 ? (
                  churn.members.map((m: Record<string, unknown>) => (
                    <tr key={m.memberId as string} className="table-row">
                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar text-badge">{(m.name as string)?.[0]?.toUpperCase()}</div>
                          <span className="text-table-row font-medium text-text-primary">{m.name as string}</span>
                        </div>
                      </td>
                      <td className="px-4 text-table-row font-mono text-text-secondary">{m.phone as string}</td>
                      <td className="px-4 text-table-row text-text-secondary">{m.planName as string}</td>
                      <td className="px-4">
                        <Badge variant="overdue">
                          {m.daysSinceLastVisit ? `${m.daysSinceLastVisit} days` : 'Never visited'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <EmptyState
                        icon={AlertTriangle}
                        title="No at-risk members"
                        description="All members have been active recently"
                      />
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
