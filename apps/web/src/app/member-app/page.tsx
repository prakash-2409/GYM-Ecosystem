'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Home, Bell, TrendingUp, User, QrCode, Flame,
  Calendar, ChevronRight, Dumbbell, Clock,
  CheckCircle2, Star, ArrowDown, Trophy,
  Share, Plus, Smartphone
} from 'lucide-react';
import { DemoNav } from '@/components/DemoNav';
import {
  MEMBER_APP_USER, MEMBER_APP_NOTIFICATIONS, MEMBER_APP_STATS, MOCK_MEMBER_PLANS
} from '@/lib/mock-data';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useGymConfig } from '@/lib/gym-config-store';

type Tab = 'home' | 'notifications' | 'progress' | 'profile';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export default function MemberAppPage() {
  const { config } = useGymConfig();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showQR, setShowQR] = useState(false);

  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [showIOSTutorial, setShowIOSTutorial] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('ServiceWorker registered with scope:', reg.scope))
        .catch((err) => console.error('ServiceWorker registration failed:', err));
    }

    // Check if running standalone (installed)
    const runningStandalone = 
      (window.navigator as any).standalone === true || 
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(runningStandalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // Intercept Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIOS) {
      setShowIOSTutorial(true);
    }
  };

  const user = MEMBER_APP_USER;
  const stats = MEMBER_APP_STATS;
  const notifications = MEMBER_APP_NOTIFICATIONS;
  const myPlan = MOCK_MEMBER_PLANS[user.id];

  const weightData = user.weight.map((w, i) => ({
    month: MONTHS[i],
    weight: w,
    bodyFat: user.bodyFat[i],
  }));

  const unreadCount = notifications.filter(n => !n.read).length;

  const daysRemaining = Math.max(0, Math.ceil((new Date(user.planEnd).getTime() - Date.now()) / 86400000));

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: '#0F0F0F',
        color: '#F5F5F0',
        maxWidth: '430px',
        margin: '0 auto',
      }}
    >
      {/* Main content — scrollable */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* ═══════ HOME TAB ═══════ */}
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="px-5 pt-14 pb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#888] text-sm">Good morning 👋</p>
                  <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{user.name}</h1>
                </div>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold text-white"
                  style={{ background: config.primaryColor }}
                >
                  {user.name[0]}
                </div>
              </div>

              {/* Check-in QR Button */}
              <button
                onClick={() => setShowQR(true)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.97] transition-transform shadow-lg"
                style={{ background: config.primaryColor, boxShadow: `0 10px 15px -3px ${config.primaryColor}33` }}
              >
                <QrCode size={22} className="text-white" />
                <span className="text-white font-medium text-base">Check In with QR</span>
              </button>
            </div>

            {/* PWA Install Banner */}
            {showInstallBanner && !isStandalone && (isInstallable || isIOS) && (
              <div className="px-5 mb-6 animate-fade-in">
                <div className="relative overflow-hidden bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border border-white/[0.08] rounded-2xl p-4 flex items-center gap-4">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 blur-xl rounded-full pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 text-violet-400">
                    <Smartphone size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Install GymOS App</h3>
                    <p className="text-[11px] text-[#888] mt-0.5">Add to your home screen for quick offline access.</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end z-10">
                    <button
                      onClick={handleInstallClick}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white active:scale-[0.95] transition-transform shadow-md"
                      style={{ background: config.primaryColor }}
                    >
                      Install
                    </button>
                    <button
                      onClick={() => setShowInstallBanner(false)}
                      className="text-[10px] text-[#555] hover:text-[#888] font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="px-5 mb-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1A1A1A] rounded-2xl p-4 text-center border border-white/[0.07]">
                  <Flame size={20} className="mx-auto mb-2 text-orange-400" />
                  <p className="text-xl font-semibold tabular-nums">{stats.streak}</p>
                  <p className="text-[11px] text-[#888] mt-0.5">Day Streak</p>
                </div>
                <div className="bg-[#1A1A1A] rounded-2xl p-4 text-center border border-white/[0.07]">
                  <Calendar size={20} className="mx-auto mb-2 text-cyan-400" />
                  <p className="text-xl font-semibold tabular-nums">{stats.thisMonthVisits}</p>
                  <p className="text-[11px] text-[#888] mt-0.5">This Month</p>
                </div>
                <div className="bg-[#1A1A1A] rounded-2xl p-4 text-center border border-white/[0.07]">
                  <Trophy size={20} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-xl font-semibold tabular-nums">{stats.totalVisits}</p>
                  <p className="text-[11px] text-[#888] mt-0.5">All Time</p>
                </div>
              </div>
            </div>

            {/* Plan card */}
            <div className="px-5 mb-6">
              <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/[0.07]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#888] text-xs uppercase tracking-wider">Current Plan</p>
                    <p className="font-semibold text-base mt-0.5">{stats.plan}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                    <span className="text-emerald-400 text-xs font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-[#888]">Days remaining</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">{daysRemaining}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${Math.min(100, (daysRemaining / 180) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#555] mt-2">Renews: {stats.nextBillingDate}</p>
              </div>
            </div>

            {/* Attendance this month */}
            <div className="px-5 mb-6">
              <h2 className="text-base font-semibold mb-3">April Attendance</h2>
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
                <div className="flex flex-wrap gap-[6px]">
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1;
                    const attended = user.attendanceDays.includes(day);
                    const isToday = day === 9;
                    const isFuture = day > 9;
                    return (
                      <div
                        key={day}
                        className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[11px] font-medium ${
                          isFuture
                            ? 'text-[#333]'
                            : attended
                            ? 'bg-emerald-500 text-white'
                            : isToday
                            ? 'bg-violet-500/20 text-[var(--brand-color)] ring-1 ring-violet-500/40'
                            : 'bg-white/[0.04] text-[#555]'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* My Plan */}
            {myPlan && (
              <div className="px-5 mb-6">
                <h2 className="text-base font-semibold mb-3">My Plan</h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
                  <div className="flex items-start justify-between mb-3 border-b border-white/[0.05] pb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--brand-color)]">{myPlan.name}</h3>
                      <p className="text-[11px] text-[#888] mt-0.5">Assigned by Coach Suresh on {new Date(myPlan.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
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
                             <span className="text-[#888] text-[10px] whitespace-nowrap">{ex.sets} × {ex.reps}</span>
                           </div>
                        )) : (
                          <div className="text-xs text-gray-500 italic py-1">Rest Day</div>
                        )}
                      </div>
                    ))}
                    {myPlan.days.length > 2 && (
                      <button className="w-full text-center text-xs text-[var(--brand-color)] py-2 font-medium active:scale-[0.98] transition-transform">
                        View all {myPlan.days.length} days
                      </button>
                    )}
                  </div>

                  {myPlan.diet && myPlan.diet.morning && (
                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                       <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Flame size={14} className="text-emerald-400" /> Diet Plan</h4>
                       <div className="space-y-2">
                         <div className="text-xs flex items-start"><span className="text-[#888] w-20 flex-shrink-0">Morning:</span><span className="text-gray-300 flex-1 leading-relaxed">{myPlan.diet.morning}</span></div>
                         <div className="text-xs flex items-start"><span className="text-[#888] w-20 flex-shrink-0">Post-W/O:</span><span className="text-gray-300 flex-1 leading-relaxed">{myPlan.diet.postWorkout}</span></div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="px-5 mb-6">
              <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { icon: Dumbbell, label: 'Today\'s Workout', sub: 'Chest & Triceps', color: 'text-[var(--brand-color)]', bg: 'bg-violet-500/10' },
                  { icon: TrendingUp, label: 'Log Body Stats', sub: 'Last logged: 3 days ago', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { icon: Clock, label: 'Book PT Session', sub: '2 sessions remaining', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] active:scale-[0.98] transition-transform text-left">
                      <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={action.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.label}</p>
                        <p className="text-xs text-[#888]">{action.sub}</p>
                      </div>
                      <ChevronRight size={16} className="text-[#555]" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ NOTIFICATIONS TAB ═══════ */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in">
            <div className="px-5 pt-14 pb-4">
              <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
              <p className="text-sm text-[#888] mt-1">{unreadCount} unread</p>
            </div>
            <div className="px-5 space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-colors ${
                    n.read
                      ? 'bg-[#1A1A1A] border-white/[0.05]'
                      : 'bg-[#1A1A1A] border-violet-500/20 shadow-sm shadow-violet-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-[#888] mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-[#555] mt-2">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ PROGRESS TAB ═══════ */}
        {activeTab === 'progress' && (
          <div className="animate-fade-in">
            <div className="px-5 pt-14 pb-4">
              <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
              <p className="text-sm text-[#888] mt-1">Your fitness journey</p>
            </div>

            {/* Weight summary */}
            <div className="px-5 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
                  <p className="text-xs text-[#888] uppercase tracking-wider">Current Weight</p>
                  <p className="text-2xl font-semibold mt-1 tabular-nums">{user.weight[user.weight.length - 1]} <span className="text-sm text-[#888]">kg</span></p>
                </div>
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
                  <p className="text-xs text-[#888] uppercase tracking-wider">Lost</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDown size={18} className="text-emerald-400" />
                    <p className="text-2xl font-semibold tabular-nums text-emerald-400">{user.weight[0] - user.weight[user.weight.length - 1]} <span className="text-sm">kg</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight chart */}
            <div className="px-5 mb-5">
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
                <h3 className="text-sm font-medium mb-4">Weight Trend (6 months)</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
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
                      <Area type="monotone" dataKey="weight" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#weightGrad)" dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8B5CF6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Body fat chart */}
            <div className="px-5 mb-5">
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
                <h3 className="text-sm font-medium mb-4">Body Fat % Trend</h3>
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
                      <Area type="monotone" dataKey="bodyFat" stroke="#F59E0B" strokeWidth={2.5} fill="url(#fatGrad)" dot={{ fill: '#F59E0B', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#F59E0B' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Current stats grid */}
            <div className="px-5 mb-5">
              <h3 className="text-sm font-medium mb-3">Current Measurements</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Body Fat', value: `${user.bodyFat[user.bodyFat.length - 1]}%`, color: 'text-amber-400' },
                  { label: 'BMI', value: (user.weight[user.weight.length - 1] / (1.75 ** 2)).toFixed(1), color: 'text-cyan-400' },
                  { label: 'Goal Weight', value: `${user.weight[user.weight.length - 1] - 5} kg`, color: 'text-[var(--brand-color)]' },
                  { label: 'Visits/Month', value: String(user.thisMonthVisits), color: 'text-emerald-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07] text-center">
                    <p className="text-xs text-[#888]">{stat.label}</p>
                    <p className={`text-xl font-semibold mt-1 tabular-nums ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ PROFILE TAB ═══════ */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <div className="px-5 pt-14 pb-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-[3px] mb-4">
                <div className="w-full h-full rounded-full bg-[#0F0F0F] flex items-center justify-center">
                  <span className="text-3xl font-semibold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                    {user.name[0]}
                  </span>
                </div>
              </div>
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-sm text-[#888] mt-0.5 font-mono">ID: {user.memberCode}</p>
            </div>

            {/* QR Code */}
            <div className="px-5 mb-5">
              <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/[0.07] text-center">
                <p className="text-xs text-[#888] uppercase tracking-wider mb-3">Your Check-in QR</p>
                {/* SVG QR Code placeholder */}
                <div className="w-44 h-44 mx-auto bg-white rounded-2xl p-3 mb-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* QR code pattern */}
                    <rect x="5" y="5" width="25" height="25" fill="black" rx="3" />
                    <rect x="8" y="8" width="19" height="19" fill="white" rx="2" />
                    <rect x="11" y="11" width="13" height="13" fill="black" rx="1" />
                    <rect x="70" y="5" width="25" height="25" fill="black" rx="3" />
                    <rect x="73" y="8" width="19" height="19" fill="white" rx="2" />
                    <rect x="76" y="11" width="13" height="13" fill="black" rx="1" />
                    <rect x="5" y="70" width="25" height="25" fill="black" rx="3" />
                    <rect x="8" y="73" width="19" height="19" fill="white" rx="2" />
                    <rect x="11" y="76" width="13" height="13" fill="black" rx="1" />
                    {/* Data pattern */}
                    {[35,40,45,50,55,60,65].map((x) =>
                      [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90].map((y) => (
                        (x + y) % 10 < 6 ? <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                      ))
                    )}
                    {[5,10,15,20,25,30].map((x) =>
                      [35,40,45,50,55,60,65].map((y) => (
                        (x * y) % 7 < 4 ? <rect key={`b-${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                      ))
                    )}
                    {[70,75,80,85,90].map((x) =>
                      [35,40,45,50,55,60,65,70,75,80,85,90].map((y) => (
                        (x + y) % 8 < 5 ? <rect key={`c-${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                      ))
                    )}
                  </svg>
                </div>
                <p className="text-xs text-[#555]">Show this at the kiosk to check in</p>
              </div>
            </div>

            {/* Personal info */}
            <div className="px-5 mb-5">
              <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.07] overflow-hidden">
                {[
                  { label: 'Phone', value: user.phone },
                  { label: 'Email', value: user.email },
                  { label: 'Gender', value: user.gender },
                  { label: 'Age', value: `${user.age} years` },
                  { label: 'Member Since', value: new Date(user.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between py-4 px-5 ${
                      idx < 4 ? 'border-b border-white/[0.05]' : ''
                    }`}
                  >
                    <span className="text-sm text-[#888]">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan info */}
            <div className="px-5 mb-5">
              <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.07] overflow-hidden">
                {[
                  { label: 'Plan', value: user.plan },
                  { label: 'Amount', value: `₹${user.planAmount.toLocaleString('en-IN')}` },
                  { label: 'Valid Till', value: new Date(user.planEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'Days Left', value: String(daysRemaining) },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between py-4 px-5 ${
                      idx < 3 ? 'border-b border-white/[0.05]' : ''
                    }`}
                  >
                    <span className="text-sm text-[#888]">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 mb-5 space-y-3">
              {!isStandalone && (isInstallable || isIOS) && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] text-sm font-medium text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Smartphone size={16} style={{ color: config.primaryColor }} />
                  Install App
                </button>
              )}
              <button className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] text-sm font-medium active:scale-[0.98] transition-transform">
                Edit Profile
              </button>
              <button className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] text-sm font-medium text-red-400 active:scale-[0.98] transition-transform">
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ QR MODAL ═══════ */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-[#1A1A1A] rounded-3xl p-6 w-full max-w-sm border border-white/[0.1] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">Check-in QR Code</h2>
              <p className="text-xs text-[#888] mt-1">Show this to the gym kiosk</p>
            </div>
            <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="5" y="5" width="25" height="25" fill="black" rx="3" />
                <rect x="8" y="8" width="19" height="19" fill="white" rx="2" />
                <rect x="11" y="11" width="13" height="13" fill="black" rx="1" />
                <rect x="70" y="5" width="25" height="25" fill="black" rx="3" />
                <rect x="73" y="8" width="19" height="19" fill="white" rx="2" />
                <rect x="76" y="11" width="13" height="13" fill="black" rx="1" />
                <rect x="5" y="70" width="25" height="25" fill="black" rx="3" />
                <rect x="8" y="73" width="19" height="19" fill="white" rx="2" />
                <rect x="11" y="76" width="13" height="13" fill="black" rx="1" />
                {[35,40,45,50,55,60,65].map((x) =>
                  [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90].map((y) => (
                    (x + y) % 10 < 6 ? <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                  ))
                )}
                {[5,10,15,20,25,30].map((x) =>
                  [35,40,45,50,55,60,65].map((y) => (
                    (x * y) % 7 < 4 ? <rect key={`b-${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                  ))
                )}
                {[70,75,80,85,90].map((x) =>
                  [35,40,45,50,55,60,65,70,75,80,85,90].map((y) => (
                    (x + y) % 8 < 5 ? <rect key={`c-${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                  ))
                )}
              </svg>
            </div>
            <p className="text-center text-sm font-mono text-[#888]">ID: {user.memberCode}</p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-sm font-medium active:scale-[0.98] transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* iOS INSTALL TUTORIAL MODAL */}
      {showIOSTutorial && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowIOSTutorial(false)}
        >
          <div
            className="bg-[#1A1A1A] w-full max-w-sm rounded-3xl border border-white/[0.1] p-6 pb-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-white">Install GymOS on iOS</h2>
              <p className="text-xs text-[#888] mt-1">Add this app to your home screen for the full app experience</p>
            </div>
            
            <div className="space-y-4 text-xs mb-6">
              <div className="flex items-start gap-3 bg-[#111] p-3.5 rounded-xl border border-white/[0.04]">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-violet-400">1</span>
                <p className="text-gray-300 leading-relaxed">
                  Tap the <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-0.5 rounded"><Share size={12} className="text-cyan-400" /> Share</span> button in Safari.
                </p>
              </div>
              
              <div className="flex items-start gap-3 bg-[#111] p-3.5 rounded-xl border border-white/[0.04]">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-violet-400">2</span>
                <p className="text-gray-300 leading-relaxed">
                  Scroll down the share menu and select <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-0.5 rounded"><Plus size={12} className="text-emerald-400" /> Add to Home Screen</span>.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-[#111] p-3.5 rounded-xl border border-white/[0.04]">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-violet-400">3</span>
                <p className="text-gray-300 leading-relaxed">
                  Tap <span className="font-semibold text-white">Add</span> in the top-right corner.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSTutorial(false)}
              className="w-full py-3 rounded-2xl text-xs font-semibold text-white transition-all active:scale-[0.98] shadow-lg"
              style={{ background: config.primaryColor }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ═══════ BOTTOM NAVIGATION ═══════ */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-[#111111] border-t border-white/[0.07]"
        style={{ maxWidth: '430px' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative active:scale-[0.95] ${
                  isActive ? 'text-[var(--brand-color)]' : 'text-[#555]'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-[1px] w-6 h-[3px] rounded-full bg-violet-400" />
                )}
                <div className="relative">
                  <Icon size={20} />
                  {tab.badge && tab.badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-white">{tab.badge}</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Safe area padding for notched phones */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
      {/* Demo Navigation */}
      <DemoNav />
    </div>
  );
}
