'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGym } from '@/providers/gym-provider';
import apiClient from '@/lib/api-client';
import { db } from '@/lib/offline-db';
import type { CheckInResponse } from '@gymstack/shared';

const RESET_DELAY = 10000; // 10 seconds

type KioskState = 'idle' | 'loading' | 'success' | 'error';

export default function KioskPage() {
  const { branding } = useGym();
  const [memberCode, setMemberCode] = useState('');
  const [state, setState] = useState<KioskState>('idle');
  const [checkInData, setCheckInData] = useState<CheckInResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOnline, setIsOnline] = useState(true);
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
    if (val === 'C') {
      setMemberCode('');
    } else if (val === 'OK') {
      handleCheckIn();
    } else {
      setMemberCode((prev) => prev + val);
    }
  };

  return (
    <div className="kiosk-mode min-h-screen bg-gray-900 flex flex-col items-center justify-center relative select-none">
      {/* Online indicator */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        title={isOnline ? 'Online' : 'Offline'} />

      {/* Gym branding top */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt="" className="h-12 mx-auto mb-2" />
        ) : null}
        <h1 className="text-white text-xl font-bold">{branding?.name || 'GymStack'}</h1>
      </div>

      {state === 'idle' && (
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Enter Member ID</p>
          <div className="text-5xl font-mono text-white min-h-[64px] mb-8 tracking-widest">
            {memberCode || <span className="text-gray-600">GYM-0000</span>}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {['1','2','3','4','5','6','7','8','9','C','0','OK'].map((key) => (
              <button
                key={key}
                onClick={() => numpadPress(key)}
                className={`h-16 rounded-xl text-xl font-bold transition ${
                  key === 'OK'
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : key === 'C'
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <p className="text-gray-500 text-sm mt-6">Or type on keyboard and press Enter</p>
        </div>
      )}

      {state === 'loading' && (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Checking in...</p>
        </div>
      )}

      {state === 'success' && checkInData && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-in" onClick={resetKiosk}>
          {/* Member avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {checkInData.member.avatarUrl ? (
                <img src={checkInData.member.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                checkInData.member.name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{checkInData.member.name}</h2>
              <p className="text-gray-500 font-mono">{checkInData.member.memberCode}</p>
            </div>
            <div className="ml-auto text-green-600 font-bold text-lg">Checked In</div>
          </div>

          {/* Plan info */}
          {checkInData.subscription && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="font-medium">{checkInData.subscription.planName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Expires</span>
                <span className="font-medium">{new Date(checkInData.subscription.endDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Days Remaining</span>
                <span className="font-bold">{checkInData.subscription.daysRemaining}</span>
              </div>
              {/* Progress bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    checkInData.subscription.daysRemaining > 15
                      ? 'bg-green-500'
                      : checkInData.subscription.daysRemaining > 5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (checkInData.subscription.daysRemaining / 30) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{checkInData.totalVisits}</p>
              <p className="text-xs text-gray-500">Total Visits</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{checkInData.attendanceThisMonth.length}</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">
                {new Date(checkInData.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
              </p>
              <p className="text-xs text-gray-500">Joined</p>
            </div>
          </div>

          {/* Attendance calendar (current month) */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">This Month&apos;s Attendance</p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: new Date().getDate() }, (_, i) => {
                const day = i + 1;
                const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const attended = checkInData.attendanceThisMonth.includes(dateStr);
                return (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                      attended ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium text-center">
              Fee Payment Pending — Please remind at the desk
            </div>
          )}

          {/* Auto-dismiss hint */}
          <p className="text-center text-gray-400 text-xs mt-4">
            Auto-resetting in 10 seconds... Click anywhere to dismiss
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="text-center" onClick={resetKiosk}>
          <div className="text-red-500 text-6xl mb-4">X</div>
          <p className="text-white text-xl mb-2">{errorMsg}</p>
          <p className="text-gray-500">Click anywhere or press Escape to try again</p>
        </div>
      )}
    </div>
  );
}
