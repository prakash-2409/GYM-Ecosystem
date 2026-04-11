'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { lookupMemberByCode, type MockMember } from '@/lib/mock-data';
import { CheckCircle2, XCircle, AlertTriangle, Fingerprint, Keyboard } from 'lucide-react';

const RESET_DELAY = 8000;

type KioskState = 'idle' | 'loading' | 'success' | 'error' | 'warning';

export default function KioskPage() {
  const [memberCode, setMemberCode] = useState('');
  const [state, setState] = useState<KioskState>('idle');
  const [member, setMember] = useState<MockMember | null>(null);
  const [errorShake, setErrorShake] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [showTime, setShowTime] = useState('');
  const resetTimer = useRef<NodeJS.Timeout | null>(null);
  const loadingTimer = useRef<NodeJS.Timeout | null>(null);

  // Live clock
  useEffect(() => {
    const tick = () => {
      setShowTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetKiosk = useCallback(() => {
    setMemberCode('');
    setState('idle');
    setMember(null);
    setErrorShake(false);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
  }, []);

  const startResetTimer = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(resetKiosk, RESET_DELAY);
  }, [resetKiosk]);

  const handleCheckIn = useCallback(() => {
    const code = memberCode.trim();
    if (!code) return;

    setState('loading');

    // Simulate 800ms network delay for realism
    loadingTimer.current = setTimeout(() => {
      const found = lookupMemberByCode(code);

      if (found) {
        setMember(found);
        if (found.feesDue > 0) {
          setState('warning');
        } else {
          setState('success');
        }
      } else {
        setState('error');
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 600);
      }
      startResetTimer();
    }, 800);
  }, [memberCode, startResetTimer]);

  // Keyboard input
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
      } else if (/^[0-9]$/.test(e.key)) {
        setMemberCode((prev) => {
          if (prev.length >= 8) return prev;
          return prev + e.key;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleCheckIn, resetKiosk]);

  const numpadPress = (val: string) => {
    if (state !== 'idle') return;
    setPressedKey(val);
    setTimeout(() => setPressedKey(null), 150);

    if (val === 'C') {
      setMemberCode('');
    } else if (val === '⌫') {
      setMemberCode((prev) => prev.slice(0, -1));
    } else if (val === 'OK') {
      handleCheckIn();
    } else {
      setMemberCode((prev) => {
        if (prev.length >= 8) return prev;
        return prev + val;
      });
    }
  };

  const daysRemaining = (endDate: string) => {
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
  };

  return (
    <div className="kiosk-mode min-h-screen bg-[#050508] flex flex-col items-center justify-center relative select-none overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-cyan-950/20" />
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-violet-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/[0.07] rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Top bar — clock + branding */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/90 text-sm font-medium tracking-tight">Iron Paradise Gym</p>
            <p className="text-white/30 text-[11px]">Member Check-in</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-sm font-mono tracking-widest">{showTime}</p>
          <p className="text-white/25 text-[11px] mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* ═══════ IDLE STATE ═══════ */}
      {state === 'idle' && (
        <div className="text-center relative z-10 w-full max-w-md px-6 animate-fade-in">
          {/* Input display */}
          <div className="relative mb-10">
            <div className="absolute -inset-3 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-6 py-7">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Keyboard size={14} className="text-white/30" />
                <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">Enter Member ID</p>
              </div>
              <div className="text-5xl font-mono font-medium tracking-[0.4em] min-h-[72px] flex items-center justify-center">
                {memberCode ? (
                  <span className="bg-gradient-to-r from-violet-300 via-violet-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                    {memberCode}
                  </span>
                ) : (
                  <span className="text-white/[0.12]">• • • •</span>
                )}
              </div>
              {/* Cursor line */}
              <div className="flex justify-center mt-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((key) => {
              const isOK = key === 'OK';
              const isClear = key === 'C';
              const isPressed = pressedKey === key;

              return (
                <button
                  key={key}
                  onClick={() => numpadPress(key)}
                  className={`
                    relative h-[60px] rounded-2xl text-lg font-medium transition-all duration-150
                    ${isPressed ? 'scale-[0.92] brightness-125' : 'scale-100'}
                    ${isOK
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:shadow-emerald-500/40'
                      : isClear
                      ? 'bg-white/[0.04] text-red-400 border border-red-500/20 active:bg-red-500/10'
                      : 'bg-white/[0.05] text-white/80 border border-white/[0.06] active:bg-white/10'
                    }
                  `}
                >
                  <span className="relative z-10">{key}</span>
                </button>
              );
            })}
          </div>

          {/* Backspace row */}
          <button
            onClick={() => numpadPress('⌫')}
            className="mt-2.5 w-full max-w-[280px] mx-auto h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-sm font-medium transition-all active:bg-white/[0.06] flex items-center justify-center gap-2"
          >
            ⌫ Backspace
          </button>

          <p className="text-white/15 text-xs mt-8">
            Type on keyboard or use numpad  •  <span className="font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">Esc</span> to reset
          </p>
        </div>
      )}

      {/* ═══════ LOADING STATE ═══════ */}
      {state === 'loading' && (
        <div className="text-center relative z-10 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-[3px] border-white/[0.08]" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-violet-400 border-r-cyan-400 animate-spin" />
            <div className="absolute inset-[6px] rounded-full border-[3px] border-transparent border-b-violet-300/60 border-l-cyan-300/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-white/40" />
            </div>
          </div>
          <p className="text-white/90 text-lg font-medium">Verifying...</p>
          <p className="text-white/30 text-sm mt-1 font-mono">ID: {memberCode}</p>
        </div>
      )}

      {/* ═══════ SUCCESS STATE — No Fee Due ═══════ */}
      {state === 'success' && member && (
        <div className="relative z-10 w-full max-w-lg mx-4 animate-scale-in" onClick={resetKiosk}>
          <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-[32px] blur-3xl" />

          <div className="relative bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-[28px] p-8 shadow-2xl">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Member info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-[3px]">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                  <span className="text-3xl font-medium bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                    {member.name[0]}
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-medium text-white tracking-tight">{member.name}</h2>
              <p className="text-white/40 font-mono text-sm mt-1">ID: {member.memberCode}</p>
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium text-sm">Checked In Successfully</span>
              </div>
            </div>

            {/* Plan info */}
            <div className="bg-white/[0.04] rounded-2xl p-5 mb-5 border border-white/[0.06]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/40 text-sm">Plan</span>
                <span className="text-white font-medium">{member.plan}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/40 text-sm">Days Remaining</span>
                <span className={`font-medium text-lg ${
                  daysRemaining(member.planEnd) > 30 ? 'text-emerald-400' :
                  daysRemaining(member.planEnd) > 7 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {daysRemaining(member.planEnd)}
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, (daysRemaining(member.planEnd) / 180) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-violet-500/[0.08] rounded-xl border border-violet-500/[0.12]">
                <p className="text-xl font-medium text-violet-400 font-mono">{member.totalVisits}</p>
                <p className="text-white/30 text-[11px] mt-1">Total Visits</p>
              </div>
              <div className="text-center p-3 bg-cyan-500/[0.08] rounded-xl border border-cyan-500/[0.12]">
                <p className="text-xl font-medium text-cyan-400 font-mono">{member.thisMonthVisits}</p>
                <p className="text-white/30 text-[11px] mt-1">This Month</p>
              </div>
              <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-lg font-medium text-white/70">
                  {new Date(member.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                </p>
                <p className="text-white/30 text-[11px] mt-1">Since</p>
              </div>
            </div>

            <p className="text-center text-white/20 text-xs mt-6">Tap anywhere to dismiss  •  Auto-resets in 8s</p>
          </div>
        </div>
      )}

      {/* ═══════ WARNING STATE — Fee Due ═══════ */}
      {state === 'warning' && member && (
        <div className="relative z-10 w-full max-w-lg mx-4 animate-scale-in" onClick={resetKiosk}>
          <div className="absolute -inset-6 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-[32px] blur-3xl" />

          <div className="relative bg-white/[0.06] backdrop-blur-2xl border border-amber-500/20 rounded-[28px] p-8 shadow-2xl">
            {/* Warning icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Member info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-[3px]">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                  <span className="text-3xl font-medium bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                    {member.name[0]}
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-medium text-white tracking-tight">{member.name}</h2>
              <p className="text-white/40 font-mono text-sm mt-1">ID: {member.memberCode}</p>
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium text-sm">Checked In</span>
              </div>
            </div>

            {/* Fee due warning */}
            <div className="bg-red-500/[0.08] border border-red-500/20 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 font-medium">Payment Due</span>
              </div>
              <p className="text-2xl font-medium text-red-300 font-mono">₹{member.feesDue.toLocaleString('en-IN')}</p>
              <p className="text-red-400/60 text-sm mt-1">Please visit reception to clear dues</p>
            </div>

            {/* Plan info */}
            <div className="bg-white/[0.04] rounded-2xl p-5 mb-5 border border-white/[0.06]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/40 text-sm">Plan</span>
                <span className="text-white font-medium">{member.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-sm">Days Remaining</span>
                <span className="font-medium text-lg text-amber-400">
                  {daysRemaining(member.planEnd)}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-xl font-medium text-white/70 font-mono">{member.totalVisits}</p>
                <p className="text-white/30 text-[11px] mt-1">Total Visits</p>
              </div>
              <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-xl font-medium text-white/70 font-mono">{member.thisMonthVisits}</p>
                <p className="text-white/30 text-[11px] mt-1">This Month</p>
              </div>
            </div>

            <p className="text-center text-white/20 text-xs mt-6">Tap anywhere to dismiss  •  Auto-resets in 8s</p>
          </div>
        </div>
      )}

      {/* ═══════ ERROR STATE ═══════ */}
      {state === 'error' && (
        <div
          className={`text-center relative z-10 ${errorShake ? 'animate-shake' : ''}`}
          onClick={resetKiosk}
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/30">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-white text-2xl font-medium mb-2">Member Not Found</h2>
          <p className="text-white/50 text-base mb-2 font-mono">ID: {memberCode}</p>
          <p className="text-white/30 text-sm mb-8">Please check the ID and try again</p>
          <button
            onClick={(e) => { e.stopPropagation(); resetKiosk(); }}
            className="px-8 py-3 bg-white/[0.06] backdrop-blur-sm border border-white/[0.12] rounded-xl text-white font-medium hover:bg-white/10 transition-all active:scale-[0.97]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bottom branding */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/[0.08] text-[11px] font-medium tracking-[0.15em] uppercase">
        Powered by GymOS
      </div>

      {/* Inline shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
