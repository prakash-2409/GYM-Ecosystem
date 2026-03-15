'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { CalendarCheck, Download, Calendar } from 'lucide-react';

interface CheckInRow {
  id: string;
  checkedInAt: string;
  source: string;
  member: {
    id: string;
    memberCode: string;
    user: { name: string; avatarUrl: string | null };
    subscriptions: { plan: { name: string } }[];
  };
}

export default function CheckInsPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['checkins', selectedDate],
    queryFn: () =>
      apiClient.get('/checkins/by-date', { params: { date: selectedDate } }).then((r) => r.data),
    refetchInterval: isToday ? 30000 : false,
  });

  const checkIns: CheckInRow[] = data?.checkIns || [];

  // Pair check-ins by member for the same day to compute duration
  const enriched = useMemo(() => {
    const grouped = new Map<string, CheckInRow[]>();
    checkIns.forEach((ci) => {
      const key = ci.member.id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(ci);
    });

    return checkIns.map((ci) => {
      const memberCheckins = grouped.get(ci.member.id) || [];
      const sorted = memberCheckins.sort(
        (a, b) => new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime()
      );
      const firstIn = sorted[0];
      const lastIn = sorted[sorted.length - 1];
      const timeIn = new Date(firstIn.checkedInAt);
      const durationMs =
        sorted.length > 1 ? new Date(lastIn.checkedInAt).getTime() - timeIn.getTime() : null;

      return { ...ci, timeIn, durationMs, isFirst: ci.id === firstIn.id };
    }).filter((ci) => ci.isFirst); // Show one row per member
  }, [checkIns]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
  };

  const exportCSV = () => {
    const headers = ['Member Name', 'Member Code', 'Time In', 'Source', 'Plan'];
    const rows = enriched.map((ci) => [
      ci.member.user.name,
      ci.member.memberCode,
      formatTime(ci.timeIn),
      ci.source,
      ci.member.subscriptions?.[0]?.plan?.name || 'No plan',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkins-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Check-ins</h1>
          {isToday && (
            <p className="text-sm text-gray-500 mt-1">Auto-refreshes every 30 seconds</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 pl-9 pr-3 border border-border rounded-btn text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
            />
          </div>
          <button
            onClick={exportCSV}
            disabled={!enriched.length}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors duration-150"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : !enriched.length ? (
        <div className="bg-surface rounded-card border border-border">
          <EmptyState
            icon={<CalendarCheck size={28} />}
            title="No check-ins"
            description={isToday ? 'No members have checked in yet today.' : `No check-ins found for ${selectedDate}.`}
          />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-border overflow-hidden">
          <div className="px-6 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900 font-mono">{enriched.length}</span> check-ins
            </p>
            {isToday && (
              <Badge variant="info">Live</Badge>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enriched.map((ci) => (
                  <tr key={ci.id} className="hover:bg-[#F5F5F5] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {ci.member.user.avatarUrl ? (
                          <img src={ci.member.user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {ci.member.user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ci.member.user.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{ci.member.memberCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {formatTime(ci.timeIn)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {formatDuration(ci.durationMs)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={ci.source === 'kiosk' ? 'info' : 'default'}>
                        {ci.source}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ci.member.subscriptions?.[0]?.plan?.name || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
