'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CollectFeePage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [planId, setPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [upiRef, setUpiRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: members } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => apiClient.get('/members', { params: { search: memberSearch, limit: 5 } }).then((r) => r.data),
    enabled: memberSearch.length >= 2,
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/payments/plans').then((r) => r.data),
  });

  const selectedPlan = plans?.plans?.find((p: Record<string, string>) => p.id === planId);
  const baseAmount = selectedPlan ? Number(selectedPlan.price) : 0;
  const gstAmount = Math.round((baseAmount * 18) / 118 * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !planId) { setError('Select member and plan'); return; }
    setLoading(true);
    setError('');

    try {
      const startDate = new Date().toISOString().split('T')[0];
      await apiClient.post('/payments/subscriptions', {
        memberId, planId, startDate, paymentMethod, upiRef: upiRef || undefined,
      });
      router.push('/payments');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to collect payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Link
        href="/fees"
        className="inline-flex items-center gap-2 text-caption text-text-secondary hover:text-text-primary mb-4 transition-colors duration-normal stagger-1"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Fees
      </Link>

      <h1 className="text-page-title text-text-primary mb-8 stagger-2">Collect Fee</h1>

      <form onSubmit={handleSubmit} className="card space-y-5 stagger-3">
        {/* Member search */}
        <div>
          <label htmlFor="fee-member" className="input-label">Member <span className="text-danger">*</span></label>
          <input
            id="fee-member"
            type="text"
            placeholder="Search by name or phone..."
            value={memberSearch}
            onChange={(e) => { setMemberSearch(e.target.value); setMemberId(''); }}
            className="input"
          />
          {members?.members?.length > 0 && !memberId && (
            <div className="mt-1 border border-divider rounded-btn overflow-hidden">
              {members.members.map((m: Record<string, unknown>) => (
                <button
                  key={m.id as string}
                  type="button"
                  onClick={() => {
                    setMemberId(m.id as string);
                    setMemberSearch(`${(m.user as Record<string, string>)?.name} (${m.memberCode})`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-page text-body transition-colors duration-normal"
                >
                  <span className="font-medium text-text-primary">{(m.user as Record<string, string>)?.name}</span>
                  <span className="text-text-secondary ml-2 font-mono text-caption">{m.memberCode as string}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plan selector */}
        <div>
          <label htmlFor="fee-plan" className="input-label">Plan <span className="text-danger">*</span></label>
          <select id="fee-plan" value={planId} onChange={(e) => setPlanId(e.target.value)} className="input">
            <option value="">Select plan</option>
            {plans?.plans?.map((p: Record<string, string | number>) => (
              <option key={p.id as string} value={p.id as string}>
                {p.name} — {p.durationDays} days — ₹{Number(p.price).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        {/* Payment method */}
        <div>
          <label className="input-label mb-2 block">Payment Method <span className="text-danger">*</span></label>
          <div className="flex gap-3">
            {['cash', 'upi', 'card'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`px-4 py-2 rounded-btn border text-body font-medium capitalize transition-all duration-normal ${
                  paymentMethod === method
                    ? 'bg-primary text-white border-primary'
                    : 'border-divider text-text-secondary hover:bg-page'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'upi' && (
          <div>
            <label htmlFor="fee-upi-ref" className="input-label">UPI Reference ID</label>
            <input id="fee-upi-ref" value={upiRef} onChange={(e) => setUpiRef(e.target.value)}
              placeholder="Transaction reference"
              className="input font-mono" />
          </div>
        )}

        {/* Amount breakdown */}
        {selectedPlan && (
          <div className="stat-card space-y-2">
            <div className="flex justify-between text-body">
              <span className="text-text-secondary">Base Amount</span>
              <span className="text-text-primary font-mono">₹{(baseAmount - gstAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body">
              <span className="text-text-secondary">GST (18%)</span>
              <span className="text-text-primary font-mono">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-divider">
              <span className="text-text-primary">Total</span>
              <span className="text-text-primary font-mono">₹{baseAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-danger-bg text-danger text-body px-4 py-3 rounded-btn border border-danger-border">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full h-input">
          {loading ? <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Processing...</> : 'Collect Payment & Generate Invoice'}
        </button>
      </form>
    </div>
  );
}
