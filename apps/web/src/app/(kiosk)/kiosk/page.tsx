'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGym } from '@/providers/gym-provider';
import apiClient from '@/lib/api-client';
import { db } from '@/lib/offline-db';
import type { CheckInResponse } from '@gymstack/shared';
import { CheckCircle2, XCircle, Wifi, WifiOff, Fingerprint } from 'lucide-react';

const RESET_DELAY = 10000; // 10 seconds

type KioskState = 'idle' | 'loading' | 'success' | 'error';

export default function KioskPage() {
  const { branding } = useGym();
  const [memberCode, setMemberCode] = useState('');
  const [state, setState] = useState<KioskState>('idle');
  const [checkInData, setCheckInData] = useState<CheckInResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const resetKiosk = useCallback(() => {
    setMemberCode('');
    setState('idle');
    setCheckInData(null);
    setErrorMsg('');
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const startResetTimer = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(resetKiosk, RESET_DELAY);
  }, [resetKiosk]);

  const handleCheckIn = useCallback(async () => {
    if (!memberCode.trim()) return;
    setState('loading');

    try {
      if (isOnline) {
        const res = await apiClient.post('/checkins', { memberCode: memberCode.trim() });
        setCheckInData(res.data);
        setState('success');
      } else {
        // Offline mode — look up from IndexedDB
        const cached = await db.cachedMembers.where('memberCode').equals(memberCode.trim()).first();
        if (cached) {
          await db.offlineCheckIns.add({
            memberCode: memberCode.trim(),
            timestamp: new Date().toISOString(),
            synced: false,
          });
          setCheckInData({
            checkIn: { id: '', memberId: '', gymId: '', checkedInAt: new Date().toISOString(), source: 'kiosk', synced: false },
            member: { id: cached.id, memberCode: cached.memberCode, name: cached.name, avatarUrl: cached.avatarUrl, phone: '' },
            subscription: cached.planName ? {
              planName: cached.planName,
              startDate: '',
              endDate: cached.planExpiry || '',
              daysRemaining: cached.planExpiry ? Math.max(0, Math.ceil((new Date(cached.planExpiry).getTime() - Date.now()) / 86400000)) : 0,
              status: 'active',
            } : null,
            attendanceThisMonth: [],
            totalVisits: 0,
            feesDue: cached.feesDue,
            joinedAt: cached.joinedAt,
          });
          setState('success');
        } else {
          setState('error');
          setErrorMsg('Member not found (offline mode)');
        }
      }
    } catch {
      setState('error');
      setErrorMsg('Member not found or already checked in');
    }

    startResetTimer();
  }, [memberCode, isOnline, startResetTimer]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'idle') {
        if (e.key === 'Escape') resetKiosk();
        return;
      }
      if (e.key === 'Enter') {
        handleCheckIn();
      } else if (e.key === 'Backspace') {
        setMemberCode((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z0-9-]$/.test(e.key)) {
        setMemberCode((prev) => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleCheckIn, resetKiosk]);

  // Sync offline check-ins when coming back online
  useEffect(() => {
    if (!isOnline) return;
    (async () => {
      const pending = await db.offlineCheckIns.where('synced').equals(0).toArray();
      if (pending.length === 0) return;
      try {
        await apiClient.post('/checkins/sync', {
          checkIns: pending.map((c) => ({ memberCode: c.memberCode, timestamp: c.timestamp })),
        });
        await db.offlineCheckIns.where('synced').equals(0).modify({ synced: true });
      } catch { /* retry later */ }
    })();
  }, [isOnline]);

  const numpadPress = (val: string) => {
    setPressedKey(val);
    setTimeout(() => setPressedKey(null), 150);

    if (val === 'C') {
      setMemberCode('');
    } else if (val === 'OK') {
      handleCheckIn();
    } else {
      setMemberCode((prev) => prev + val);
    }
  };

  return (
    <div className="kiosk-mode min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative select-none overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-cyan-950/30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Online indicator */}
      <div className={`absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md ${
        isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        <span className="text-xs font-medium">{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* Gym branding top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt="" className="h-14 mx-auto mb-3 drop-shadow-2xl" />
        ) : (
          <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
        )}
        <h1 className="text-white text-2xl font-bold tracking-tight">{branding?.name || 'GymStack'}</h1>
        <p className="text-white/40 text-sm mt-1">Member Check-in</p>
      </div>

      {state === 'idle' && (
        <div className="text-center relative z-10">
          {/* Glowing input display */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-6">
              <p className="text-white/50 text-sm font-medium mb-2 uppercase tracking-widest">Enter Member Code</p>
              <div className="text-5xl font-mono font-bold tracking-[0.3em] min-h-[64px] flex items-center justify-center">
                {memberCode ? (
                  <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {memberCode}
                  </span>
                ) : (
                  <span className="text-white/20">GYM-0000</span>
                )}
              </div>
            </div>
          </div>

          {/* Premium Numpad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {['1','2','3','4','5','6','7','8','9','C','0','OK'].map((key) => {
              const isOK = key === 'OK';
              const isClear = key === 'C';
              const isPressed = pressedKey === key;

              return (
                <button
                  key={key}
                  onClick={() => numpadPress(key)}
                  className={`
                    relative h-16 rounded-xl text-xl font-bold transition-all duration-150 overflow-hidden
                    ${isPressed ? 'scale-95' : 'scale-100'}
                    ${isOK
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-emerald-500'
                      : isClear
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-400 hover:to-red-500'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/10 hover:bg-white/20 hover:border-white/20'
                    }
                  `}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity ${
                    isOK ? 'bg-emerald-400/20' : isClear ? 'bg-red-400/20' : 'bg-white/10'
                  }`} />
                  <span className="relative z-10">{key}</span>
                </button>
              );
            })}
          </div>

          <p className="text-white/30 text-sm mt-8 flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">Enter</span>
            <span>to confirm</span>
          </p>
        </div>
      )}

      {state === 'loading' && (
        <div className="text-center relative z-10">
          {/* Premium loading spinner */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-cyan-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-violet-400 border-l-cyan-400 animate-spin animation-delay-150" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white text-xl font-medium">Checking in...</p>
          <p className="text-white/40 text-sm mt-2">Please wait</p>
        </div>
      )}

      {state === 'success' && checkInData && (
        <div className="relative z-10 w-full max-w-lg mx-4" onClick={resetKiosk}>
          {/* Success celebration background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl animate-pulse" />

          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Success header with checkmark */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-50 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Member info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-0.5">
                <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                  {checkInData.member.avatarUrl ? (
                    <img src={checkInData.member.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                      {checkInData.member.name[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{checkInData.member.name}</h2>
              <p className="text-white/50 font-mono text-sm">{checkInData.member.memberCode}</p>
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold text-sm">Checked In</span>
              </div>
            </div>

            {/* Plan info */}
            {checkInData.subscription && (
              <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/50 text-sm">Plan</span>
                  <span className="text-white font-semibold">{checkInData.subscription.planName}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/50 text-sm">Days Remaining</span>
                  <span className={`font-bold text-lg ${
                    checkInData.subscription.daysRemaining > 15 ? 'text-emerald-400' :
                    checkInData.subscription.daysRemaining > 5 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {checkInData.subscription.daysRemaining}
                  </span>
                </div>
                {/* Premium progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      checkInData.subscription.daysRemaining > 15
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : checkInData.subscription.daysRemaining > 5
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    style={{ width: `${Math.min(100, (checkInData.subscription.daysRemaining / 30) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                <p className="text-2xl font-bold text-violet-400">{checkInData.totalVisits}</p>
                <p className="text-white/40 text-xs mt-1">Total Visits</p>
              </div>
              <div className="text-center p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <p className="text-2xl font-bold text-cyan-400">{checkInData.attendanceThisMonth.length}</p>
                <p className="text-white/40 text-xs mt-1">This Month</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xl font-bold text-white/80">
                  {new Date(checkInData.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                </p>
                <p className="text-white/40 text-xs mt-1">Member Since</p>
              </div>
            </div>

            {/* Attendance dots */}
            <div className="mb-4">
              <p className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">This Month</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: new Date().getDate() }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const attended = checkInData.attendanceThisMonth.includes(dateStr);
                  return (
                    <div
                      key={day}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        attended
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                          : 'bg-white/5 text-white/30 border border-white/5'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee due warning */}
            {checkInData.feesDue > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl font-medium text-center">
                <p className="font-semibold">Payment Pending</p>
                <p className="text-sm text-red-400/70 mt-1">Please visit reception to clear dues</p>
              </div>
            )}

            {/* Auto-dismiss */}
            <p className="text-center text-white/30 text-xs mt-6">
              Tap anywhere to dismiss
            </p>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="text-center relative z-10" onClick={resetKiosk}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Check-in Failed</h2>
          <p className="text-white/60 text-lg mb-6">{errorMsg}</p>
          <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all">
            Try Again
          </button>
        </div>
      )}

      {/* Keyboard shortcut hint at bottom */}
      {state === 'idle' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 text-xs">
          Press <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Esc</span> to reset
        </div>
      )}
    </div>
  );
}
