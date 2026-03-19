'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus,
  IndianRupee, Bell, CheckCircle2, Plus as PlusIcon, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Drawer } from '@/components/ui/drawer';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

type TabKey = 'overview' | 'attendance' | 'progress' | 'fees' | 'notifications';

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showCollectDrawer, setShowCollectDrawer] = useState(false);
  const [showStatDrawer, setShowStatDrawer] = useState(false);
  const [collectForm, setCollectForm] = useState({ amount: '', method: 'cash', notes: '' });
  const [statForm, setStatForm] = useState({ weightKg: '', chestCm: '', waistCm: '', bicepCm: '', thighCm: '', hipsCm: '' });
  const [attendMonth, setAttendMonth] = useState(new Date().getMonth() + 1);
  const [attendYear, setAttendYear] = useState(new Date().getFullYear());
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => apiClient.get(`/members/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', id, attendMonth, attendYear],
    queryFn: () => apiClient.get(`/members/${id}/attendance`, { params: { month: attendMonth, year: attendYear } }).then((r) => r.data),
    enabled: activeTab === 'attendance',
  });

  const { data: bodyStats } = useQuery({
    queryKey: ['bodystats', id],
    queryFn: () => apiClient.get(`/bodystats/${id}/comparison`).then((r) => r.data),
    enabled: activeTab === 'progress',
  });

  const { data: weightHistory } = useQuery({
    queryKey: ['weight-history', id],
    queryFn: () => apiClient.get(`/bodystats/${id}/weight-history`).then((r) => r.data),
    enabled: activeTab === 'progress',
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => apiClient.get('/payments', { params: { memberId: id, limit: 50 } }).then((r) => r.data),
    enabled: activeTab === 'fees',
  });

  const { data: notifHistory } = useQuery({
    queryKey: ['notifications', id],
    queryFn: () => apiClient.get('/notifications', { params: { memberId: id } }).then((r) => r.data),
    enabled: activeTab === 'notifications',
  });

  const collectMutation = useMutation({
    mutationFn: (formData: { memberId: string; amount: number; paymentMethod: string; notes: string }) =>
      apiClient.post('/payments', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      setShowCollectDrawer(false);
      setCollectForm({ amount: '', method: 'cash', notes: '' });
    },
  });

  const statMutation = useMutation({
    mutationFn: (formData: Record<string, number | undefined>) =>
      apiClient.post(`/bodystats/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodystats', id] });
      queryClient.invalidateQueries({ queryKey: ['weight-history', id] });
      setShowStatDrawer(false);
      setStatForm({ weightKg: '', chestCm: '', waistCm: '', bicepCm: '', thighCm: '', hipsCm: '' });
    },
  });

  // ─── Loading skeleton ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="card space-y-4">
          <div className="flex items-start gap-5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-badge" />
                <Skeleton className="h-5 w-20 rounded-badge" />
              </div>
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 rounded-card" />
            <Skeleton className="h-16 rounded-card" />
            <Skeleton className="h-16 rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  const member = data?.member;
  const activeSub = data?.activeSubscription;
  const totalVisits = data?.totalVisits || 0;

  if (!member) {
    return (
      <div className="card">
        <EmptyState
          title="Member not found"
          description="This member doesn't exist or has been removed"
          action={<Link href="/members" className="btn btn-primary">Back to Members</Link>}
        />
      </div>
    );
  }

  const userName = member.user?.name || 'Unknown';
  const daysRemaining = activeSub
    ? Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalDays = activeSub
    ? Math.ceil((new Date(activeSub.endDate).getTime() - new Date(activeSub.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const progressPercent = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));
  const progressColorClass = daysRemaining <= 0 ? 'bg-danger' : daysRemaining <= 7 ? 'bg-warning' : 'bg-success';
  const statusVariant: 'active' | 'expiring' | 'expired' = daysRemaining <= 0 ? 'expired' : daysRemaining <= 7 ? 'expiring' : 'active';

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'progress', label: 'Progress' },
    { key: 'fees', label: 'Fee History' },
    { key: 'notifications', label: 'Notifications' },
  ];

  return (
    <div>
      {/* Back button */}
      <Link
        href="/members"
        className="inline-flex items-center gap-2 text-caption text-text-secondary hover:text-text-primary mb-4 transition-colors duration-normal stagger-1"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Members
      </Link>

      {/* ─── Profile Header ────────────────────────────────── */}
      <div className="card mb-between-cards stagger-2">
        <div className="flex items-start gap-5">
          {/* Large avatar with initials */}
          <div className="avatar-xl flex-shrink-0">{userName[0]?.toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-page-title text-text-primary">{userName}</h1>
            <p className="text-caption font-mono text-text-secondary mt-1">{member.memberCode}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeSub && (
                <Badge variant="coach">{activeSub.plan?.name}</Badge>
              )}
              <Badge variant={statusVariant}>
                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress bar — green to orange to red */}
        {activeSub && (
          <div className="mt-4">
            <div className="flex justify-between text-caption text-text-muted mb-1">
              <span>{new Date(activeSub.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span>{new Date(activeSub.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="h-2 bg-divider rounded-full overflow-hidden">
              <div className={`h-full ${progressColorClass} rounded-full transition-all duration-stat`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Stats row — 4 stat cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-between-cards">
          <div className="stat-card text-center">
            <p className="stat-card-value">{totalVisits}</p>
            <p className="stat-card-label mt-1">Total Visits</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-card-value">{daysRemaining}</p>
            <p className="stat-card-label mt-1">Days Left</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-card-value">—</p>
            <p className="stat-card-label mt-1">This Month</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-card-value">—</p>
            <p className="stat-card-label mt-1">Streak</p>
          </div>
        </div>
      </div>

      {/* ─── Tab navigation ────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-divider overflow-x-auto stagger-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-underline px-4 py-3 text-body font-medium whitespace-nowrap transition-colors duration-normal ${
              activeTab === tab.key
                ? 'active text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ───────────────────────────────────── */}
      <div className="card stagger-4">
        {/* ── Overview ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-card-heading text-text-primary mb-4">Personal Info</h3>
              <div className="grid grid-cols-2 gap-4 text-body">
                <div><span className="text-text-secondary">Phone:</span> <span className="font-medium text-text-primary">{member.user?.phone}</span></div>
                <div><span className="text-text-secondary">Email:</span> <span className="font-medium text-text-primary">{member.user?.email || '—'}</span></div>
                <div><span className="text-text-secondary">DOB:</span> <span className="font-medium text-text-primary">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span></div>
                <div><span className="text-text-secondary">Gender:</span> <span className="font-medium text-text-primary">{member.gender || '—'}</span></div>
                <div><span className="text-text-secondary">Blood Group:</span> <span className="font-medium text-text-primary">{member.bloodGroup || '—'}</span></div>
                <div><span className="text-text-secondary">Emergency:</span> <span className="font-medium text-text-primary">{member.emergencyPhone || '—'}</span></div>
              </div>
            </div>
            {activeSub && (
              <div className="pt-6 border-t border-divider">
                <h3 className="text-card-heading text-text-primary mb-4">Current Plan</h3>
                <div className="grid grid-cols-2 gap-4 text-body">
                  <div><span className="text-text-secondary">Plan:</span> <span className="font-medium text-text-primary">{activeSub.plan?.name}</span></div>
                  <div><span className="text-text-secondary">Status:</span> <span className="font-medium text-text-primary capitalize">{activeSub.status}</span></div>
                  <div><span className="text-text-secondary">Start:</span> <span className="font-medium text-text-primary">{new Date(activeSub.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                  <div><span className="text-text-secondary">End:</span> <span className="font-medium text-text-primary">{new Date(activeSub.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                </div>
              </div>
            )}
            <div className="pt-6 border-t border-divider flex gap-3">
              <button onClick={() => setShowCollectDrawer(true)} className="btn btn-primary">
                <IndianRupee size={16} strokeWidth={1.5} /> Mark Fee Collected
              </button>
            </div>
          </div>
        )}

        {/* ── Attendance ────────────────────────────────── */}
        {activeTab === 'attendance' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-card-heading text-text-primary">Attendance Calendar</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (attendMonth === 1) { setAttendMonth(12); setAttendYear(attendYear - 1); } else setAttendMonth(attendMonth - 1); }} className="btn btn-secondary h-8 w-8 p-0">←</button>
                <span className="text-body font-medium text-text-primary min-w-[140px] text-center">
                  {new Date(attendYear, attendMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => { if (attendMonth === 12) { setAttendMonth(1); setAttendYear(attendYear + 1); } else setAttendMonth(attendMonth + 1); }} className="btn btn-secondary h-8 w-8 p-0">→</button>
              </div>
            </div>
            {attendanceData && (
              <>
                <div className="grid grid-cols-3 gap-between-cards mb-6">
                  <div className="stat-card text-center">
                    <p className="stat-card-value text-success">{attendanceData.presentDays}</p>
                    <p className="stat-card-label mt-1">Present</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="stat-card-value text-danger">{attendanceData.absentDays}</p>
                    <p className="stat-card-label mt-1">Absent</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="stat-card-value text-info">{attendanceData.attendancePercent}%</p>
                    <p className="stat-card-label mt-1">Attendance</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-label text-text-muted py-1">{d}</div>)}
                  {Array.from({ length: new Date(attendYear, attendMonth - 1, 1).getDay() }, (_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: attendanceData.daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${attendYear}-${String(attendMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isPresent = attendanceData.checkIns.some((c: { date: string }) => c.date === dateStr);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                    return (
                      <div
                        key={day}
                        className={`w-full aspect-square flex items-center justify-center rounded-btn text-caption font-medium ${
                          isPresent
                            ? 'bg-success text-white'
                            : isToday
                              ? 'bg-warning-bg text-warning ring-1 ring-warning-border'
                              : 'bg-divider text-text-muted'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Progress ──────────────────────────────────── */}
        {activeTab === 'progress' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-card-heading text-text-primary">Body Stats</h3>
              <button onClick={() => setShowStatDrawer(true)} className="btn btn-primary">
                <PlusIcon size={16} strokeWidth={1.5} /> Add Entry
              </button>
            </div>
            {bodyStats?.latest ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-between-cards">
                  {[
                    { label: 'Weight', value: bodyStats.latest.weightKg, unit: 'kg', change: bodyStats.changes?.weightKg },
                    { label: 'Chest', value: bodyStats.latest.chestCm, unit: 'cm', change: bodyStats.changes?.chestCm },
                    { label: 'Waist', value: bodyStats.latest.waistCm, unit: 'cm', change: bodyStats.changes?.waistCm },
                    { label: 'Bicep', value: bodyStats.latest.bicepCm, unit: 'cm', change: bodyStats.changes?.bicepCm },
                    { label: 'Thigh', value: bodyStats.latest.thighCm, unit: 'cm', change: bodyStats.changes?.thighCm },
                    { label: 'Hips', value: bodyStats.latest.hipsCm, unit: 'cm', change: bodyStats.changes?.hipsCm },
                  ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                      <p className="stat-card-label mb-2">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <span className="stat-card-value text-[22px]">{stat.value ? Number(stat.value).toFixed(1) : '—'}</span>
                        <span className="text-caption text-text-muted mb-1">{stat.value ? stat.unit : ''}</span>
                        {stat.change != null && stat.change !== 0 && (
                          <span className={`stat-card-trend ${stat.change > 0 ? 'down' : 'up'} mb-1`}>
                            {stat.change > 0 ? <TrendingUp size={12} strokeWidth={1.5} /> : <TrendingDown size={12} strokeWidth={1.5} />}
                            {Math.abs(stat.change).toFixed(1)}
                          </span>
                        )}
                        {stat.change === 0 && <Minus size={12} className="text-text-muted mb-1" strokeWidth={1.5} />}
                      </div>
                    </div>
                  ))}
                </div>
                {weightHistory?.history?.length > 0 && (
                  <div>
                    <h4 className="text-body font-medium text-text-secondary mb-3">Weight Trend (last 12 entries)</h4>
                    <div className="h-40 flex items-end gap-1">
                      {weightHistory.history.map((point: { date: string; weight: number }, i: number) => {
                        const allWeights = weightHistory.history.map((p: { weight: number }) => p.weight);
                        const minW = Math.min(...allWeights) - 2;
                        const maxW = Math.max(...allWeights) + 2;
                        const height = ((point.weight - minW) / (maxW - minW)) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-label text-text-muted font-mono">{point.weight}</span>
                            <div className="w-full rounded-t-sm overflow-hidden" style={{ height: `${height}%` }}>
                              <div className="w-full h-full bg-primary opacity-70 rounded-t-sm" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No body stats recorded yet"
                description='Click "Add Entry" to log the first measurement'
                action={
                  <button onClick={() => setShowStatDrawer(true)} className="btn btn-primary">
                    <PlusIcon size={16} strokeWidth={1.5} /> Add Entry
                  </button>
                }
              />
            )}
          </div>
        )}

        {/* ── Fee History ───────────────────────────────── */}
        {activeTab === 'fees' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-card-heading text-text-primary">Fee History</h3>
              <button onClick={() => setShowCollectDrawer(true)} className="btn btn-primary">
                <PlusIcon size={16} strokeWidth={1.5} /> Add Record
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Date</th>
                  <th className="table-header text-left">Amount</th>
                  <th className="table-header text-left">Method</th>
                  <th className="table-header text-left">Invoice</th>
                  <th className="table-header text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory?.payments?.length > 0 ? (
                  paymentHistory.payments.map((p: { id: string; paidAt: string; totalAmount: string; paymentMethod: string; invoiceNumber: string; notes: string | null }) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 text-table-row text-text-secondary">
                        {new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 text-table-row font-mono font-medium text-text-primary">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4"><Badge variant="default">{p.paymentMethod.toUpperCase()}</Badge></td>
                      <td className="px-4 text-table-row font-mono text-text-muted">{p.invoiceNumber}</td>
                      <td className="px-4 text-table-row text-text-secondary">{p.notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState
                        icon={IndianRupee}
                        title="No payment records"
                        description="Fee collection records will appear here"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Notifications Log ─────────────────────────── */}
        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-card-heading text-text-primary mb-6">Notification Log</h3>
            <div className="space-y-2">
              {notifHistory?.notifications?.length > 0 ? (
                notifHistory.notifications.map((n: { id: string; type: string; channel: string; body: string; sentAt: string; status: string }) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-btn hover:bg-divider transition-colors duration-fast">
                    <div className={`mt-0.5 avatar text-badge ${
                      n.channel === 'whatsapp' ? 'bg-success' : n.channel === 'push' ? 'bg-info' : 'bg-text-muted'
                    }`}>
                      {n.channel === 'whatsapp' ? 'W' : n.channel === 'push' ? 'P' : 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-text-primary capitalize">{n.type.replace(/_/g, ' ')}</p>
                      <p className="text-caption text-text-secondary truncate">{n.body}</p>
                      <p className="text-caption text-text-muted mt-1">
                        {n.sentAt
                          ? new Date(n.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Pending'} · {n.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Bell}
                  title="No notifications sent yet"
                  description="Notifications to this member will appear here"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Collect Fee Drawer ─────────────────────────────── */}
      <Drawer
        open={showCollectDrawer}
        onClose={() => setShowCollectDrawer(false)}
        title="Collect Fee"
        footer={
          <>
            <button onClick={() => setShowCollectDrawer(false)} className="btn btn-secondary">Cancel</button>
            <button
              onClick={() => collectMutation.mutate({ memberId: id, amount: Number(collectForm.amount), paymentMethod: collectForm.method, notes: collectForm.notes })}
              disabled={collectMutation.isPending || !collectForm.amount}
              className="btn btn-primary"
            >
              {collectMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Processing...</>
              ) : 'Confirm'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="fee-amount" className="input-label">Amount (₹)</label>
            <input id="fee-amount" type="number" value={collectForm.amount} onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })} className="input" />
          </div>
          <div>
            <label className="input-label">Method</label>
            <div className="flex gap-3">
              {['cash', 'upi'].map((m) => (
                <button key={m} onClick={() => setCollectForm({ ...collectForm, method: m })} className={`flex-1 btn ${collectForm.method === m ? 'btn-primary' : 'btn-secondary'}`}>{m.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="fee-notes" className="input-label">Notes</label>
            <textarea id="fee-notes" value={collectForm.notes} onChange={(e) => setCollectForm({ ...collectForm, notes: e.target.value })} rows={2} className="input h-auto py-3 resize-none" />
          </div>
        </div>
      </Drawer>

      {/* ─── Add Stats Drawer ──────────────────────────────── */}
      <Drawer
        open={showStatDrawer}
        onClose={() => setShowStatDrawer(false)}
        title="Log Body Stats"
        footer={
          <>
            <button onClick={() => setShowStatDrawer(false)} className="btn btn-secondary">Cancel</button>
            <button
              onClick={() => {
                const payload: Record<string, number | undefined> = {};
                Object.entries(statForm).forEach(([k, v]) => { if (v) payload[k] = Number(v); });
                statMutation.mutate(payload);
              }}
              disabled={statMutation.isPending || !statForm.weightKg}
              className="btn btn-primary"
            >
              {statMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Saving...</>
              ) : 'Save Entry'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {[
            { key: 'weightKg', label: 'Weight (kg)', required: true },
            { key: 'chestCm', label: 'Chest (cm)' },
            { key: 'waistCm', label: 'Waist (cm)' },
            { key: 'bicepCm', label: 'Bicep (cm)' },
            { key: 'thighCm', label: 'Thigh (cm)' },
            { key: 'hipsCm', label: 'Hips (cm)' },
          ].map((field) => (
            <div key={field.key}>
              <label htmlFor={`stat-${field.key}`} className="input-label">
                {field.label} {field.required && <span className="text-danger">*</span>}
              </label>
              <input
                id={`stat-${field.key}`}
                type="number"
                step="0.1"
                value={(statForm as Record<string, string>)[field.key]}
                onChange={(e) => setStatForm({ ...statForm, [field.key]: e.target.value })}
                className="input"
              />
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
