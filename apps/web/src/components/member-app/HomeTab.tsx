'use client';

import { useMemo } from 'react';
import {
  QrCode, Flame, Calendar, Trophy, Dumbbell,
  TrendingUp, Clock, ChevronRight, CheckCircle2,
  AlertTriangle, Megaphone, Utensils,
} from 'lucide-react';
import {
  MEMBER_APP_USER, MEMBER_APP_STATS, MEMBER_APP_ANNOUNCEMENTS,
  MOCK_MEMBER_PLANS,
} from '@/lib/mock-data';

interface HomeTabProps {
  onShowQR: () => void;
  brandColor: string;
}

export function HomeTab({ onShowQR, brandColor }: HomeTabProps) {
  const user = MEMBER_APP_USER;
  const stats = MEMBER_APP_STATS;
  const announcements = MEMBER_APP_ANNOUNCEMENTS;
  const myPlan = MOCK_MEMBER_PLANS[user.id];

  const daysRemaining = Math.max(0, Math.ceil((new Date(user.planEnd).getTime() - Date.now()) / 86400000));

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Dynamic month name
  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long' });
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();

  // Expiry urgency color
  const expiryColor = daysRemaining > 30 ? '#22C55E' : daysRemaining > 7 ? '#F59E0B' : '#EF4444';
  const expiryBg = daysRemaining > 30 ? 'rgba(34,197,94,0.12)' : daysRemaining > 7 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

  return (
    <div className="member-tab-enter">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#888] text-sm">{greeting} 👋</p>
            <h1 className="text-2xl font-semibold tracking-tight mt-0.5 text-[#F5F5F0]">{user.name}</h1>
          </div>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-lg"
            style={{ background: brandColor }}
          >
            {user.name[0]}
          </div>
        </div>

        {/* Check-in QR Button */}
        <button
          id="member-checkin-btn"
          onClick={onShowQR}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.97] transition-transform shadow-lg"
          style={{ background: brandColor, boxShadow: `0 10px 20px -5px ${brandColor}40` }}
        >
          <QrCode size={22} className="text-white" />
          <span className="text-white font-medium text-base">Check In with QR</span>
        </button>
      </div>

      {/* Today's Check-in Status */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border"
          style={{
            background: stats.checkedInToday ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
            borderColor: stats.checkedInToday ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: stats.checkedInToday ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
            }}
          >
            {stats.checkedInToday ? (
              <CheckCircle2 size={20} className="text-emerald-400" />
            ) : (
              <Clock size={20} className="text-amber-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#F5F5F0]">
              {stats.checkedInToday ? 'Checked in today' : 'Not checked in yet'}
            </p>
            <p className="text-[11px] text-[#888] mt-0.5">
              {stats.checkedInToday ? `Arrived at ${stats.checkInTime}` : 'Tap the QR button to check in'}
            </p>
          </div>
        </div>
      </div>

      {/* Coach Announcement (if any) */}
      {announcements.length > 0 && (
        <div className="px-5 mb-5">
          <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={14} className="text-amber-400" />
              <span className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">Announcement</span>
            </div>
            <p className="text-sm font-medium text-[#F5F5F0]">{announcements[0].title}</p>
            <p className="text-xs text-[#888] mt-1 leading-relaxed">{announcements[0].message}</p>
            <p className="text-[10px] text-[#555] mt-2">— {announcements[0].by}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1A1A1A] rounded-2xl p-4 text-center border border-white/[0.07] relative overflow-hidden">
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-orange-500/5 blur-lg rounded-full" />
            <Flame size={20} className="mx-auto mb-2 text-orange-400" />
            <p className="text-xl font-semibold tabular-nums text-[#F5F5F0]">{stats.streak}</p>
            <p className="text-[11px] text-[#888] mt-0.5">Day Streak</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 text-center border border-white/[0.07] relative overflow-hidden">
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-cyan-500/5 blur-lg rounded-full" />
            <Calendar size={20} className="mx-auto mb-2 text-cyan-400" />
            <p className="text-xl font-semibold tabular-nums text-[#F5F5F0]">{stats.thisMonthVisits}</p>
            <p className="text-[11px] text-[#888] mt-0.5">This Month</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 text-center border border-white/[0.07] relative overflow-hidden">
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-500/5 blur-lg rounded-full" />
            <Trophy size={20} className="mx-auto mb-2 text-amber-400" />
            <p className="text-xl font-semibold tabular-nums text-[#F5F5F0]">{stats.totalVisits}</p>
            <p className="text-[11px] text-[#888] mt-0.5">All Time</p>
          </div>
        </div>
      </div>

      {/* Membership Expiry Card */}
      <div className="px-5 mb-5">
        <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#888] text-xs uppercase tracking-wider">Current Plan</p>
              <p className="font-semibold text-base mt-0.5 text-[#F5F5F0]">{stats.plan}</p>
            </div>
            <div className="px-3 py-1.5 rounded-full border" style={{ background: expiryBg, borderColor: `${expiryColor}30` }}>
              <span className="text-xs font-medium" style={{ color: expiryColor }}>
                {daysRemaining > 30 ? 'Active' : daysRemaining > 7 ? 'Expiring Soon' : 'Urgent Renewal'}
              </span>
            </div>
          </div>

          {/* Circular countdown + details */}
          <div className="flex items-center gap-5">
            {/* Circular progress */}
            <div className="relative flex-shrink-0">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="36" cy="36" r="30"
                  fill="none"
                  stroke={expiryColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.min(daysRemaining, 180) / 180) * 188.5} 188.5`}
                  transform="rotate(-90 36 36)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums" style={{ color: expiryColor }}>{daysRemaining}</span>
                <span className="text-[9px] text-[#888]">days</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#888]">Renews</span>
                <span className="text-[#F5F5F0] font-medium tabular-nums">{stats.nextBillingDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#888]">Amount</span>
                <span className="text-[#F5F5F0] font-medium tabular-nums">₹{stats.planAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#888]">Consistency</span>
                <span className="font-medium tabular-nums" style={{ color: brandColor }}>{stats.consistencyScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Reminder (when < 14 days) */}
      {daysRemaining <= 14 && (
        <div className="px-5 mb-5">
          <div className="bg-red-500/8 rounded-2xl p-4 border border-red-500/15 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Renew Your Membership</p>
              <p className="text-xs text-[#888] mt-0.5">
                Your plan expires in {daysRemaining} days. Visit the gym to renew and keep your streak alive!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Attendance Grid */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#F5F5F0]">{currentMonth} Attendance</h2>
          <span className="text-xs tabular-nums font-medium" style={{ color: brandColor }}>
            {stats.monthlyAttendanceRate}%
          </span>
        </div>
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
          <div className="flex flex-wrap gap-[6px]">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const attended = user.attendanceDays.includes(day);
              const isToday = day === today;
              const isFuture = day > today;
              return (
                <div
                  key={day}
                  className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[11px] font-medium transition-all ${
                    isFuture
                      ? 'text-[#333]'
                      : attended
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : isToday
                      ? 'ring-1 text-[#F5F5F0]'
                      : 'bg-white/[0.04] text-[#555]'
                  }`}
                  style={isToday && !attended ? { outline: `1px solid ${brandColor}60`, backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* My Workout Plan */}
      {myPlan && (
        <div className="px-5 mb-5">
          <h2 className="text-base font-semibold mb-3 text-[#F5F5F0]">My Plan</h2>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
            <div className="flex items-start justify-between mb-3 border-b border-white/[0.05] pb-3">
              <div>
                <h3 className="font-semibold" style={{ color: brandColor }}>{myPlan.name}</h3>
                <p className="text-[11px] text-[#888] mt-0.5">
                  Assigned by Coach Suresh on {new Date(myPlan.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <span className="bg-white/[0.05] text-white text-[10px] px-2 py-1 rounded">
                {myPlan.goal}
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {myPlan.days.slice(0, 2).map((day: any, dIdx: number) => (
                <div key={dIdx} className="bg-[#0F0F0F] rounded-xl p-3 border border-white/[0.03]">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#555] mb-2">{day.name}</p>
                  {day.exercises.length > 0 ? day.exercises.map((ex: any, eIdx: number) => (
                    <div key={eIdx} className="flex justify-between items-center text-sm py-1 border-b border-white/[0.02] last:border-0">
                      <span className="text-gray-300 text-xs truncate mr-2">• {ex.exercise.name}</span>
                      <span className="text-[#888] text-[10px] whitespace-nowrap tabular-nums">{ex.sets} × {ex.reps}</span>
                    </div>
                  )) : (
                    <div className="text-xs text-gray-500 italic py-1">Rest Day</div>
                  )}
                </div>
              ))}
              {myPlan.days.length > 2 && (
                <button className="w-full text-center text-xs py-2 font-medium active:scale-[0.98] transition-transform" style={{ color: brandColor }}>
                  View all {myPlan.days.length} days
                </button>
              )}
            </div>

            {myPlan.diet && myPlan.diet.morning && (
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-[#F5F5F0]">
                  <Utensils size={14} className="text-emerald-400" /> Diet Plan
                </h4>
                <div className="space-y-2">
                  <div className="text-xs flex items-start">
                    <span className="text-[#888] w-20 flex-shrink-0">Morning:</span>
                    <span className="text-gray-300 flex-1 leading-relaxed">{myPlan.diet.morning}</span>
                  </div>
                  <div className="text-xs flex items-start">
                    <span className="text-[#888] w-20 flex-shrink-0">Post-W/O:</span>
                    <span className="text-gray-300 flex-1 leading-relaxed">{myPlan.diet.postWorkout}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-semibold mb-3 text-[#F5F5F0]">Quick Actions</h2>
        <div className="space-y-2">
          {[
            { icon: Dumbbell, label: "Today's Workout", sub: 'Chest & Triceps', color: brandColor, bg: `${brandColor}18` },
            { icon: TrendingUp, label: 'Log Body Stats', sub: 'Last logged: 3 days ago', color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
            { icon: Utensils, label: 'View Diet Plan', sub: 'Updated 2 days ago', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
            { icon: Clock, label: 'Book PT Session', sub: '2 sessions remaining', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] active:scale-[0.98] transition-transform text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: action.bg }}
                >
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F5F5F0]">{action.label}</p>
                  <p className="text-xs text-[#888]">{action.sub}</p>
                </div>
                <ChevronRight size={16} className="text-[#555]" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
