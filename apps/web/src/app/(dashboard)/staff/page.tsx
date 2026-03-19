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
import { Plus, UserCog, KeyRound, Loader2 } from 'lucide-react';

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
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-page-title text-text-primary">Staff</h1>
        </div>
        <TableSkeleton rows={3} cols={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 stagger-1">
        <h1 className="text-page-title text-text-primary">Staff</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={16} strokeWidth={1.5} />
          Add Staff
        </button>
      </div>

      {!staff?.length ? (
        <div className="card stagger-2">
          <EmptyState
            icon={UserCog}
            title="No staff yet"
            description="Add receptionists and coaches to help manage your gym."
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="btn btn-primary"
              >
                <Plus size={16} strokeWidth={1.5} />
                Add Staff
              </button>
            }
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr>
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left">Role</th>
                  <th className="table-header text-left">Contact</th>
                  <th className="table-header text-left">Joined</th>
                  <th className="table-header text-left">Last Active</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s: StaffMember) => (
                  <tr key={s.id} className="table-row group">
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar text-badge">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-table-row font-medium text-text-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4">
                      <Badge variant={s.role === 'coach' ? 'coach' : 'receptionist'}>
                        {s.role === 'coach' ? 'Coach' : 'Receptionist'}
                      </Badge>
                    </td>
                    <td className="px-4">
                      <p className="text-table-row text-text-primary">{s.phone}</p>
                      {s.email && <p className="text-caption text-text-secondary">{s.email}</p>}
                    </td>
                    <td className="px-4 text-table-row text-text-secondary">{formatDate(s.createdAt)}</td>
                    <td className="px-4 text-table-row font-mono text-text-secondary">{formatRelative(s.lastLoginAt)}</td>
                    <td className="px-4">
                      <button
                        onClick={() => toggleMutation.mutate(s.id)}
                        disabled={toggleMutation.isPending}
                        className="transition-all duration-fast"
                      >
                        <Badge variant={s.isActive ? 'active' : 'expired'}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 text-right">
                      <div className="row-actions justify-end">
                        <button
                          onClick={() => setResetTarget(s)}
                          className="btn btn-ghost h-8 w-8 p-0"
                          title="Reset Password"
                        >
                          <KeyRound size={16} strokeWidth={1.5} />
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

      {/* Add Staff Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Staff">
        <StaffForm onSaved={handleSaved} onCancel={() => setDrawerOpen(false)} />
      </Drawer>

      {/* Reset Password Modal */}
      {resetTarget && (
        <ConfirmDialog
          open={!!resetTarget}
          title="Reset Password"
          description={`Enter a new temporary password for ${resetTarget.name}.`}
          confirmLabel={resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
          onConfirm={() => {
            if (newPassword.length >= 6) {
              resetPasswordMutation.mutate({ id: resetTarget.id, password: newPassword });
            }
          }}
          onCancel={() => { setResetTarget(null); setNewPassword(''); }}
          loading={resetPasswordMutation.isPending}
          variant="danger"
        >
          <div className="mb-4">
            <label htmlFor="reset-password" className="input-label">New Password</label>
            <input
              id="reset-password"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="input"
            />
          </div>
        </ConfirmDialog>
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
        <label htmlFor="add-staff-name" className="input-label">Full Name <span className="text-danger">*</span></label>
        <input id="add-staff-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input" />
      </div>
      <div>
        <label htmlFor="add-staff-phone" className="input-label">Phone <span className="text-danger">*</span></label>
        <input id="add-staff-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="input font-mono" />
      </div>
      <div>
        <label htmlFor="add-staff-email" className="input-label">Email</label>
        <input id="add-staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="input" />
      </div>
      <div>
        <label htmlFor="add-staff-role" className="input-label">Role <span className="text-danger">*</span></label>
        <select id="add-staff-role" value={role} onChange={(e) => setRole(e.target.value as 'receptionist' | 'coach')} className="input">
          <option value="receptionist">Receptionist</option>
          <option value="coach">Coach</option>
        </select>
      </div>
      <div>
        <label htmlFor="add-staff-password" className="input-label">Temporary Password <span className="text-danger">*</span></label>
        <input id="add-staff-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="input" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-divider">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Adding...</> : 'Add Staff'}
        </button>
      </div>
    </form>
  );
}
