'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Send, Clock, MessageSquare, Bell, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

type Target = 'all' | 'active' | 'expiring_soon' | 'overdue';
type Channel = 'push' | 'whatsapp';

const quickMessages = [
  { label: '💪 Motivation', body: 'Keep pushing! Every rep counts. See you at the gym today! 🏋️' },
  { label: '🏋️ Gym Closed', body: 'The gym will be closed tomorrow for maintenance. We apologize for the inconvenience.' },
  { label: '🎆 Festival', body: 'Wishing you and your family a very happy festival! Enjoy your day, see you tomorrow. 🎉' },
  { label: '💰 Fee Reminder', body: 'Your membership fee is approaching the due date. Please visit the front desk to renew.' },
];

interface Notification {
  id: string;
  type: string;
  channel: string;
  title: string;
  body: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  member?: { user?: { name?: string } };
}

export default function NotificationsPage() {
  const [target, setTarget] = useState<Target>('all');
  const [channel, setChannel] = useState<Channel>('push');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const { data: historyData, refetch } = useQuery({
    queryKey: ['notification-history'],
    queryFn: () => apiClient.get('/notifications').then((r) => r.data),
  });

  const sendMutation = useMutation({
    mutationFn: (data: { title: string; body: string; channel: string; target: string }) =>
      apiClient.post('/notifications/send', data),
    onSuccess: () => {
      setTitle('');
      setMessage('');
      refetch();
    },
  });

  const notifications: Notification[] = historyData?.notifications || [];

  const targets: { key: Target; label: string; desc: string }[] = [
    { key: 'all', label: 'All Members', desc: 'Everyone in the gym' },
    { key: 'active', label: 'Active Only', desc: 'Members with valid plans' },
    { key: 'expiring_soon', label: 'Expiring Soon', desc: 'Plans ending in 7 days' },
    { key: 'overdue', label: 'Overdue', desc: 'Expired / fee pending' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold mb-4">Compose Message</h2>

            {/* Quick Actions */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Quick Send</label>
              <div className="grid grid-cols-2 gap-2">
                {quickMessages.map((qm) => (
                  <button
                    key={qm.label}
                    onClick={() => { setTitle(qm.label.replace(/[^\w\s]/g, '').trim()); setMessage(qm.body); }}
                    className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span className="font-medium">{qm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Send To</label>
              <div className="grid grid-cols-2 gap-2">
                {targets.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTarget(t.key)}
                    className={`p-3 rounded-lg border text-left transition-colors ${target === t.key ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Channel</label>
              <div className="flex gap-3">
                <button onClick={() => setChannel('push')} className={`flex-1 h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${channel === 'push' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`}>
                  <Bell size={14} /> Push
                </button>
                <button onClick={() => setChannel('whatsapp')} className={`flex-1 h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${channel === 'whatsapp' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200'}`}>
                  <MessageSquare size={14} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... Use [Name] for personalization."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Tip: Use [Name] to insert member&apos;s name</p>
            </div>

            <button
              onClick={() => sendMutation.mutate({ title, body: message, channel, target })}
              disabled={sendMutation.isPending || !message.trim() || !title.trim()}
              className="w-full h-10 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendMutation.isPending ? (
                'Sending...'
              ) : (
                <><Send size={16} /> Send to {targets.find((t) => t.key === target)?.label}</>
              )}
            </button>

            {sendMutation.isSuccess && (
              <p className="text-sm text-green-600 text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} /> Message sent successfully!
              </p>
            )}
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold">Notification History</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${n.channel === 'whatsapp' ? 'bg-green-500' : n.channel === 'push' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                      {n.channel === 'whatsapp' ? 'WA' : n.channel === 'push' ? '🔔' : 'SM'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full ${n.status === 'sent' ? 'bg-green-100 text-green-700' : n.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {n.status === 'sent' ? <CheckCircle2 size={10} className="inline" /> : n.status === 'failed' ? <XCircle size={10} className="inline" /> : <Clock size={10} className="inline" />}
                          {' '}{n.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {n.sentAt ? new Date(n.sentAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                        </span>
                        {n.member?.user?.name && (
                          <>
                            <ArrowRight size={10} className="text-gray-300" />
                            <span className="text-xs text-gray-500">{n.member.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="px-5 py-12 text-center text-gray-400">
                  <Bell size={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No notifications sent yet</p>
                  <p className="text-sm">Compose your first message on the left</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
