'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Send, Clock, MessageSquare, Bell, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

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
      apiClient.post('/notifications', data),
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
      <h1 className="text-page-title text-text-primary mb-8 stagger-1">Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-between-sections">
        {/* ── Compose Panel ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4 stagger-2">
          <div className="card">
            <h2 className="text-section-heading text-text-primary mb-6">Compose Message</h2>

            {/* Quick Actions */}
            <div className="mb-6">
              <label className="input-label uppercase">Quick Send</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {quickMessages.map((qm) => (
                  <button
                    key={qm.label}
                    onClick={() => { setTitle(qm.label.replace(/[^\w\s]/g, '').trim()); setMessage(qm.body); }}
                    className="text-left p-3 stat-card hover:shadow-card-hover transition-shadow duration-normal"
                  >
                    <span className="text-body font-medium text-text-primary">{qm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div className="mb-6">
              <label className="input-label uppercase">Send To</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {targets.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTarget(t.key)}
                    className={`p-3 rounded-btn border text-left transition-all duration-normal ${
                      target === t.key
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-default hover:border-border-strong'
                    }`}
                  >
                    <p className="text-body font-medium">{t.label}</p>
                    <p className="text-caption text-text-secondary">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel */}
            <div className="mb-6">
              <label className="input-label uppercase">Channel</label>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setChannel('push')}
                  className={`flex-1 btn ${channel === 'push' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Bell size={16} strokeWidth={1.5} /> Push
                </button>
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`flex-1 btn ${
                    channel === 'whatsapp'
                      ? 'bg-success text-white border-success hover:opacity-90'
                      : 'btn-secondary'
                  }`}
                >
                  <MessageSquare size={16} strokeWidth={1.5} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label htmlFor="notif-title" className="input-label">Title</label>
              <input
                id="notif-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="input"
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label htmlFor="notif-message" className="input-label">Message</label>
              <textarea
                id="notif-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... Use [Name] for personalization."
                rows={3}
                className="input h-auto py-3 resize-none"
              />
              <p className="text-caption text-text-muted mt-1">Tip: Use [Name] to insert member&apos;s name</p>
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMutation.mutate({ title, body: message, channel, target })}
              disabled={sendMutation.isPending || !message.trim() || !title.trim()}
              className="btn btn-primary w-full h-input"
            >
              {sendMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Sending...</>
              ) : (
                <><Send size={16} strokeWidth={1.5} /> Send to {targets.find((t) => t.key === target)?.label}</>
              )}
            </button>

            {sendMutation.isSuccess && (
              <p className="text-caption text-success text-center mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} strokeWidth={1.5} /> Message sent successfully!
              </p>
            )}
          </div>
        </div>

        {/* ── History Panel ─────────────────────────────── */}
        <div className="lg:col-span-3 stagger-3">
          <div className="card p-0 overflow-hidden">
            <div className="px-card-pad py-4 border-b border-divider">
              <h2 className="text-section-heading text-text-primary">Notification History</h2>
            </div>
            <div className="divide-y divide-divider max-h-[600px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="px-card-pad py-3 hover:bg-page transition-colors duration-fast">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 avatar text-badge ${
                        n.channel === 'whatsapp' ? 'bg-success' : n.channel === 'push' ? 'bg-info' : 'bg-text-muted'
                      }`}>
                        {n.channel === 'whatsapp' ? 'WA' : n.channel === 'push' ? '🔔' : 'SM'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-body font-medium text-text-primary truncate">{n.title}</p>
                          <Badge variant={
                            n.status === 'sent' ? 'active' : n.status === 'failed' ? 'expired' : 'default'
                          }>
                            {n.status === 'sent' && <CheckCircle2 size={10} strokeWidth={1.5} className="inline mr-1" />}
                            {n.status === 'failed' && <XCircle size={10} strokeWidth={1.5} className="inline mr-1" />}
                            {n.status === 'pending' && <Clock size={10} strokeWidth={1.5} className="inline mr-1" />}
                            {n.status}
                          </Badge>
                        </div>
                        <p className="text-caption text-text-secondary mt-0.5 truncate">{n.body}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-caption text-text-muted">
                            {n.sentAt
                              ? new Date(n.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : 'Pending'}
                          </span>
                          {n.member?.user?.name && (
                            <>
                              <ArrowRight size={10} strokeWidth={1.5} className="text-text-muted" />
                              <span className="text-caption text-text-secondary">{n.member.user.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Bell}
                  title="No notifications sent yet"
                  description="Compose your first message on the left"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
