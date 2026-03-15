'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

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
      <h1 className="text-2xl font-bold mb-6">Collect Fee</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        {/* Member search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={memberSearch}
            onChange={(e) => { setMemberSearch(e.target.value); setMemberId(''); }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
          {members?.members?.length > 0 && !memberId && (
            <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
              {members.members.map((m: Record<string, unknown>) => (
                <button
                  key={m.id as string}
                  type="button"
                  onClick={() => {
                    setMemberId(m.id as string);
                    setMemberSearch(`${(m.user as Record<string, string>)?.name} (${m.memberCode})`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  <span className="font-medium">{(m.user as Record<string, string>)?.name}</span>
                  <span className="text-gray-500 ml-2">{m.memberCode as string}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plan selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
          <div className="flex gap-3">
            {['cash', 'upi', 'card'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition ${
                  paymentMethod === method
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'upi' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI Reference ID</label>
            <input value={upiRef} onChange={(e) => setUpiRef(e.target.value)}
              placeholder="Transaction reference"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        )}

        {/* Amount breakdown */}
        {selectedPlan && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Amount</span>
              <span>₹{(baseAmount - gstAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST (18%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{baseAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button type="submit" disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50">
          {loading ? 'Processing...' : 'Collect Payment & Generate Invoice'}
        </button>
      </form>
    </div>
  );
}
