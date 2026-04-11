'use client';

import { useState, useMemo } from 'react';
import {
  Bell, Send, Search, MessageSquare, Smartphone, Mail,
  Users, User2, CheckCircle2, Clock, XCircle, Zap,
  Gift, AlertTriangle, Megaphone
} from 'lucide-react';
import { MOCK_NOTIFICATIONS, MOCK_MEMBERS, type MockNotification } from '@/lib/mock-data';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type ComposeTarget = 'all' | 'active' | 'expiring' | 'expired' | 'individual';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  const [activeView, setActiveView] = useState<'history' | 'compose'>('history');
  const [search, setSearch] = useState('');

  // Compose state
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeChannel, setComposeChannel] = useState<'whatsapp' | 'sms' | 'push'>('whatsapp');
  const [composeTarget, setComposeTarget] = useState<ComposeTarget>('all');
  const [composeType, setComposeType] = useState<'general' | 'fee_reminder' | 'promo'>('general');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const filtered = useMemo(() => {
    if (!search.trim()) return notifications;
    const q = search.toLowerCase();
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(q) || n.sentTo.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }, [notifications, search]);

  const stats = useMemo(() => ({
    total: notifications.length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    pending: notifications.filter(n => n.status === 'pending').length,
  }), [notifications]);

  const quickTemplates = [
    { icon: AlertTriangle, label: 'Fee Reminder', title: 'Fee Reminder', message: 'Hi {name}, your {plan} fee of ₹{amount} is due. Please visit the gym or pay via UPI.', type: 'fee_reminder' as const },
    { icon: Megaphone, label: 'Summer Offer', title: 'Summer Special 🌞', message: 'Upgrade your plan this month and get 15% off! Limited time offer.', type: 'promo' as const },
    { icon: Gift, label: 'Birthday Wish', title: 'Happy Birthday! 🎂', message: 'Wishing you a healthy and fit year ahead! Enjoy a complimentary protein shake today.', type: 'general' as const },
    { icon: Zap, label: 'Inactivity Nudge', title: 'We miss you! 💪', message: 'Hi {name}, we noticed you haven\'t visited in a while. Your body is calling — come back stronger!', type: 'general' as const },
  ];

  const handleSend = () => {
    if (!composeTitle.trim() || !composeMessage.trim()) return;

    setSendingState('sending');

    setTimeout(() => {
      const targetLabel =
        composeTarget === 'all' ? 'All Members' :
        composeTarget === 'individual' ? 'Selected Member' :
        `${composeTarget.charAt(0).toUpperCase() + composeTarget.slice(1)} Members`;

      const newNotif: MockNotification = {
        id: `notif-${Date.now()}`,
        title: composeTitle,
        message: composeMessage,
        type: composeType,
        sentAt: new Date().toISOString(),
        sentTo: targetLabel,
        channel: composeChannel,
        status: 'delivered',
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setSendingState('sent');

      setTimeout(() => {
        setSendingState('idle');
        setComposeTitle('');
        setComposeMessage('');
        setActiveView('history');
      }, 1500);
    }, 1200);
  };

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setComposeTitle(template.title);
    setComposeMessage(template.message);
    setComposeType(template.type);
    setActiveView('compose');
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'fee_reminder': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'birthday': return <Gift size={14} className="text-pink-500" />;
      case 'inactivity': return <Clock size={14} className="text-orange-500" />;
      case 'promo': return <Megaphone size={14} className="text-blue-500" />;
      default: return <Bell size={14} className="text-violet-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 stagger-1">
        <div>
          <h1 className="text-page-title text-text-primary">Notifications</h1>
          <p className="text-body text-text-secondary mt-2">
            Send and track WhatsApp, SMS, and push notifications to members
          </p>
        </div>
        <button
          onClick={() => setActiveView(activeView === 'compose' ? 'history' : 'compose')}
          className={`btn ${activeView === 'compose' ? 'btn-secondary' : 'btn-primary'}`}
        >
          {activeView === 'compose' ? (
            <><Bell size={16} /> View History</>
          ) : (
            <><Send size={16} /> Compose New</>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-between-cards stagger-2">
        <div className="stat-card">
          <p className="stat-card-label">Total Sent</p>
          <p className="stat-card-value mt-2 font-mono">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Delivered</p>
          <p className="stat-card-value mt-2 font-mono text-success">{stats.delivered}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Pending</p>
          <p className="stat-card-value mt-2 font-mono text-warning">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Failed</p>
          <p className="stat-card-value mt-2 font-mono text-danger">{stats.failed}</p>
        </div>
      </div>

      {activeView === 'history' ? (
        <>
          {/* Quick Templates */}
          <div className="stagger-3">
            <h2 className="text-card-heading text-text-primary mb-3">Quick Send</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {quickTemplates.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.label}
                    onClick={() => applyTemplate(tpl)}
                    className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-body text-text-primary font-medium">{tpl.label}</p>
                      <p className="text-caption text-text-muted line-clamp-1">{tpl.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative stagger-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* History */}
          <div className="card p-0 overflow-hidden stagger-5">
            <div className="divide-y divide-divider">
              {filtered.map((n) => (
                <div key={n.id} className="px-card-pad py-4 hover:bg-page/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{typeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-body text-text-primary font-medium">{n.title}</p>
                        <span className={`badge ${
                          n.channel === 'whatsapp' ? 'badge-active' :
                          n.channel === 'sms' ? 'badge-coach' : 'badge-receptionist'
                        }`}>
                          {n.channel === 'whatsapp' ? '💬 WhatsApp' : n.channel === 'sms' ? '📱 SMS' : '🔔 Push'}
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-caption text-text-muted flex items-center gap-1">
                          <User2 size={11} /> {n.sentTo}
                        </span>
                        <span className="text-caption text-text-muted">{timeAgo(n.sentAt)}</span>
                      </div>
                    </div>
                    <span className={`badge flex-shrink-0 ${
                      n.status === 'delivered' ? 'badge-active' :
                      n.status === 'failed' ? 'badge-overdue' : 'badge-expiring'
                    }`}>
                      {n.status === 'delivered' && <CheckCircle2 size={11} className="mr-1" />}
                      {n.status === 'failed' && <XCircle size={11} className="mr-1" />}
                      {n.status === 'pending' && <Clock size={11} className="mr-1" />}
                      {n.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ═══ COMPOSE VIEW ═══ */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-between-cards stagger-3">
          <div className="xl:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-section-heading text-text-primary mb-6">Compose Notification</h2>

              {/* Channel */}
              <div className="mb-6">
                <label className="input-label">Channel</label>
                <div className="flex gap-2">
                  {([
                    { key: 'whatsapp' as const, label: '💬 WhatsApp', icon: MessageSquare },
                    { key: 'sms' as const, label: '📱 SMS', icon: Smartphone },
                    { key: 'push' as const, label: '🔔 Push', icon: Bell },
                  ]).map((ch) => (
                    <button
                      key={ch.key}
                      onClick={() => setComposeChannel(ch.key)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${
                        composeChannel === ch.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-border-default text-text-secondary hover:border-primary/30'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target */}
              <div className="mb-6">
                <label className="input-label">Send To</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'all' as const, label: 'All Members', icon: Users },
                    { key: 'active' as const, label: 'Active', icon: CheckCircle2 },
                    { key: 'expiring' as const, label: 'Expiring', icon: Clock },
                    { key: 'expired' as const, label: 'Expired', icon: XCircle },
                  ]).map((tgt) => {
                    const Icon = tgt.icon;
                    return (
                      <button
                        key={tgt.key}
                        onClick={() => setComposeTarget(tgt.key)}
                        className={`filter-chip ${composeTarget === tgt.key ? 'active' : ''}`}
                      >
                        <Icon size={12} className="mr-1" /> {tgt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="input-label">Title</label>
                <input
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="input"
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="input-label">Message</label>
                <textarea
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="input h-auto py-3 resize-none"
                />
                <p className="text-caption text-text-muted mt-1">
                  {composeMessage.length} characters  •  Use {'{name}'} for member name
                </p>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!composeTitle.trim() || !composeMessage.trim() || sendingState !== 'idle'}
                className="btn btn-primary w-full h-11"
              >
                {sendingState === 'idle' && <><Send size={16} /> Send Notification</>}
                {sendingState === 'sending' && (
                  <span className="flex items-center gap-2">
                    <div className="btn-spinner" /> Sending...
                  </span>
                )}
                {sendingState === 'sent' && <><CheckCircle2 size={16} /> Sent Successfully!</>}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-[#111111] border-white/10 text-white">
            <h3 className="text-card-heading text-white/80 mb-4">Preview</h3>
            <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08]">
              {composeChannel === 'whatsapp' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageSquare size={12} className="text-white" />
                  </div>
                  <span className="text-sm text-white/60">WhatsApp</span>
                </div>
              )}
              {composeChannel === 'sms' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Smartphone size={12} className="text-white" />
                  </div>
                  <span className="text-sm text-white/60">SMS</span>
                </div>
              )}
              {composeChannel === 'push' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                    <Bell size={12} className="text-white" />
                  </div>
                  <span className="text-sm text-white/60">Push Notification</span>
                </div>
              )}
              <p className="text-white font-medium text-sm mb-1">{composeTitle || 'Title preview...'}</p>
              <p className="text-white/60 text-xs leading-relaxed">{composeMessage || 'Your message will appear here...'}</p>
              <div className="flex items-center gap-2 mt-3 text-[11px] text-white/30">
                <Users size={10} />
                <span>
                  {composeTarget === 'all'
                    ? `${MOCK_MEMBERS.length} members`
                    : `${MOCK_MEMBERS.filter(m => m.status === composeTarget).length} members`
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Delivery Estimate</p>
              <p className="text-sm text-white/70">
                {composeChannel === 'whatsapp' ? '~2 minutes' :
                 composeChannel === 'sms' ? '~30 seconds' : 'Instant'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
