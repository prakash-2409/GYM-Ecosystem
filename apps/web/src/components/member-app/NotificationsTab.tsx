'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle2, Tag, Dumbbell, TrendingUp,
  Bell, IndianRupee, Star, BellOff,
} from 'lucide-react';
import { MEMBER_APP_NOTIFICATIONS, type MemberNotification } from '@/lib/mock-data';

type CategoryFilter = 'all' | 'offer' | 'workout' | 'progress' | 'checkin' | 'fee' | 'general';

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  checkin:  { icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', label: 'Check-in' },
  offer:    { icon: Tag,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Offers' },
  workout:  { icon: Dumbbell,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Workout' },
  progress: { icon: TrendingUp,   color: '#22D3EE', bg: 'rgba(34,211,238,0.12)', label: 'Progress' },
  general:  { icon: Bell,         color: '#6B7280', bg: 'rgba(107,114,128,0.12)', label: 'General' },
  fee:      { icon: IndianRupee,  color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Fee' },
};

const FILTER_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'offer', label: 'Offers' },
  { key: 'workout', label: 'Workout' },
  { key: 'progress', label: 'Progress' },
  { key: 'fee', label: 'Fee' },
];

interface NotificationsTabProps {
  brandColor: string;
}

function groupNotificationsByDate(notifications: MemberNotification[]) {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  const weekAgo = now.getTime() - 604800000;

  const groups: { label: string; items: MemberNotification[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This Week', items: [] },
    { label: 'Earlier', items: [] },
  ];

  notifications.forEach((n) => {
    const nDate = new Date(n.timestamp);
    const nStr = nDate.toDateString();
    if (nStr === todayStr) groups[0].items.push(n);
    else if (nStr === yesterdayStr) groups[1].items.push(n);
    else if (nDate.getTime() > weekAgo) groups[2].items.push(n);
    else groups[3].items.push(n);
  });

  return groups.filter((g) => g.items.length > 0);
}

export function NotificationsTab({ brandColor }: NotificationsTabProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [readState, setReadState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    MEMBER_APP_NOTIFICATIONS.forEach((n) => { state[n.id] = n.read; });
    return state;
  });

  const unreadCount = useMemo(() =>
    Object.values(readState).filter((r) => !r).length,
  [readState]);

  const filteredNotifications = useMemo(() => {
    let list = MEMBER_APP_NOTIFICATIONS.map((n) => ({ ...n, read: readState[n.id] ?? n.read }));
    if (activeFilter !== 'all') {
      list = list.filter((n) => n.category === activeFilter);
    }
    return list;
  }, [activeFilter, readState]);

  const groups = useMemo(() => groupNotificationsByDate(filteredNotifications), [filteredNotifications]);

  const markAllRead = () => {
    const newState: Record<string, boolean> = {};
    MEMBER_APP_NOTIFICATIONS.forEach((n) => { newState[n.id] = true; });
    setReadState(newState);
  };

  const toggleRead = (id: string) => {
    setReadState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="member-tab-enter">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F5F5F0]">Notifications</h1>
            <p className="text-sm text-[#888] mt-1">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium active:scale-[0.95] transition-transform px-3 py-1.5 rounded-lg bg-white/[0.05]"
              style={{ color: brandColor }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.95] border ${
                  isActive
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-[#1A1A1A] text-[#888] border-white/[0.07] hover:text-[#F5F5F0]'
                }`}
                style={isActive ? { background: brandColor, borderColor: 'transparent' } : undefined}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      {groups.length === 0 ? (
        /* Empty State */
        <div className="px-5 flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
            <BellOff size={28} className="text-[#555]" />
          </div>
          <p className="text-base font-medium text-[#F5F5F0]">All caught up! 🎉</p>
          <p className="text-sm text-[#888] mt-1 text-center">No notifications to show right now.</p>
        </div>
      ) : (
        <div className="px-5 pb-4 space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] text-[#555] uppercase tracking-wider font-medium mb-2 pl-1">{group.label}</p>
              <div className="space-y-2">
                {group.items.map((n) => {
                  const cat = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.general;
                  const CatIcon = cat.icon;
                  const isRead = readState[n.id] ?? n.read;

                  return (
                    <button
                      key={n.id}
                      onClick={() => toggleRead(n.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                        isRead
                          ? 'bg-[#1A1A1A] border-white/[0.05]'
                          : 'bg-[#1A1A1A] border-white/[0.12] shadow-sm'
                      }`}
                      style={!isRead ? { borderColor: `${brandColor}30`, boxShadow: `0 0 12px ${brandColor}08` } : undefined}
                    >
                      <div className="flex items-start gap-3">
                        {/* Category icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: cat.bg }}
                        >
                          <CatIcon size={16} style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: brandColor }} />
                            )}
                            <p className={`text-sm font-medium truncate ${isRead ? 'text-[#ccc]' : 'text-[#F5F5F0]'}`}>
                              {n.title}
                            </p>
                          </div>
                          <p className="text-xs text-[#888] mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                              style={{ background: cat.bg, color: cat.color }}
                            >
                              {cat.label}
                            </span>
                            <span className="text-[11px] text-[#555]">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
