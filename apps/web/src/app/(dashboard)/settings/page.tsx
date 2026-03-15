'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Building2, Users, Bell, QrCode, Save, RefreshCw,
  PlusIcon, X, Trash2, Palette, Copy, Check,
} from 'lucide-react';

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

  // Gym data
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

  // Staff
  const { data: staffData } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => apiClient.get('/staff').then((r) => r.data),
    enabled: activeTab === 'staff',
  });

  // QR
  const { data: qrData, refetch: refetchQr } = useQuery({
    queryKey: ['gym-qr'],
    queryFn: () => apiClient.get('/gym/qr').then((r) => r.data),
    enabled: activeTab === 'qr',
  });

  // Mutations
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

  // Automation config (local state, saved via API)
  const [automations, setAutomations] = useState<AutomationConfig>({
    feeReminder: true, feeOverdue: true, planExpiry: true,
    inactivity: true, birthday: true, weeklySummary: true,
  });

  const staff: StaffMember[] = staffData?.staff || [];
  const gym = gymData?.gym;

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'gym', label: 'Gym Profile', icon: <Building2 size={16} /> },
    { key: 'staff', label: 'Staff', icon: <Users size={16} /> },
    { key: 'notifications', label: 'Automations', icon: <Bell size={16} /> },
    { key: 'qr', label: 'QR Code', icon: <QrCode size={16} /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'gym' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-6">Gym Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gym Name</label>
                  <input type="text" value={gymForm.name} onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={gymForm.city} onChange={(e) => setGymForm({ ...gymForm, city: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" value={gymForm.state} onChange={(e) => setGymForm({ ...gymForm, state: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input type="text" value={gymForm.pincode} onChange={(e) => setGymForm({ ...gymForm, pincode: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                    <input type="text" value={gymForm.gstin} onChange={(e) => setGymForm({ ...gymForm, gstin: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea value={gymForm.address} onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
                </div>

                {/* Branding Colors */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Palette size={16} /> Branding</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={gymForm.primaryColor} onChange={(e) => setGymForm({ ...gymForm, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                        <input type="text" value={gymForm.primaryColor} onChange={(e) => setGymForm({ ...gymForm, primaryColor: e.target.value })} className="flex-1 h-10 px-3 border border-gray-300 rounded-lg font-mono text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={gymForm.secondaryColor} onChange={(e) => setGymForm({ ...gymForm, secondaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                        <input type="text" value={gymForm.secondaryColor} onChange={(e) => setGymForm({ ...gymForm, secondaryColor: e.target.value })} className="flex-1 h-10 px-3 border border-gray-300 rounded-lg font-mono text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-4 rounded-lg flex items-center gap-3" style={{ background: gymForm.primaryColor }}>
                    <span className="text-white font-medium text-sm">Preview: {gymForm.name || 'Your Gym'}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: gymForm.secondaryColor, color: '#fff' }}>
                      Premium
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => updateGymMutation.mutate(gymForm)}
                  disabled={updateGymMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save size={16} /> {updateGymMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                {updateGymMutation.isSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Saved successfully</p>}
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Staff Management</h2>
                <button onClick={() => setShowAddStaff(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <PlusIcon size={16} /> Add Staff
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{s.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.role === 'gym_owner' ? 'bg-purple-100 text-purple-700'
                            : s.role === 'coach' ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                          {s.role === 'gym_owner' ? 'Owner' : s.role === 'coach' ? 'Coach' : 'Receptionist'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.role !== 'gym_owner' && (
                          <button onClick={() => deleteStaffMutation.mutate(s.id)} className="text-red-500 hover:text-red-600 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No staff members yet</td></tr>
                  )}
                </tbody>
              </table>

              {/* Add Staff Drawer */}
              {showAddStaff && (
                <>
                  <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowAddStaff(false)} />
                  <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold">Add Staff Member</h2>
                      <button onClick={() => setShowAddStaff(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="9876543210" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                          <option value="receptionist">Receptionist</option>
                          <option value="coach">Coach</option>
                        </select>
                      </div>
                      <button onClick={() => addStaffMutation.mutate(staffForm)} disabled={addStaffMutation.isPending || !staffForm.name || !staffForm.phone} className="w-full h-10 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                        {addStaffMutation.isPending ? 'Adding...' : 'Add Staff'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-2">Automation Settings</h2>
              <p className="text-sm text-gray-500 mb-6">Control which automated messages are sent to your members.</p>
              <div className="space-y-4">
                {[
                  { key: 'feeReminder' as keyof AutomationConfig, label: 'Fee Reminders', desc: '3 days before due date via WhatsApp' },
                  { key: 'feeOverdue' as keyof AutomationConfig, label: 'Fee Overdue Alerts', desc: 'On due date via WhatsApp + SMS' },
                  { key: 'planExpiry' as keyof AutomationConfig, label: 'Plan Expiry Warnings', desc: '7 days and 1 day before expiry' },
                  { key: 'inactivity' as keyof AutomationConfig, label: 'Inactivity Nudges', desc: 'After 5 days of no check-in' },
                  { key: 'birthday' as keyof AutomationConfig, label: 'Birthday Wishes', desc: 'Auto birthday greeting on their day' },
                  { key: 'weeklySummary' as keyof AutomationConfig, label: 'Weekly Summary', desc: 'Monday morning stats to gym owner' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setAutomations({ ...automations, [item.key]: !automations[item.key] })}
                      className={`w-11 h-6 rounded-full relative transition-colors ${automations[item.key] ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${automations[item.key] ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-2">Gym QR Code</h2>
              <p className="text-sm text-gray-500 mb-6">Members scan this QR code with the app to check in. Print and display at your gym entrance.</p>

              <div className="text-center">
                <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-2xl mt-2 mb-6">
                  {/* QR Code placeholder — use a QR lib on frontend or generate server-side */}
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <QrCode size={80} className="text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700">{gym?.name || 'Your Gym'}</p>
                  <p className="text-xs text-gray-400">Scan to check in</p>
                </div>

                {qrData && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">QR Data (use this in a QR generator)</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-gray-100 p-2 rounded font-mono break-all">{qrData.qrData}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(qrData.qrData); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => refetchQr()}
                    className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw size={14} /> Refresh
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
