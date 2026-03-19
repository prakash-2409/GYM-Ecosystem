'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Building2, Users, Bell, QrCode, Save, RefreshCw,
  PlusIcon, Trash2, Palette, Copy, Check, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Drawer } from '@/components/ui/drawer';
import { EmptyState } from '@/components/ui/empty-state';

type SettingsTab = 'gym' | 'staff' | 'notifications' | 'qr';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AutomationConfig {
  feeReminder: boolean;
  feeOverdue: boolean;
  planExpiry: boolean;
  inactivity: boolean;
  birthday: boolean;
  weeklySummary: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('gym');
  const [copied, setCopied] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', role: 'receptionist' });
  const queryClient = useQueryClient();

  const { data: gymData } = useQuery({
    queryKey: ['gym-settings'],
    queryFn: () => apiClient.get('/gym').then((r) => r.data),
  });

  const [gymForm, setGymForm] = useState({
    name: '', address: '', city: '', state: '', pincode: '', gstin: '',
    primaryColor: '#4F46E5', secondaryColor: '#818CF8',
  });

  useEffect(() => {
    if (gymData?.gym) {
      setGymForm({
        name: gymData.gym.name || '',
        address: gymData.gym.address || '',
        city: gymData.gym.city || '',
        state: gymData.gym.state || '',
        pincode: gymData.gym.pincode || '',
        gstin: gymData.gym.gstin || '',
        primaryColor: gymData.gym.primaryColor || '#4F46E5',
        secondaryColor: gymData.gym.secondaryColor || '#818CF8',
      });
    }
  }, [gymData]);

  const { data: staffData } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => apiClient.get('/staff').then((r) => r.data),
    enabled: activeTab === 'staff',
  });

  const { data: qrData, refetch: refetchQr } = useQuery({
    queryKey: ['gym-qr'],
    queryFn: () => apiClient.get('/gym/qr').then((r) => r.data),
    enabled: activeTab === 'qr',
  });

  const updateGymMutation = useMutation({
    mutationFn: (data: typeof gymForm) => apiClient.put('/gym', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gym-settings'] }),
  });

  const addStaffMutation = useMutation({
    mutationFn: (data: typeof staffForm) => apiClient.post('/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
      setShowAddStaff(false);
      setStaffForm({ name: '', phone: '', role: 'receptionist' });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (staffId: string) => apiClient.delete(`/staff/${staffId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-list'] }),
  });

  const [automations, setAutomations] = useState<AutomationConfig>({
    feeReminder: true, feeOverdue: true, planExpiry: true,
    inactivity: true, birthday: true, weeklySummary: true,
  });

  const staff: StaffMember[] = staffData?.staff || [];
  const gym = gymData?.gym;

  const tabs: { key: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
    { key: 'gym', label: 'Gym Profile', icon: Building2 },
    { key: 'staff', label: 'Staff', icon: Users },
    { key: 'notifications', label: 'Automations', icon: Bell },
    { key: 'qr', label: 'QR Code', icon: QrCode },
  ];

  return (
    <div>
      <h1 className="text-page-title text-text-primary mb-8 stagger-1">Settings</h1>

      <div className="flex gap-between-sections stagger-2">
        {/* Settings sidebar nav */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-btn text-body font-medium transition-all duration-normal ${
                    activeTab === tab.key
                      ? 'bg-primary/5 text-primary'
                      : 'text-text-secondary hover:bg-divider hover:text-text-primary'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`filter-chip ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* ── Gym Profile ────────────────────────────── */}
          {activeTab === 'gym' && (
            <div className="card">
              <h2 className="text-section-heading text-text-primary mb-6">Gym Profile</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="gym-name" className="input-label">Gym Name</label>
                  <input id="gym-name" type="text" value={gymForm.name} onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gym-city" className="input-label">City</label>
                    <input id="gym-city" type="text" value={gymForm.city} onChange={(e) => setGymForm({ ...gymForm, city: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label htmlFor="gym-state" className="input-label">State</label>
                    <input id="gym-state" type="text" value={gymForm.state} onChange={(e) => setGymForm({ ...gymForm, state: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gym-pincode" className="input-label">Pincode</label>
                    <input id="gym-pincode" type="text" value={gymForm.pincode} onChange={(e) => setGymForm({ ...gymForm, pincode: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label htmlFor="gym-gstin" className="input-label">GSTIN</label>
                    <input id="gym-gstin" type="text" value={gymForm.gstin} onChange={(e) => setGymForm({ ...gymForm, gstin: e.target.value })} className="input" />
                  </div>
                </div>
                <div>
                  <label htmlFor="gym-address" className="input-label">Address</label>
                  <textarea id="gym-address" value={gymForm.address} onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })} rows={2} className="input h-auto py-3 resize-none" />
                </div>

                {/* Branding Colors */}
                <div className="pt-6 border-t border-divider">
                  <h3 className="text-card-heading text-text-primary mb-4 flex items-center gap-2">
                    <Palette size={18} strokeWidth={1.5} /> Branding
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="gym-primary-color" className="input-label">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input id="gym-primary-color" type="color" value={gymForm.primaryColor} onChange={(e) => setGymForm({ ...gymForm, primaryColor: e.target.value })} className="w-10 h-input rounded-btn border border-border-default cursor-pointer" />
                        <input type="text" value={gymForm.primaryColor} onChange={(e) => setGymForm({ ...gymForm, primaryColor: e.target.value })} className="input flex-1 font-mono" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="gym-secondary-color" className="input-label">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input id="gym-secondary-color" type="color" value={gymForm.secondaryColor} onChange={(e) => setGymForm({ ...gymForm, secondaryColor: e.target.value })} className="w-10 h-input rounded-btn border border-border-default cursor-pointer" />
                        <input type="text" value={gymForm.secondaryColor} onChange={(e) => setGymForm({ ...gymForm, secondaryColor: e.target.value })} className="input flex-1 font-mono" />
                      </div>
                    </div>
                  </div>
                  {/* Brand preview */}
                  <div className="mt-4 p-4 rounded-card flex items-center gap-3" style={{ background: gymForm.primaryColor }}>
                    <span className="text-white font-medium text-body">{gymForm.name || 'Your Gym'}</span>
                    <span className="px-2 py-0.5 rounded-badge text-badge font-medium" style={{ background: gymForm.secondaryColor, color: '#fff' }}>
                      Premium
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => updateGymMutation.mutate(gymForm)}
                  disabled={updateGymMutation.isPending}
                  className="btn btn-primary mt-4"
                >
                  {updateGymMutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Saving...</>
                  ) : (
                    <><Save size={16} strokeWidth={1.5} /> Save Changes</>
                  )}
                </button>
                {updateGymMutation.isSuccess && (
                  <p className="text-caption text-success flex items-center gap-1 mt-2">
                    <Check size={14} strokeWidth={1.5} /> Saved successfully
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Staff ──────────────────────────────────── */}
          {activeTab === 'staff' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-section-heading text-text-primary">Staff Management</h2>
                <button onClick={() => setShowAddStaff(true)} className="btn btn-primary">
                  <PlusIcon size={16} strokeWidth={1.5} /> Add Staff
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header text-left">Name</th>
                    <th className="table-header text-left">Phone</th>
                    <th className="table-header text-left">Role</th>
                    <th className="table-header text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length > 0 ? (
                    staff.map((s) => (
                      <tr key={s.id} className="table-row group">
                        <td className="px-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar text-badge">{s.name[0]?.toUpperCase()}</div>
                            <span className="text-table-row font-medium text-text-primary">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 text-table-row font-mono text-text-secondary">{s.phone}</td>
                        <td className="px-4">
                          <Badge variant={
                            s.role === 'gym_owner' ? 'receptionist' : s.role === 'coach' ? 'coach' : 'default'
                          }>
                            {s.role === 'gym_owner' ? 'Owner' : s.role === 'coach' ? 'Coach' : 'Receptionist'}
                          </Badge>
                        </td>
                        <td className="px-4">
                          <div className="row-actions">
                            {s.role !== 'gym_owner' && (
                              <button
                                onClick={() => deleteStaffMutation.mutate(s.id)}
                                className="btn btn-danger h-8 px-3 text-badge"
                              >
                                <Trash2 size={14} strokeWidth={1.5} /> Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <EmptyState
                          icon={Users}
                          title="No staff members yet"
                          description="Add receptionists and coaches to help manage your gym"
                          action={
                            <button onClick={() => setShowAddStaff(true)} className="btn btn-primary">
                              <PlusIcon size={16} strokeWidth={1.5} /> Add Staff
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Add Staff Drawer */}
              <Drawer
                open={showAddStaff}
                onClose={() => setShowAddStaff(false)}
                title="Add Staff Member"
                footer={
                  <>
                    <button onClick={() => setShowAddStaff(false)} className="btn btn-secondary">Cancel</button>
                    <button
                      onClick={() => addStaffMutation.mutate(staffForm)}
                      disabled={addStaffMutation.isPending || !staffForm.name || !staffForm.phone}
                      className="btn btn-primary"
                    >
                      {addStaffMutation.isPending ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Adding...</>
                      ) : 'Add Staff'}
                    </button>
                  </>
                }
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="staff-name" className="input-label">Name</label>
                    <input id="staff-name" type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label htmlFor="staff-phone" className="input-label">Phone</label>
                    <input id="staff-phone" type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className="input" placeholder="9876543210" />
                  </div>
                  <div>
                    <label htmlFor="staff-role" className="input-label">Role</label>
                    <select id="staff-role" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="input">
                      <option value="receptionist">Receptionist</option>
                      <option value="coach">Coach</option>
                    </select>
                  </div>
                </div>
              </Drawer>
            </div>
          )}

          {/* ── Automations ────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-section-heading text-text-primary mb-2">Automation Settings</h2>
              <p className="text-body text-text-secondary mb-6">Control which automated messages are sent to your members.</p>
              <div className="space-y-3">
                {[
                  { key: 'feeReminder' as keyof AutomationConfig, label: 'Fee Reminders', desc: '3 days before due date via WhatsApp' },
                  { key: 'feeOverdue' as keyof AutomationConfig, label: 'Fee Overdue Alerts', desc: 'On due date via WhatsApp + SMS' },
                  { key: 'planExpiry' as keyof AutomationConfig, label: 'Plan Expiry Warnings', desc: '7 days and 1 day before expiry' },
                  { key: 'inactivity' as keyof AutomationConfig, label: 'Inactivity Nudges', desc: 'After 5 days of no check-in' },
                  { key: 'birthday' as keyof AutomationConfig, label: 'Birthday Wishes', desc: 'Auto birthday greeting on their day' },
                  { key: 'weeklySummary' as keyof AutomationConfig, label: 'Weekly Summary', desc: 'Monday morning stats to gym owner' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 stat-card">
                    <div>
                      <p className="text-body font-medium text-text-primary">{item.label}</p>
                      <p className="text-caption text-text-secondary">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setAutomations({ ...automations, [item.key]: !automations[item.key] })}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-normal ${
                        automations[item.key] ? 'bg-primary' : 'bg-border-strong'
                      }`}
                      role="switch"
                      aria-checked={automations[item.key]}
                      aria-label={item.label}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-normal ${
                        automations[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── QR Code ────────────────────────────────── */}
          {activeTab === 'qr' && (
            <div className="card">
              <h2 className="text-section-heading text-text-primary mb-2">Gym QR Code</h2>
              <p className="text-body text-text-secondary mb-6">Members scan this QR code with the app to check in. Print and display at your gym entrance.</p>

              <div className="text-center">
                <div className="inline-block p-6 card mt-2 mb-6">
                  <div className="w-48 h-48 bg-divider rounded-card flex items-center justify-center">
                    <QrCode size={80} strokeWidth={1.5} className="text-text-muted" />
                  </div>
                  <p className="mt-3 text-body font-medium text-text-primary">{gym?.name || 'Your Gym'}</p>
                  <p className="text-caption text-text-muted">Scan to check in</p>
                </div>

                {qrData && (
                  <div className="stat-card text-left mb-6 mx-auto max-w-md">
                    <label className="input-label uppercase">QR Data</label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-caption bg-divider p-2 rounded-btn font-mono break-all">{qrData.qrData}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(qrData.qrData); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="btn btn-ghost h-8 w-8 p-0 flex-shrink-0"
                        aria-label="Copy QR data"
                      >
                        {copied ? <Check size={16} strokeWidth={1.5} className="text-success" /> : <Copy size={16} strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button onClick={() => refetchQr()} className="btn btn-secondary">
                    <RefreshCw size={16} strokeWidth={1.5} /> Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
