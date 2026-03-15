'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import type { MembershipPlan } from '@gymstack/shared';

export default function PlansPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MembershipPlan | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/plans').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/plans/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast('success', 'Plan status updated');
    },
    onError: () => toast('error', 'Failed to update plan status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setDeleteTarget(null);
      toast('success', 'Plan deleted');
    },
    onError: () => toast('error', 'Cannot delete plan with active subscriptions'),
  });

  const openCreate = () => {
    setEditingPlan(null);
    setDrawerOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setDrawerOpen(true);
  };

  const handleSaved = () => {
    setDrawerOpen(false);
    setEditingPlan(null);
    queryClient.invalidateQueries({ queryKey: ['plans'] });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Membership Plans</h1>
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Membership Plans</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 active:opacity-80 transition-all duration-150"
        >
          <Plus size={16} />
          Add Plan
        </button>
      </div>

      {!plans?.length ? (
        <div className="bg-surface rounded-card border border-border">
          <EmptyState
            icon={<Receipt size={28} />}
            title="No plans yet"
            description="Create your first membership plan to start enrolling members."
            action={
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 transition-all duration-150"
              >
                <Plus size={16} />
                Create Plan
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan: MembershipPlan) => (
                  <tr key={plan.id} className="hover:bg-[#F5F5F5] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                        {plan.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{plan.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{plan.durationDays} days</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                      ₹{Number(plan.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleMutation.mutate(plan.id)}
                        className="transition-all duration-150"
                        disabled={toggleMutation.isPending}
                      >
                        <Badge variant={plan.isActive ? 'success' : 'error'}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(plan)}
                          className="h-8 w-8 flex items-center justify-center rounded-btn text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(plan)}
                          className="h-8 w-8 flex items-center justify-center rounded-btn text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingPlan(null); }}
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
      >
        <PlanForm
          plan={editingPlan}
          onSaved={handleSaved}
          onCancel={() => { setDrawerOpen(false); setEditingPlan(null); }}
        />
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Plan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PlanForm({
  plan,
  onSaved,
  onCancel,
}: {
  plan: MembershipPlan | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(plan?.name || '');
  const [durationDays, setDurationDays] = useState(plan?.durationDays?.toString() || '');
  const [price, setPrice] = useState(plan?.price?.toString() || '');
  const [gstPercent, setGstPercent] = useState(plan?.gstPercent?.toString() || '18');
  const [description, setDescription] = useState(plan?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !durationDays || !price) {
      toast('error', 'Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        durationDays: Number(durationDays),
        price: Number(price),
        gstPercent: Number(gstPercent),
        description: description.trim() || null,
      };

      if (plan) {
        await apiClient.put(`/plans/${plan.id}`, payload);
        toast('success', 'Plan updated');
      } else {
        await apiClient.post('/plans', payload);
        toast('success', 'Plan created');
      }
      onSaved();
    } catch {
      toast('error', plan ? 'Failed to update plan' : 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Monthly Premium"
          className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            placeholder="30"
            min="1"
            className="w-full h-10 px-3 border border-border rounded-btn text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1999"
            min="0"
            step="0.01"
            className="w-full h-10 px-3 border border-border rounded-btn text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
        <input
          type="number"
          value={gstPercent}
          onChange={(e) => setGstPercent(e.target.value)}
          placeholder="18"
          min="0"
          max="100"
          step="0.01"
          className="w-full h-10 px-3 border border-border rounded-btn text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-shadow duration-150"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 text-sm font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-9 px-4 text-sm font-medium rounded-btn bg-primary text-white hover:opacity-90 active:opacity-80 disabled:opacity-50 transition-all duration-150"
        >
          {saving ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}
