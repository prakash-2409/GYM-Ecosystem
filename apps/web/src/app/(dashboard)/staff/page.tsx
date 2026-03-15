'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Plus, UserCog, KeyRound } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function StaffPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => apiClient.get('/staff').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/staff/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast('success', 'Staff status updated');
    },
    onError: () => toast('error', 'Failed to update status'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiClient.patch(`/staff/${id}/reset-password`, { password }),
    onSuccess: () => {
      setResetTarget(null);
      setNewPassword('');
      toast('success', 'Password reset successfully');
    },
    onError: () => toast('error', 'Failed to reset password'),
  });

  const handleSaved = () => {
    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['staff'] });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatRelative = (d: string | null) => {
    if (!d) return 'Never';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Staff</h1>
        </div>
        <TableSkeleton rows={3} cols={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Staff</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 active:opacity-80 transition-all duration-150"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {!staff?.length ? (
        <div className="bg-surface rounded-card border border-border">
          <EmptyState
            icon={<UserCog size={28} />}
            title="No staff yet"
            description="Add receptionists and coaches to help manage your gym."
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 transition-all duration-150"
              >
                <Plus size={16} />
                Add Staff
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s: StaffMember) => (
                  <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={s.role === 'coach' ? 'secondary' : 'info'}>
                        {s.role === 'coach' ? 'Coach' : 'Receptionist'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{s.phone}</p>
                      {s.email && <p className="text-xs text-gray-500">{s.email}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(s.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{formatRelative(s.lastLoginAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleMutation.mutate(s.id)}
                        disabled={toggleMutation.isPending}
                        className="transition-all duration-150"
                      >
                        <Badge variant={s.isActive ? 'success' : 'error'}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setResetTarget(s)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-btn text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                        title="Reset Password"
                      >
                        <KeyRound size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Staff">
        <StaffForm onSaved={handleSaved} onCancel={() => setDrawerOpen(false)} />
      </Drawer>

      {/* Reset Password Dialog */}
      {resetTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setResetTarget(null); setNewPassword(''); }} />
          <div className="relative bg-surface rounded-card border border-border shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold mb-1">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">Enter a new temporary password for {resetTarget.name}.</p>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setResetTarget(null); setNewPassword(''); }}
                className="h-9 px-4 text-sm font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPassword.length >= 6) {
                    resetPasswordMutation.mutate({ id: resetTarget.id, password: newPassword });
                  }
                }}
                disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
                className="h-9 px-4 text-sm font-medium rounded-btn bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all duration-150"
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'receptionist' | 'coach'>('receptionist');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password) {
      toast('error', 'Please fill all required fields');
      return;
    }
    if (password.length < 6) {
      toast('error', 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/staff', {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        role,
        password,
      });
      toast('success', 'Staff member added');
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to add staff';
      toast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
          className="w-full h-10 px-3 border border-border rounded-btn text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'receptionist' | 'coach')}
          className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-shadow duration-150"
        >
          <option value="receptionist">Receptionist</option>
          <option value="coach">Coach</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password *</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
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
          {saving ? 'Adding...' : 'Add Staff'}
        </button>
      </div>
    </form>
  );
}
