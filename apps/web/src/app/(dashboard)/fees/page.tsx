'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  IndianRupee, AlertTriangle, Clock, CheckCircle2, Send,
  Download, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Drawer } from '@/components/ui/drawer';
import { useToast } from '@/components/ui/toast';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

type Tab = 'all' | 'due' | 'overdue' | 'collected';

interface DueMember {
  memberId: string;
  memberName: string;
  memberPhone: string;
  planName: string;
  expiredOn: string;
  amount: number;
}

interface Payment {
  id: string;
  amount: string;
  totalAmount: string;
  paymentMethod: string;
  invoiceNumber: string;
  paidAt: string;
  notes: string | null;
  member: { user: { name: string } };
}

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [collectingFor, setCollectingFor] = useState<DueMember | null>(null);
  const [collectForm, setCollectForm] = useState({ amount: '', method: 'cash', notes: '' });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: dueData, isLoading: dueLoading } = useQuery({
    queryKey: ['payments-due'],
    queryFn: () => apiClient.get('/payments/due').then((r) => r.data),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments-list'],
    queryFn: () => apiClient.get('/payments', { params: { limit: 50 } }).then((r) => r.data),
  });

  const collectMutation = useMutation({
    mutationFn: (data: { memberId: string; amount: number; paymentMethod: string; notes: string }) =>
      apiClient.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-due'] });
      queryClient.invalidateQueries({ queryKey: ['payments-list'] });
      setCollectingFor(null);
      setCollectForm({ amount: '', method: 'cash', notes: '' });
    },
  });

  const reminderMutation = useMutation({
    mutationFn: (data: { title: string; body: string; channel: string; target: string; targetId: string }) =>
      apiClient.post('/notifications/send', data),
  });

  const dueMembers: DueMember[] = dueData?.members || [];
  const payments: Payment[] = paymentsData?.payments || [];

  // Summary stats
  const collectedThisMonth = payments.reduce((sum: number, p: Payment) => {
    const paidDate = new Date(p.paidAt);
    const now = new Date();
    if (paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()) {
      return sum + Number(p.totalAmount);
    }
    return sum;
  }, 0);

  const overdueCount = dueMembers.filter((m) => new Date(m.expiredOn) < new Date()).length;
  const pendingCount = dueMembers.length - overdueCount;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'all', label: 'All Members' },
    { key: 'due', label: 'Fee Due', count: pendingCount },
    { key: 'overdue', label: 'Overdue', count: overdueCount },
    { key: 'collected', label: 'Collected' },
  ];

  const filteredDue = activeTab === 'overdue'
    ? dueMembers.filter((m) => new Date(m.expiredOn) < new Date())
    : activeTab === 'due'
      ? dueMembers.filter((m) => new Date(m.expiredOn) >= new Date())
      : dueMembers;

  const handleBulkReminder = async () => {
    for (const memberId of selectedMembers) {
      const member = dueMembers.find((m) => m.memberId === memberId);
      if (member) {
        await reminderMutation.mutateAsync({
          title: 'Fee Reminder',
          body: `Your ${member.planName} membership fee of ₹${member.amount.toLocaleString('en-IN')} is due.`,
          channel: 'whatsapp',
          target: 'individual',
          targetId: memberId,
        });
      }
    }
    setSelectedMembers([]);
  };

  const isLoading = dueLoading || paymentsLoading;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8 stagger-1">
        <h1 className="text-page-title text-text-primary">Fee Management</h1>
        <div className="flex gap-3">
          {selectedMembers.length > 0 && (
            <button onClick={handleBulkReminder} className="btn btn-primary">
              <Send size={16} strokeWidth={1.5} />
              Send Reminder ({selectedMembers.length})
            </button>
          )}
          <button className="btn btn-secondary">
            <Download size={16} strokeWidth={1.5} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-between-cards mb-between-sections stagger-2">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-card-label">Collected This Month</span>
              <p className="stat-card-value mt-2">₹{collectedThisMonth.toLocaleString('en-IN')}</p>
              <span className="stat-card-trend up mt-1">
                <CheckCircle2 size={13} strokeWidth={1.5} /> on track
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Pending</span>
              <p className="stat-card-value mt-2">{pendingCount}</p>
              {pendingCount > 0 && (
                <span className="stat-card-trend down mt-1">
                  <Clock size={13} strokeWidth={1.5} /> needs attention
                </span>
              )}
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Overdue</span>
              <p className="stat-card-value mt-2">{overdueCount}</p>
              {overdueCount > 0 && (
                <span className="stat-card-trend down mt-1">
                  <AlertTriangle size={13} strokeWidth={1.5} /> urgent
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Filter chips — not pill tabs */}
      <div className="flex gap-2 mb-6 stagger-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`filter-chip ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 badge badge-overdue text-[10px] px-1.5">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table content */}
      <div className="stagger-4">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : activeTab === 'collected' ? (
          /* ── Collected payments table ───────────────────── */
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-surface">
                  <tr>
                    <th className="table-header text-left">Date</th>
                    <th className="table-header text-left">Member</th>
                    <th className="table-header text-left">Amount</th>
                    <th className="table-header text-left">Method</th>
                    <th className="table-header text-left">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id} className="table-row">
                        <td className="px-4 text-table-row text-text-secondary">
                          {new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 text-table-row text-text-primary font-medium">{p.member?.user?.name}</td>
                        <td className="px-4 text-table-row font-mono font-medium text-text-primary">
                          ₹{Number(p.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4">
                          <Badge variant={p.paymentMethod === 'upi' ? 'coach' : 'default'}>
                            {p.paymentMethod.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 text-table-row font-mono text-text-muted">{p.invoiceNumber}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <EmptyState
                          icon={IndianRupee}
                          title="No payments collected yet"
                          description="Payments will appear here once fees are marked as collected"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── Due/overdue members table ──────────────────── */
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-surface">
                  <tr>
                    <th className="table-header w-10 px-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === filteredDue.length && filteredDue.length > 0}
                        onChange={(e) => {
                          setSelectedMembers(e.target.checked ? filteredDue.map((m) => m.memberId) : []);
                        }}
                        className="rounded border-border-default"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="table-header text-left">Member</th>
                    <th className="table-header text-left">Plan</th>
                    <th className="table-header text-left">Amount</th>
                    <th className="table-header text-left">Due Date</th>
                    <th className="table-header text-left">Status</th>
                    <th className="table-header text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDue.length > 0 ? (
                    filteredDue.map((m) => {
                      const isOverdue = new Date(m.expiredOn) < new Date();
                      return (
                        <tr key={m.memberId} className="table-row group">
                          <td className="px-4">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(m.memberId)}
                              onChange={(e) => {
                                setSelectedMembers(e.target.checked
                                  ? [...selectedMembers, m.memberId]
                                  : selectedMembers.filter((id) => id !== m.memberId)
                                );
                              }}
                              className="rounded border-border-default"
                              aria-label={`Select ${m.memberName}`}
                            />
                          </td>
                          <td className="px-4">
                            <div className="flex items-center gap-3">
                              <div className="avatar text-badge">
                                {m.memberName[0]?.toUpperCase()}
                              </div>
                              <span className="text-table-row font-medium text-text-primary">{m.memberName}</span>
                            </div>
                          </td>
                          <td className="px-4 text-table-row text-text-secondary">{m.planName}</td>
                          <td className="px-4 text-table-row font-mono font-medium text-text-primary">
                            ₹{m.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 text-table-row text-text-secondary">
                            {new Date(m.expiredOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4">
                            <Badge variant={isOverdue ? 'overdue' : 'fee-due'}>
                              {isOverdue ? 'Overdue' : 'Due Soon'}
                            </Badge>
                          </td>
                          <td className="px-4">
                            <div className="flex gap-2 row-actions">
                              <button
                                onClick={() => { setCollectingFor(m); setCollectForm({ amount: String(m.amount), method: 'cash', notes: '' }); }}
                                className="btn btn-primary text-badge h-8 px-3"
                              >
                                <CheckCircle2 size={14} strokeWidth={1.5} />
                                Mark Collected
                              </button>
                              <button
                                onClick={() => reminderMutation.mutate({
                                  title: 'Fee Reminder',
                                  body: `Your ${m.planName} membership fee is due.`,
                                  channel: 'whatsapp',
                                  target: 'individual',
                                  targetId: m.memberId,
                                })}
                                className="btn btn-ghost text-badge h-8 px-3"
                              >
                                <Send size={14} strokeWidth={1.5} />
                                Remind
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <EmptyState
                          icon={CheckCircle2}
                          title="All clear!"
                          description="No pending fees in this category"
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

      {/* ── Mark Collected Drawer ─────────────────────────── */}
      <Drawer
        open={!!collectingFor}
        onClose={() => setCollectingFor(null)}
        title="Mark Fee Collected"
        footer={
          <>
            <button
              onClick={() => setCollectingFor(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => collectingFor && collectMutation.mutate({
                memberId: collectingFor.memberId,
                amount: Number(collectForm.amount),
                paymentMethod: collectForm.method,
                notes: collectForm.notes,
              })}
              disabled={collectMutation.isPending || !collectForm.amount}
              className="btn btn-primary"
            >
              {collectMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                  Processing...
                </>
              ) : (
                'Confirm Collection'
              )}
            </button>
          </>
        }
      >
        {collectingFor && (
          <div className="space-y-6">
            {/* Member info card */}
            <div className="stat-card">
              <p className="text-body font-medium text-text-primary">{collectingFor.memberName}</p>
              <p className="text-caption text-text-secondary mt-1">
                {collectingFor.planName} · Due: {new Date(collectingFor.expiredOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="collect-amount" className="input-label">Amount (₹)</label>
              <input
                id="collect-amount"
                type="number"
                value={collectForm.amount}
                onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                className="input"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="input-label">Payment Method</label>
              <div className="flex gap-3">
                {['cash', 'upi'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setCollectForm({ ...collectForm, method })}
                    className={`flex-1 btn ${
                      collectForm.method === method
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {method.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="collect-notes" className="input-label">Notes (optional)</label>
              <textarea
                id="collect-notes"
                value={collectForm.notes}
                onChange={(e) => setCollectForm({ ...collectForm, notes: e.target.value })}
                rows={2}
                className="input h-auto py-3 resize-none"
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
