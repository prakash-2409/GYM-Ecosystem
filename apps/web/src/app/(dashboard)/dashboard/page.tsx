'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Users, CalendarCheck, CreditCard, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { data: checkIns } = useQuery({
    queryKey: ['checkins-today'],
    queryFn: () => apiClient.get('/checkins/today').then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: dueMembers } = useQuery({
    queryKey: ['payments-due'],
    queryFn: () => apiClient.get('/payments/due').then((r) => r.data),
  });

  const todayCount = checkIns?.checkIns?.length || 0;
  const dueCount = dueMembers?.members?.length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={CalendarCheck} label="Check-ins Today" value={todayCount} color="bg-blue-500" />
        <StatCard icon={AlertTriangle} label="Fees Due" value={dueCount} color="bg-red-500" />
        <StatCard icon={Users} label="Total Members" value="—" color="bg-green-500" />
        <StatCard icon={CreditCard} label="Revenue (Month)" value="—" color="bg-purple-500" />
      </div>

      {/* Today's check-ins table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Today&apos;s Check-ins</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {checkIns?.checkIns?.map((ci: Record<string, unknown>) => (
                <tr key={ci.id as string} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(ci.checkedInAt as string).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium">
                    {(ci.member as Record<string, Record<string, string>>)?.user?.name || '—'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {((ci.member as Record<string, Array<Record<string, Record<string, string>>>>)?.subscriptions?.[0]?.plan?.name) || 'No plan'}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No check-ins yet today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
