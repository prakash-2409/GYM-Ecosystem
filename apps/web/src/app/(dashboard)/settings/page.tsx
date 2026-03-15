'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const { data } = useQuery({
    queryKey: ['gym'],
    queryFn: () => apiClient.get('/gym').then((r) => r.data),
  });

  const [form, setForm] = useState({
    name: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
  });

  // Populate form when data loads
  useState(() => {
    if (data?.gym) {
      setForm({
        name: data.gym.name || '',
        primaryColor: data.gym.primaryColor || '#2563EB',
        secondaryColor: data.gym.secondaryColor || '#1E40AF',
        address: data.gym.address || '',
        city: data.gym.city || '',
        state: data.gym.state || '',
        pincode: data.gym.pincode || '',
        gstin: data.gym.gstin || '',
      });
    }
  });

  const mutation = useMutation({
    mutationFn: () => apiClient.put('/gym', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym'] });
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await mutation.mutateAsync();
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Gym Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        <h2 className="text-lg font-semibold">Branding</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gym Name</label>
          <input name="name" value={form.name} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange}
                className="w-10 h-10 rounded border cursor-pointer" />
              <input type="text" value={form.primaryColor} onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="secondaryColor" value={form.secondaryColor} onChange={handleChange}
                className="w-10 h-10 rounded border cursor-pointer" />
              <input type="text" value={form.secondaryColor} onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm" />
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold pt-4">GST Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
          <input name="gstin" value={form.gstin} onChange={handleChange} maxLength={15} placeholder="22AAAAA0000A1Z5"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input name="state" value={form.state} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input name="pincode" value={form.pincode} onChange={handleChange} maxLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>

        {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">{success}</div>}

        <button type="submit" disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
