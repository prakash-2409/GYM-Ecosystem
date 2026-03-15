'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const { data: revenue } = useQuery({
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
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-3xl font-bold mt-1">
            {revenue ? `₹${revenue.currentMonth.toLocaleString('en-IN')}` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Last Month</p>
          <p className="text-3xl font-bold mt-1">
            {revenue ? `₹${revenue.lastMonth.toLocaleString('en-IN')}` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Change</p>
          <p className={`text-3xl font-bold mt-1 ${
            revenue?.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {revenue ? `${revenue.changePercent >= 0 ? '+' : ''}${revenue.changePercent}%` : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Peak hours */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Peak Hours (Last 30 Days)</h3>
          <div className="h-64">
            {peakHours?.hours && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours.hours.filter((h: { hour: number }) => h.hour >= 5 && h.hour <= 23)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}:00`} />
                  <YAxis />
                  <Tooltip labelFormatter={(h: number) => `${h}:00 - ${h + 1}:00`} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Plan popularity */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Plan Popularity</h3>
          <div className="h-64">
            {planPop?.plans && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planPop.plans} dataKey="count" nameKey="planName" cx="50%" cy="50%" outerRadius={80} label>
                    {planPop.plans.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Member growth */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Member Growth (12 Months)</h3>
        <div className="h-64">
          {growth?.monthly && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalMembers" stroke="#2563EB" strokeWidth={2} />
                <Line type="monotone" dataKey="newMembers" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Churn risk */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Churn Risk (7+ days inactive)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {churn?.members?.map((m: Record<string, unknown>) => (
                <tr key={m.memberId as string} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium">{m.name as string}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{m.phone as string}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{m.planName as string}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {m.daysSinceLastVisit ? `${m.daysSinceLastVisit} days` : 'Never visited'}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No at-risk members</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
