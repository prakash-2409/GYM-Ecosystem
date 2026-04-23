'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Download, IndianRupee, TriangleAlert, Wallet } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeleton';

type DueMember = {
  memberId: string;
  memberName: string;
  planName: string;
  expiredOn: string;
  amount: number;
};

type PaymentRow = {
  id: string;
  totalAmount: string;
  paymentMethod: string;
  invoiceNumber: string;
  paidAt: string;
  member: { user: { name: string } };
};

function currency(amount: number) {
  return `INR ${amount.toLocaleString('en-IN')}`;
}

export default function PaymentsRevenuePage() {
  const { data: dueData, isLoading: dueLoading } = useQuery({
    queryKey: ['payments-due'],
    queryFn: () => apiClient.get('/payments/due').then((r) => r.data),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments-list'],
    queryFn: () => apiClient.get('/payments', { params: { limit: 100 } }).then((r) => r.data),
  });

  const dueMembers: DueMember[] = dueData?.members || [];
  const payments: PaymentRow[] = paymentsData?.payments || [];
  const isLoading = dueLoading || paymentsLoading;

  const metrics = useMemo(() => {
    const now = new Date();
    const revenueThisMonth = payments.reduce((sum, p) => {
      const d = new Date(p.paidAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        return sum + Number(p.totalAmount);
      }
      return sum;
    }, 0);

    const overdue = dueMembers.filter((m) => new Date(m.expiredOn) < now);
    const overdueAmount = overdue.reduce((sum, m) => sum + Number(m.amount), 0);
    const pendingAmount = dueMembers.reduce((sum, m) => sum + Number(m.amount), 0);

    return {
      revenueThisMonth,
      pendingAmount,
      overdueAmount,
      overdueCount: overdue.length,
    };
  }, [dueMembers, payments]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-page-title text-text-primary">Payments & Revenue</h1>
          <p className="text-body text-text-secondary mt-2">
            Revenue snapshot, payment history, and accounts needing follow-up.
          </p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} strokeWidth={1.5} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-between-cards">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="card border-l-4 border-l-info">
              <div className="flex items-start justify-between">
                <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Revenue (MTD)</p>
                <Wallet size={18} className="text-info" />
              </div>
              <p className="text-page-title mt-3 text-text-primary">{currency(metrics.revenueThisMonth)}</p>
              <p className="text-caption text-text-secondary mt-2">Collected via {payments.length} payments</p>
            </div>

            <div className="card border-l-4 border-l-warning">
              <div className="flex items-start justify-between">
                <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Pending</p>
                <IndianRupee size={18} className="text-warning" />
              </div>
              <p className="text-page-title mt-3 text-text-primary">{currency(metrics.pendingAmount)}</p>
              <p className="text-caption text-text-secondary mt-2">Across {dueMembers.length} unpaid subscriptions</p>
            </div>

            <div className="card border-l-4 border-l-danger">
              <div className="flex items-start justify-between">
                <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Overdue</p>
                <TriangleAlert size={18} className="text-danger" />
              </div>
              <p className="text-page-title mt-3 text-text-primary">{currency(metrics.overdueAmount)}</p>
              <p className="text-caption text-text-secondary mt-2">{metrics.overdueCount} accounts need urgent collection</p>
            </div>
          </>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-card-pad py-4 border-b border-divider flex items-center justify-between">
          <div>
            <h2 className="text-section-heading text-text-primary">Recent Transactions</h2>
            <p className="text-caption text-text-secondary mt-1">Latest successful collections</p>
          </div>
          <Badge variant="default">{payments.length}</Badge>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : payments.length ? (
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
                {payments.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 text-table-row text-text-secondary">
                      {new Date(p.paidAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 text-table-row text-text-primary font-medium">{p.member?.user?.name || 'Unknown'}</td>
                    <td className="px-4 text-table-row font-mono font-medium text-text-primary">{currency(Number(p.totalAmount))}</td>
                    <td className="px-4">
                      <Badge variant={p.paymentMethod === 'upi' ? 'coach' : 'default'}>{p.paymentMethod.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 text-table-row font-mono text-text-muted">{p.invoiceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ArrowUpRight}
            title="No transactions yet"
            description="Payment entries will appear after collections are recorded"
          />
        )}
      </div>
    </div>
  );
}
