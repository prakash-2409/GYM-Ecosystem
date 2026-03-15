'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus,
  IndianRupee, Bell, CheckCircle2, X, Plus as PlusIcon,
} from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const member = data?.member;
  const activeSub = data?.activeSubscription;
  const totalVisits = data?.totalVisits || 0;

  if (!member) return <p className="text-gray-400 text-center py-12">Member not found</p>;

  const userName = member.user?.name || 'Unknown';
  const daysRemaining = activeSub
    ? Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalDays = activeSub
    ? Math.ceil((new Date(activeSub.endDate).getTime() - new Date(activeSub.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const progressPercent = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));
  const progressColor = daysRemaining <= 0 ? 'bg-red-500' : daysRemaining <= 7 ? 'bg-orange-500' : 'bg-green-500';

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
      <Link href="/members" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Members
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{userName}</h1>
            <p className="text-sm text-gray-500 font-mono">{member.memberCode}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeSub && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {activeSub.plan?.name}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysRemaining <= 0 ? 'bg-red-100 text-red-700' : daysRemaining <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {activeSub && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{new Date(activeSub.startDate).toLocaleDateString('en-IN')}</span>
              <span>{new Date(activeSub.endDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${progressColor} rounded-full transition-all`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono">{totalVisits}</p>
            <p className="text-xs text-gray-500">Total Visits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono">{daysRemaining}</p>
            <p className="text-xs text-gray-500">Days Left</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono">{new Date(member.joinedAt || member.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</p>
            <p className="text-xs text-gray-500">Member Since</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Personal Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{member.user?.phone}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{member.user?.email || '—'}</span></div>
              <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-IN') : '—'}</span></div>
              <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{member.gender || '—'}</span></div>
              <div><span className="text-gray-500">Blood Group:</span> <span className="font-medium">{member.bloodGroup || '—'}</span></div>
              <div><span className="text-gray-500">Emergency:</span> <span className="font-medium">{member.emergencyPhone || '—'}</span></div>
            </div>
            {activeSub && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Current Plan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Plan:</span> <span className="font-medium">{activeSub.plan?.name}</span></div>
                  <div><span className="text-gray-500">Status:</span> <span className="font-medium capitalize">{activeSub.status}</span></div>
                  <div><span className="text-gray-500">Start:</span> <span className="font-medium">{new Date(activeSub.startDate).toLocaleDateString('en-IN')}</span></div>
                  <div><span className="text-gray-500">End:</span> <span className="font-medium">{new Date(activeSub.endDate).toLocaleDateString('en-IN')}</span></div>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t flex gap-3">
              <button onClick={() => setShowCollectDrawer(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                <IndianRupee size={16} /> Mark Fee Collected
              </button>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Attendance Calendar</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (attendMonth === 1) { setAttendMonth(12); setAttendYear(attendYear - 1); } else setAttendMonth(attendMonth - 1); }} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">←</button>
                <span className="text-sm font-medium">{new Date(attendYear, attendMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => { if (attendMonth === 12) { setAttendMonth(1); setAttendYear(attendYear + 1); } else setAttendMonth(attendMonth + 1); }} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">→</button>
              </div>
            </div>
            {attendanceData && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-green-50 rounded-lg p-3"><p className="text-xl font-bold text-green-700">{attendanceData.presentDays}</p><p className="text-xs text-gray-500">Present</p></div>
                  <div className="bg-red-50 rounded-lg p-3"><p className="text-xl font-bold text-red-700">{attendanceData.absentDays}</p><p className="text-xs text-gray-500">Absent</p></div>
                  <div className="bg-blue-50 rounded-lg p-3"><p className="text-xl font-bold text-blue-700">{attendanceData.attendancePercent}%</p><p className="text-xs text-gray-500">Attendance</p></div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
                  {Array.from({ length: new Date(attendYear, attendMonth - 1, 1).getDay() }, (_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: attendanceData.daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${attendYear}-${String(attendMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isPresent = attendanceData.checkIns.some((c: { date: string }) => c.date === dateStr);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                    return (
                      <div
                        key={day}
                        className={`w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${isPresent ? 'bg-green-500 text-white' : isToday ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' : 'bg-gray-50 text-gray-400'
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

        {activeTab === 'progress' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Body Stats</h3>
              <button onClick={() => setShowStatDrawer(true)} className="flex items-center gap-1.5 text-sm bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                <PlusIcon size={14} /> Add Entry
              </button>
            </div>
            {bodyStats?.latest ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Weight', value: bodyStats.latest.weightKg, unit: 'kg', change: bodyStats.changes?.weightKg },
                    { label: 'Chest', value: bodyStats.latest.chestCm, unit: 'cm', change: bodyStats.changes?.chestCm },
                    { label: 'Waist', value: bodyStats.latest.waistCm, unit: 'cm', change: bodyStats.changes?.waistCm },
                    { label: 'Bicep', value: bodyStats.latest.bicepCm, unit: 'cm', change: bodyStats.changes?.bicepCm },
                    { label: 'Thigh', value: bodyStats.latest.thighCm, unit: 'cm', change: bodyStats.changes?.thighCm },
                    { label: 'Hips', value: bodyStats.latest.hipsCm, unit: 'cm', change: bodyStats.changes?.hipsCm },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-bold font-mono">{stat.value ? Number(stat.value).toFixed(1) : '—'}</span>
                        <span className="text-xs text-gray-400 mb-0.5">{stat.value ? stat.unit : ''}</span>
                        {stat.change != null && stat.change !== 0 && (
                          <span className={`flex items-center text-xs font-medium mb-0.5 ${stat.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {stat.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(stat.change).toFixed(1)}
                          </span>
                        )}
                        {stat.change === 0 && <Minus size={12} className="text-gray-300 mb-0.5" />}
                      </div>
                    </div>
                  ))}
                </div>
                {weightHistory?.history?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Weight Trend (last 12 weeks)</h4>
                    <div className="h-40 flex items-end gap-1">
                      {weightHistory.history.map((point: { date: string; weight: number }, i: number) => {
                        const allWeights = weightHistory.history.map((p: { weight: number }) => p.weight);
                        const minW = Math.min(...allWeights) - 2;
                        const maxW = Math.max(...allWeights) + 2;
                        const height = ((point.weight - minW) / (maxW - minW)) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-gray-400 font-mono">{point.weight}</span>
                            <div className="w-full bg-primary/20 rounded-t" style={{ height: `${height}%` }}>
                              <div className="w-full h-full bg-primary rounded-t opacity-70" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No body stats recorded yet</p>
                <p className="text-sm">Click &quot;Add Entry&quot; to log the first measurement</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fees' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Fee History</h3>
              <button onClick={() => setShowCollectDrawer(true)} className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
                <PlusIcon size={14} /> Add Record
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentHistory?.payments?.map((p: { id: string; paidAt: string; totalAmount: string; paymentMethod: string; invoiceNumber: string; notes: string | null }) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm font-mono font-medium">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{p.paymentMethod.toUpperCase()}</span></td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.notes || '—'}</td>
                  </tr>
                ))}
                {(!paymentHistory?.payments || paymentHistory.payments.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No payment records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 className="font-semibold mb-4">Notification Log</h3>
            <div className="space-y-2">
              {notifHistory?.notifications?.map((n: { id: string; type: string; channel: string; body: string; sentAt: string; status: string }) => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${n.channel === 'whatsapp' ? 'bg-green-500' : n.channel === 'push' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                    {n.channel === 'whatsapp' ? 'W' : n.channel === 'push' ? 'P' : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{n.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 truncate">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.sentAt ? new Date(n.sentAt).toLocaleString('en-IN') : 'Pending'} · {n.status}</p>
                  </div>
                </div>
              ))}
              {(!notifHistory?.notifications || notifHistory.notifications.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No notifications sent to this member yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mark Collected Drawer */}
      {showCollectDrawer && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowCollectDrawer(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Collect Fee</h2>
              <button onClick={() => setShowCollectDrawer(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" value={collectForm.amount} onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <div className="flex gap-3">
                  {['cash', 'upi'].map((m) => (
                    <button key={m} onClick={() => setCollectForm({ ...collectForm, method: m })} className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${collectForm.method === m ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}>{m.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={collectForm.notes} onChange={(e) => setCollectForm({ ...collectForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
              </div>
              <button onClick={() => collectMutation.mutate({ memberId: id, amount: Number(collectForm.amount), paymentMethod: collectForm.method, notes: collectForm.notes })} disabled={collectMutation.isPending || !collectForm.amount} className="w-full h-10 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                {collectMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Stats Drawer */}
      {showStatDrawer && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowStatDrawer(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Log Body Stats</h2>
              <button onClick={() => setShowStatDrawer(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                  <input type="number" step="0.1" value={(statForm as Record<string, string>)[field.key]} onChange={(e) => setStatForm({ ...statForm, [field.key]: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
              ))}
              <button
                onClick={() => {
                  const payload: Record<string, number | undefined> = {};
                  Object.entries(statForm).forEach(([k, v]) => { if (v) payload[k] = Number(v); });
                  statMutation.mutate(payload);
                }}
                disabled={statMutation.isPending || !statForm.weightKg}
                className="w-full h-10 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {statMutation.isPending ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
