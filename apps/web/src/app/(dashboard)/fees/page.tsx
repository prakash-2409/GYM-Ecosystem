'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { IndianRupee, AlertTriangle, Clock, CheckCircle2, Send, Download, X } from 'lucide-react';

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

    const { data: dueData } = useQuery({
        queryKey: ['payments-due'],
        queryFn: () => apiClient.get('/payments/due').then((r) => r.data),
    });

    const { data: paymentsData } = useQuery({
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
                    body: `Your ${member.planName} membership fee of ₹${member.amount} is due.`,
                    channel: 'whatsapp',
                    target: 'individual',
                    targetId: memberId,
                });
            }
        }
        setSelectedMembers([]);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Fee Management</h1>
                {selectedMembers.length > 0 && (
                    <button
                        onClick={handleBulkReminder}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        <Send size={16} />
                        Send Reminder ({selectedMembers.length})
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white p-2.5 rounded-lg"><IndianRupee size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Collected This Month</p>
                            <p className="text-2xl font-bold font-mono">₹{collectedThisMonth.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 text-white p-2.5 rounded-lg"><Clock size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold font-mono">{pendingCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white p-2.5 rounded-lg"><AlertTriangle size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold font-mono">{overdueCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="ml-1.5 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            {activeTab === 'collected' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-600">{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                                    <td className="px-6 py-3 text-sm font-medium">{p.member?.user?.name}</td>
                                    <td className="px-6 py-3 text-sm font-mono font-medium">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.paymentMethod === 'upi' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {p.paymentMethod.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm font-mono text-gray-500">{p.invoiceNumber}</td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No payments collected yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.length === filteredDue.length && filteredDue.length > 0}
                                        onChange={(e) => {
                                            setSelectedMembers(e.target.checked ? filteredDue.map((m) => m.memberId) : []);
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredDue.map((m) => {
                                const isOverdue = new Date(m.expiredOn) < new Date();
                                return (
                                    <tr key={m.memberId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(m.memberId)}
                                                onChange={(e) => {
                                                    setSelectedMembers(e.target.checked
                                                        ? [...selectedMembers, m.memberId]
                                                        : selectedMembers.filter((id) => id !== m.memberId)
                                                    );
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium">{m.memberName}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{m.planName}</td>
                                        <td className="px-6 py-3 text-sm font-mono font-medium">₹{m.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{new Date(m.expiredOn).toLocaleDateString('en-IN')}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {isOverdue ? 'Overdue' : 'Due Soon'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setCollectingFor(m); setCollectForm({ amount: String(m.amount), method: 'cash', notes: '' }); }}
                                                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors"
                                                >
                                                    <CheckCircle2 size={14} className="inline mr-1" />Mark Collected
                                                </button>
                                                <button
                                                    onClick={() => reminderMutation.mutate({
                                                        title: 'Fee Reminder',
                                                        body: `Your ${m.planName} membership fee is due.`,
                                                        channel: 'whatsapp',
                                                        target: 'individual',
                                                        targetId: m.memberId,
                                                    })}
                                                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                                                >
                                                    <Send size={14} className="inline mr-1" />Remind
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredDue.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                    <CheckCircle2 size={40} className="mx-auto mb-2 text-green-300" />
                                    <p className="font-medium">All clear!</p>
                                    <p className="text-sm">No pending fees in this category</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mark Collected Drawer */}
            {collectingFor && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setCollectingFor(null)} />
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Mark Fee Collected</h2>
                            <button onClick={() => setCollectingFor(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="font-medium">{collectingFor.memberName}</p>
                            <p className="text-sm text-gray-500">{collectingFor.planName} · Due: {new Date(collectingFor.expiredOn).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={collectForm.amount}
                                    onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <div className="flex gap-3">
                                    {['cash', 'upi'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setCollectForm({ ...collectForm, method })}
                                            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${collectForm.method === method
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {method.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                <textarea
                                    value={collectForm.notes}
                                    onChange={(e) => setCollectForm({ ...collectForm, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            <button
                                onClick={() => collectMutation.mutate({
                                    memberId: collectingFor.memberId,
                                    amount: Number(collectForm.amount),
                                    paymentMethod: collectForm.method,
                                    notes: collectForm.notes,
                                })}
                                disabled={collectMutation.isPending || !collectForm.amount}
                                className="w-full h-10 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {collectMutation.isPending ? 'Processing...' : 'Confirm Collection'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
