'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton, StatCardSkeleton } from '@/components/ui/skeleton';
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
    }).filter((ci) => ci.isFirst);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 stagger-1">
        <div>
          <h1 className="text-page-title text-text-primary">Check-ins</h1>
          {isToday && (
            <p className="text-caption text-text-secondary mt-1">Auto-refreshes every 30 seconds</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              id="checkins-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input pl-9 w-48 font-mono"
            />
          </div>
          <button
            onClick={exportCSV}
            disabled={!enriched.length}
            className="btn btn-secondary"
          >
            <Download size={16} strokeWidth={1.5} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary stat */}
      {!isLoading && enriched.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-between-cards mb-between-sections stagger-2">
          <div className="stat-card">
            <span className="stat-card-label">Total Check-ins</span>
            <p className="stat-card-value mt-2">{enriched.length}</p>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Avg. Duration</span>
            <p className="stat-card-value mt-2">
              {formatDuration(
                enriched.reduce((sum, ci) => sum + (ci.durationMs || 0), 0) / enriched.filter(ci => ci.durationMs).length || null
              )}
            </p>
          </div>
          <div className="stat-card flex items-center justify-between">
            <div>
              <span className="stat-card-label">Status</span>
              <p className="stat-card-value mt-2">{isToday ? 'Live' : 'Historic'}</p>
            </div>
            {isToday && <Badge variant="active">Live</Badge>}
          </div>
        </div>
      )}

      <div className="stagger-3">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !enriched.length ? (
          <div className="card">
            <EmptyState
              icon={CalendarCheck}
              title="No check-ins"
              description={isToday ? 'No members have checked in yet today.' : `No check-ins found for ${selectedDate}.`}
            />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-surface">
                  <tr>
                    <th className="table-header text-left">Member</th>
                    <th className="table-header text-left">Time In</th>
                    <th className="table-header text-left">Duration</th>
                    <th className="table-header text-left">Source</th>
                    <th className="table-header text-left">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((ci) => (
                    <tr key={ci.id} className="table-row">
                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          {ci.member.user.avatarUrl ? (
                            <img src={ci.member.user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="avatar text-badge">
                              {ci.member.user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-table-row font-medium text-text-primary">{ci.member.user.name}</p>
                            <p className="text-caption text-text-muted font-mono">{ci.member.memberCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 text-table-row font-mono text-text-secondary">
                        {formatTime(ci.timeIn)}
                      </td>
                      <td className="px-4 text-table-row font-mono text-text-secondary">
                        {formatDuration(ci.durationMs)}
                      </td>
                      <td className="px-4">
                        <Badge variant={ci.source === 'kiosk' ? 'info' : 'default'}>
                          {ci.source}
                        </Badge>
                      </td>
                      <td className="px-4 text-table-row text-text-secondary">
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
    </div>
  );
}
