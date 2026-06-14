'use client';

import {
  ArrowDown, ArrowUp, Camera, Award, Zap,
  Ruler, Calendar, Clock, Flame, Trophy,
} from 'lucide-react';
import {
  MEMBER_APP_USER, MEMBER_APP_BODY_MEASUREMENTS,
  MEMBER_APP_PERSONAL_RECORDS, MEMBER_APP_WEEKLY_SUMMARY,
  MEMBER_APP_ACHIEVEMENTS,
} from '@/lib/mock-data';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

interface ProgressTabProps {
  brandColor: string;
}

export function ProgressTab({ brandColor }: ProgressTabProps) {
  const user = MEMBER_APP_USER;
  const measurements = MEMBER_APP_BODY_MEASUREMENTS;
  const personalRecords = MEMBER_APP_PERSONAL_RECORDS;
  const weeklySummary = MEMBER_APP_WEEKLY_SUMMARY;
  const achievements = MEMBER_APP_ACHIEVEMENTS;

  const weightData = user.weight.map((w, i) => ({
    month: MONTHS[i],
    weight: w,
    bodyFat: user.bodyFat[i],
  }));

  const startWeight = user.weight[0];
  const currentWeight = user.weight[user.weight.length - 1];
  const weightChange = startWeight - currentWeight;

  // Measurement changes
  const measurementItems = [
    { label: 'Chest', current: measurements.current.chest, prev: measurements.previous.chest },
    { label: 'Biceps', current: measurements.current.biceps, prev: measurements.previous.biceps },
    { label: 'Waist', current: measurements.current.waist, prev: measurements.previous.waist },
    { label: 'Thighs', current: measurements.current.thighs, prev: measurements.previous.thighs },
    { label: 'Shoulders', current: measurements.current.shoulders, prev: measurements.previous.shoulders },
    { label: 'Hips', current: measurements.current.hips, prev: measurements.previous.hips },
  ];

  const earnedBadges = achievements.filter((a) => a.earned);
  const inProgressBadges = achievements.filter((a) => !a.earned);

  return (
    <div className="member-tab-enter">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[#F5F5F0]">Progress</h1>
        <p className="text-sm text-[#888] mt-1">Your fitness journey</p>
      </div>

      {/* Progress Highlight */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4 border relative overflow-hidden"
          style={{ background: `${brandColor}08`, borderColor: `${brandColor}20` }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full pointer-events-none" style={{ background: `${brandColor}15` }} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${brandColor}18` }}>
              <Zap size={20} style={{ color: brandColor }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#F5F5F0]">
                You&apos;ve lost {weightChange} kg since joining! 🎯
              </p>
              <p className="text-[11px] text-[#888] mt-0.5">Keep pushing, you&apos;re doing amazing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary Card */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0]">This Week</h3>
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar size={15} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-[#F5F5F0]">
                  {weeklySummary.daysAttended}/{weeklySummary.totalDays}
                </p>
                <p className="text-[10px] text-[#888]">Days Attended</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Clock size={15} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-[#F5F5F0]">{weeklySummary.avgSessionDuration}</p>
                <p className="text-[10px] text-[#888]">Avg Session</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Flame size={15} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-[#F5F5F0]">
                  {weeklySummary.caloriesBurned.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-[#888]">Cal Burned</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Trophy size={15} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-[#F5F5F0]">
                  {weeklySummary.workoutsCompleted}/{weeklySummary.totalWorkouts}
                </p>
                <p className="text-[10px] text-[#888]">Workouts Done</p>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-xs text-[#888] text-center">{weeklySummary.highlightMessage}</p>
          </div>
        </div>
      </div>

      {/* Weight Summary */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
            <p className="text-xs text-[#888] uppercase tracking-wider">Current Weight</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums text-[#F5F5F0]">
              {currentWeight} <span className="text-sm text-[#888]">kg</span>
            </p>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
            <p className="text-xs text-[#888] uppercase tracking-wider">Lost</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown size={18} className="text-emerald-400" />
              <p className="text-2xl font-semibold tabular-nums text-emerald-400">
                {weightChange} <span className="text-sm">kg</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="px-5 mb-5">
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
          <h3 className="text-sm font-medium mb-4 text-[#F5F5F0]">Weight Trend (6 months)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={brandColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={brandColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#F5F5F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone" dataKey="weight" stroke={brandColor} strokeWidth={2.5}
                  fill="url(#weightGrad)" dot={{ fill: brandColor, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: brandColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Body Fat Chart */}
      <div className="px-5 mb-5">
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
          <h3 className="text-sm font-medium mb-4 text-[#F5F5F0]">Body Fat % Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#F5F5F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone" dataKey="bodyFat" stroke="#F59E0B" strokeWidth={2.5}
                  fill="url(#fatGrad)" dot={{ fill: '#F59E0B', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#F59E0B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#F5F5F0]">Body Measurements</h3>
          <span className="text-[10px] text-[#555]">
            Last: {new Date(measurements.current.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {measurementItems.map((m) => {
            const diff = m.current - m.prev;
            const isUp = diff > 0;
            const isDown = diff < 0;
            return (
              <div key={m.label} className="bg-[#1A1A1A] rounded-2xl p-3 border border-white/[0.07] text-center">
                <p className="text-[10px] text-[#888] uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-semibold mt-1 tabular-nums text-[#F5F5F0]">
                  {m.current}<span className="text-[10px] text-[#888]">&quot;</span>
                </p>
                {diff !== 0 && (
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {isUp ? <ArrowUp size={10} className="text-emerald-400" /> : <ArrowDown size={10} className="text-amber-400" />}
                    <span className={`text-[10px] tabular-nums ${isUp ? 'text-emerald-400' : isDown ? 'text-amber-400' : 'text-[#888]'}`}>
                      {Math.abs(diff).toFixed(1)}&quot;
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Photos Placeholder */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0]">Progress Photos</h3>
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.07] flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
            <Camera size={24} className="text-[#555]" />
          </div>
          <p className="text-sm font-medium text-[#F5F5F0]">Coming Soon</p>
          <p className="text-xs text-[#888] mt-1 max-w-[200px]">
            Track your visual transformation by uploading progress photos.
          </p>
          <button
            className="mt-3 px-4 py-2 rounded-xl text-xs font-medium text-white active:scale-[0.95] transition-transform"
            style={{ background: brandColor }}
          >
            Notify Me
          </button>
        </div>
      </div>

      {/* Personal Records */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0]">Personal Records</h3>
        <div className="space-y-2">
          {personalRecords.map((pr) => (
            <div key={pr.id} className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg flex-shrink-0">
                {pr.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F5F5F0]">{pr.exercise}</p>
                <p className="text-[11px] text-[#888]">
                  {new Date(pr.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums" style={{ color: brandColor }}>{pr.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0]">
          Achievements <span className="text-[#888]">({earnedBadges.length}/{achievements.length})</span>
        </h3>

        {/* Earned */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-3">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex-shrink-0 w-20 bg-[#1A1A1A] rounded-2xl p-3 border border-white/[0.07] text-center"
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <p className="text-[10px] font-medium text-[#F5F5F0] leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>

        {/* In Progress */}
        {inProgressBadges.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[#555] uppercase tracking-wider font-medium">In Progress</p>
            {inProgressBadges.map((badge) => (
              <div key={badge.id} className="bg-[#1A1A1A] rounded-2xl p-3 border border-white/[0.07] flex items-center gap-3">
                <div className="text-xl opacity-40 flex-shrink-0 w-8 text-center">{badge.icon}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#ccc]">{badge.name}</p>
                  <p className="text-[10px] text-[#888]">{badge.requirement}</p>
                  <div className="mt-1.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${badge.progress || 0}%`, background: brandColor }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-[#888] tabular-nums">{badge.progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Stats Grid */}
      <div className="px-5 mb-6">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0]">Current Measurements</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Body Fat', value: `${user.bodyFat[user.bodyFat.length - 1]}%`, color: '#F59E0B' },
            { label: 'BMI', value: (currentWeight / (1.75 ** 2)).toFixed(1), color: '#22D3EE' },
            { label: 'Goal Weight', value: `${currentWeight - 5} kg`, color: brandColor },
            { label: 'Visits/Month', value: String(user.thisMonthVisits), color: '#22C55E' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07] text-center">
              <p className="text-xs text-[#888]">{stat.label}</p>
              <p className="text-xl font-semibold mt-1 tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
