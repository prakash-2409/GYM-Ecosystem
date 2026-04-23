'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useGymConfig } from '@/lib/gym-config-store';
import { DemoNav } from '@/components/DemoNav';

// ═══════════════════════════════════════════════════════════════
// KIOSK MOCK DATA — inline, purpose-built for this screen
// ═══════════════════════════════════════════════════════════════

type KioskMember = {
  id: string;
  name: string;
  age: number;
  weight: string;
  weightLoggedAgo: string;
  plan: string;
  planEnd: string;
  visitsThisMonth: number;
  totalVisits: number;
  streak: number;
  memberSince: string;
  memberSinceDuration: string;
  attendance: boolean[]; // 15 days
  feeStatus: 'paid' | 'due' | 'overdue';
  feeAmount?: number;
  accentColor: string;
  accentBorder: string;
  accentBg: string;
  visitCount: number; // for toggling check in / check out
};

const KIOSK_MEMBERS: Record<string, KioskMember> = {
  '1042': {
    id: '1042',
    name: 'Rahul Kumar',
    age: 24,
    weight: '68.5 kg',
    weightLoggedAgo: 'logged 3 days ago',
    plan: 'GOLD — 6 MONTHS',
    planEnd: '2026-03-12',
    visitsThisMonth: 10,
    totalVisits: 187,
    streak: 5,
    memberSince: 'Jun 2024',
    memberSinceDuration: '1 year 9 months',
    attendance: [true, true, false, true, true, true, false, false, true, true, true, false, true, true, false],
    feeStatus: 'paid',
    accentColor: '${config.primaryColor}',
    accentBorder: '2px solid ${config.primaryColor}',
    accentBg: 'rgba(var(--brand-color-rgb),0.2)',
    visitCount: 3,
  },
  '2031': {
    id: '2031',
    name: 'Priya Sharma',
    age: 27,
    weight: '64.8 kg',
    weightLoggedAgo: 'logged 1 week ago',
    plan: 'SILVER — MONTHLY',
    planEnd: '2026-03-03',
    visitsThisMonth: 6,
    totalVisits: 52,
    streak: 2,
    memberSince: 'Oct 2025',
    memberSinceDuration: '5 months',
    attendance: [true, false, true, false, true, true, false, false, false, true, false, false, true, false, false],
    feeStatus: 'due',
    feeAmount: 1500,
    accentColor: '#378ADD',
    accentBorder: '2px solid #378ADD',
    accentBg: 'rgba(55,138,221,0.2)',
    visitCount: 4,
  },
  '3105': {
    id: '3105',
    name: 'Arjun Verma',
    age: 31,
    weight: '82.3 kg',
    weightLoggedAgo: 'logged today',
    plan: 'PLATINUM — ANNUAL',
    planEnd: '2026-04-20',
    visitsThisMonth: 13,
    totalVisits: 412,
    streak: 8,
    memberSince: 'Jan 2023',
    memberSinceDuration: '3 years 3 months',
    attendance: [true, true, true, true, true, true, true, false, true, true, true, true, true, false, true],
    feeStatus: 'paid',
    accentColor: '#22C55E',
    accentBorder: '2px solid #22C55E',
    accentBg: 'rgba(34,197,94,0.2)',
    visitCount: 7,
  },
  '4088': {
    id: '4088',
    name: 'Sunita Rao',
    age: 35,
    weight: '71.2 kg',
    weightLoggedAgo: 'logged 5 days ago',
    plan: 'GOLD — 3 MONTHS',
    planEnd: '2026-02-28',
    visitsThisMonth: 3,
    totalVisits: 98,
    streak: 0,
    memberSince: 'Aug 2024',
    memberSinceDuration: '1 year 8 months',
    attendance: [false, false, true, false, false, false, true, false, false, false, false, true, false, false, false],
    feeStatus: 'overdue',
    feeAmount: 3600,
    accentColor: '#F59E0B',
    accentBorder: '2px solid #F59E0B',
    accentBg: 'rgba(245,158,11,0.2)',
    visitCount: 2,
  },
};

const QUOTES = [
  'The only bad workout is the one that didn\'t happen.',
  'Push yourself because no one else will do it for you.',
  'Your body can do it. It\'s your mind you need to convince.',
  'Sweat now. Shine later.',
  'No pain no gain. Shut up and train.',
];

const MAX_DIGITS = 6;
const AUTO_RESET_MS = 8000;

// ═══════════════════════════════════════════════════════════════
// KIOSK PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function KioskPage() {
  const { config } = useGymConfig();
  // ── state ──
  const [digits, setDigits] = useState<string[]>([]);
  const [kioskState, setKioskState] = useState<'idle' | 'member'>('idle');
  const [member, setMember] = useState<KioskMember | null>(null);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [clock, setClock] = useState({ time: '', date: '' });
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);
  const [memberCardVisible, setMemberCardVisible] = useState(false);
  const [idleCardVisible, setIdleCardVisible] = useState(true);
  const [resetProgress, setResetProgress] = useState(100);
  const [showContinueHint, setShowContinueHint] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(true);

  const resetTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── clock ──
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      setClock({
        time: `${h}:${m}`,
        date: `${days[now.getDay()]}  ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── quotes ──
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setQuoteIdx(prev => (prev + 1) % QUOTES.length);
        setQuoteFading(false);
      }, 400);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── helpers ──
  const daysRemaining = (endDate: string) => {
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
  };

  const attendancePercent = (visits: number) => {
    const daysInMonth = new Date().getDate();
    return Math.round((visits / daysInMonth) * 100);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  // ── reset ──
  const resetKiosk = useCallback(() => {
    // Slide member card out
    if (kioskState === 'member') {
      setMemberCardVisible(false);
      setTimeout(() => {
        setMember(null);
        setKioskState('idle');
        setDigits([]);
        setError(false);
        setErrorMsg(false);
        setResetProgress(100);
        setShowContinueHint(false);
        setIdleCardVisible(true);
      }, 350);
    } else {
      setMember(null);
      setKioskState('idle');
      setDigits([]);
      setError(false);
      setErrorMsg(false);
      setResetProgress(100);
      setShowContinueHint(false);
      setIdleCardVisible(true);
    }

    if (resetTimerRef.current) clearInterval(resetTimerRef.current);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
  }, [kioskState]);

  // ── auto reset countdown ──
  const startAutoReset = useCallback(() => {
    setResetProgress(100);
    setShowContinueHint(false);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_RESET_MS) * 100);
      setResetProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // trigger reset
        setMemberCardVisible(false);
        setTimeout(() => {
          setMember(null);
          setKioskState('idle');
          setDigits([]);
          setError(false);
          setErrorMsg(false);
          setResetProgress(100);
          setShowContinueHint(false);
          setIdleCardVisible(true);
        }, 350);
      }
    }, 50);
    resetTimerRef.current = interval;

    hintTimerRef.current = setTimeout(() => {
      setShowContinueHint(true);
    }, 6000);
  }, []);

  // ── check in ──
  const handleCheckIn = useCallback(() => {
    const code = digits.join('');
    if (!code) return;

    const found = KIOSK_MEMBERS[code];
    if (found) {
      setIdleCardVisible(false);
      const checkingIn = found.visitCount % 2 === 1;
      setIsCheckIn(checkingIn);

      setTimeout(() => {
        setMember(found);
        setKioskState('member');
        setTimeout(() => setMemberCardVisible(true), 50);
        startAutoReset();
      }, 300);
    } else {
      // Error
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setErrorMsg(true);

      errorTimerRef.current = setTimeout(() => {
        setError(false);
        setErrorMsg(false);
        setDigits([]);
      }, 2000);
    }
  }, [digits, startAutoReset]);

  // ── keyboard input ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If member is showing, any key resets
      if (kioskState === 'member') {
        e.preventDefault();
        resetKiosk();
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        setDigits(prev => prev.length >= MAX_DIGITS ? prev : [...prev, e.key]);
        setError(false);
        setErrorMsg(false);
      } else if (e.key === 'Backspace') {
        setDigits(prev => prev.slice(0, -1));
        setError(false);
        setErrorMsg(false);
      } else if (e.key === 'Enter') {
        handleCheckIn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [kioskState, handleCheckIn, resetKiosk]);

  // ── numpad tap ──
  const numpadTap = (key: string) => {
    if (kioskState === 'member') {
      resetKiosk();
      return;
    }

    if (key === '⌫') {
      setDigits(prev => prev.slice(0, -1));
      setError(false);
      setErrorMsg(false);
    } else if (key === 'CHECKIN') {
      handleCheckIn();
    } else {
      setDigits(prev => prev.length >= MAX_DIGITS ? prev : [...prev, key]);
      setError(false);
      setErrorMsg(false);
    }
  };

  const daysLeft = member ? daysRemaining(member.planEnd) : 0;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <>
      {/* ── GOOGLE FONT ── */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="kiosk-root">

        {/* ═══ BACKGROUND ═══ */}
        <div className="kiosk-bg">
          {/* Grid floor */}
          <div className="kiosk-bg-grid" />
          {/* Top glow */}
          <div className="kiosk-bg-glow" />
          {/* Floor strip */}
          <div className="kiosk-bg-floor" />
          {/* Left silhouette - barbell rack */}
          <svg className="kiosk-bg-rack" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Vertical posts */}
            <rect x="40" y="60" width="8" height="300" fill="rgba(255,255,255,0.04)" />
            <rect x="140" y="60" width="8" height="300" fill="rgba(255,255,255,0.04)" />
            {/* Horizontal bars */}
            <rect x="30" y="100" width="130" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
            <rect x="30" y="160" width="130" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
            <rect x="30" y="220" width="130" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
            <rect x="30" y="280" width="130" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
            {/* Weight plates */}
            <rect x="15" y="88" width="20" height="30" rx="4" fill="rgba(255,255,255,0.035)" />
            <rect x="155" y="88" width="20" height="30" rx="4" fill="rgba(255,255,255,0.035)" />
            <rect x="15" y="148" width="20" height="30" rx="4" fill="rgba(255,255,255,0.035)" />
            <rect x="155" y="148" width="20" height="30" rx="4" fill="rgba(255,255,255,0.035)" />
            <rect x="10" y="208" width="25" height="30" rx="4" fill="rgba(255,255,255,0.03)" />
            <rect x="155" y="208" width="25" height="30" rx="4" fill="rgba(255,255,255,0.03)" />
            {/* Base */}
            <rect x="20" y="360" width="150" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
          </svg>
          {/* Right silhouette - person lifting */}
          <svg className="kiosk-bg-lifter" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="100" cy="80" r="16" fill="rgba(255,255,255,0.05)" />
            {/* Torso */}
            <path d="M88 96 L80 200 L120 200 L112 96 Z" fill="rgba(255,255,255,0.04)" />
            {/* Arms holding barbell up */}
            <path d="M80 110 L40 70 L160 70 L120 110" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Barbell bar */}
            <rect x="20" y="64" width="160" height="5" rx="2.5" fill="rgba(255,255,255,0.05)" />
            {/* Barbell plates */}
            <rect x="8" y="50" width="18" height="34" rx="4" fill="rgba(255,255,255,0.04)" />
            <rect x="174" y="50" width="18" height="34" rx="4" fill="rgba(255,255,255,0.04)" />
            {/* Legs */}
            <path d="M86 200 L70 330 L85 330" fill="rgba(255,255,255,0.04)" />
            <path d="M114 200 L130 330 L115 330" fill="rgba(255,255,255,0.04)" />
            {/* Feet */}
            <rect x="62" y="328" width="30" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
            <rect x="108" y="328" width="30" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
          </svg>
          {/* Overlay */}
          <div className="kiosk-bg-overlay" />
        </div>

        {/* ═══ TOP ZONE ═══ */}
        <div className="kiosk-top">
          <div className="kiosk-top-left">
            <div className="kiosk-gym-name">{config.gymName.toUpperCase()}</div>
            <div className="kiosk-gym-tagline" style={{ color: config.primaryColor }}>{config.tagline}</div>
            <div className="kiosk-gym-line" style={{ background: config.primaryColor }} />
          </div>
          <div className="kiosk-top-center">
            <div className="kiosk-clock">{clock.time}</div>
            <div className="kiosk-date">{clock.date}</div>
          </div>
          <div className="kiosk-top-right">
            Powered by GymOS
          </div>
        </div>

        {/* ═══ MIDDLE ZONE ═══ */}
        <div className="kiosk-middle">

          {/* ── IDLE STATE ── */}
          {kioskState === 'idle' && (
            <div className={`kiosk-idle ${idleCardVisible ? 'kiosk-idle--visible' : 'kiosk-idle--hidden'}`}>
              <h1 className="kiosk-welcome">WELCOME</h1>
              <p className="kiosk-welcome-sub">Scan your ID or enter member number</p>

              <div className={`kiosk-input-card ${shaking ? 'kiosk-shake' : ''}`}>
                <div className="kiosk-input-label">MEMBER ID</div>
                <div className="kiosk-digit-slots">
                  {Array.from({ length: MAX_DIGITS }).map((_, i) => (
                    <div
                      key={i}
                      className={`kiosk-digit-slot ${i === digits.length ? 'kiosk-digit-slot--active' : ''
                        } ${error ? 'kiosk-digit-slot--error' : ''}`}
                    >
                      {digits[i] || <span className="kiosk-digit-empty">_</span>}
                    </div>
                  ))}
                </div>
                {digits.length > 0 && (
                  <div className="kiosk-enter-hint">
                    Press ENTER to check in
                  </div>
                )}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="kiosk-error-msg">
                  Member not found. Please check your ID.
                </div>
              )}

              {/* Numpad */}
              <div className="kiosk-numpad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'CHECKIN'].map(key => (
                  <button
                    key={key}
                    className={`kiosk-numpad-key ${key === 'CHECKIN' ? 'kiosk-numpad-key--checkin' : ''} ${key === '⌫' ? 'kiosk-numpad-key--back' : ''}`}
                    onClick={() => numpadTap(key)}
                  >
                    {key === 'CHECKIN' ? 'CHECK IN →' : key}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── MEMBER FOUND STATE ── */}
          {kioskState === 'member' && member && (
            <div
              className={`kiosk-member-card ${memberCardVisible ? 'kiosk-member-card--visible' : 'kiosk-member-card--hidden'}`}
              onClick={resetKiosk}
            >
              <div className="kiosk-member-inner">
                {/* Left column */}
                <div className="kiosk-member-left">
                  <div
                    className="kiosk-member-avatar"
                    style={{
                      background: member.accentBg,
                      border: member.accentBorder,
                    }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="kiosk-member-name">{member.name}</div>
                  <div className="kiosk-member-id">ID #{member.id}</div>
                  <div
                    className="kiosk-member-plan-badge"
                    style={{
                      color: member.accentColor,
                      background: member.accentBg,
                      border: `1px solid ${member.accentColor}30`,
                    }}
                  >
                    {member.plan}
                  </div>

                  {/* Check In / Out badge */}
                  <div className={`kiosk-check-badge ${isCheckIn ? 'kiosk-check-badge--in' : 'kiosk-check-badge--out'}`}>
                    <span className="kiosk-check-badge-ring" />
                    {isCheckIn ? '✓ CHECKED IN' : '→ CHECKED OUT'}
                  </div>
                </div>

                {/* Right column */}
                <div className="kiosk-member-right">
                  <div className="kiosk-info-grid">
                    {/* Card 1 — AGE */}
                    <div className="kiosk-info-card">
                      <div className="kiosk-info-label">AGE</div>
                      <div className="kiosk-info-value">{member.age} yrs</div>
                    </div>
                    {/* Card 2 — WEIGHT */}
                    <div className="kiosk-info-card">
                      <div className="kiosk-info-label">LAST WEIGHT</div>
                      <div className="kiosk-info-value">{member.weight}</div>
                      <div className="kiosk-info-sub">{member.weightLoggedAgo}</div>
                    </div>
                    {/* Card 3 — PLAN ENDS */}
                    <div className="kiosk-info-card">
                      <div className="kiosk-info-label">PLAN ENDS</div>
                      <div className="kiosk-info-value" style={{ fontSize: '18px' }}>
                        {new Date(member.planEnd).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                      <div className={`kiosk-info-sub ${daysLeft > 30 ? 'kiosk-info-sub--green' :
                          daysLeft >= 7 ? 'kiosk-info-sub--orange' :
                            'kiosk-info-sub--red'
                        }`}>
                        {daysLeft > 30 ? `${daysLeft} days left` :
                          daysLeft >= 7 ? `${daysLeft} days left ⚠` :
                            daysLeft > 0 ? `${daysLeft} days left — RENEW NOW` :
                              'EXPIRED — RENEW NOW'}
                      </div>
                    </div>
                    {/* Card 4 — THIS MONTH */}
                    <div className="kiosk-info-card">
                      <div className="kiosk-info-label">THIS MONTH</div>
                      <div className="kiosk-info-value">{member.visitsThisMonth} visits</div>
                      <div className="kiosk-info-sub">{attendancePercent(member.visitsThisMonth)}% attendance</div>
                    </div>
                    {/* Card 5 — TOTAL VISITS */}
                    <div className="kiosk-info-card">
                      <div className="kiosk-info-label">TOTAL VISITS</div>
                      <div className="kiosk-info-value kiosk-info-value--large">{member.totalVisits}</div>
                    </div>
                    {/* Card 6 — MEMBER SINCE */}
                    <div className="kiosk-info-card">
                      <div className="kiosk-info-label">MEMBER SINCE</div>
                      <div className="kiosk-info-value" style={{ fontSize: '18px' }}>{member.memberSince}</div>
                      <div className="kiosk-info-sub">{member.memberSinceDuration}</div>
                    </div>
                  </div>

                  {/* Fee warning */}
                  {(member.feeStatus === 'due' || member.feeStatus === 'overdue') && (
                    <div className="kiosk-fee-warning">
                      <div className="kiosk-fee-left">
                        <span className="kiosk-fee-icon">⚠</span>
                        <span className="kiosk-fee-label">
                          {member.feeStatus === 'overdue' ? 'OVERDUE FEE' : 'PENDING FEE'}
                        </span>
                      </div>
                      <div className="kiosk-fee-right">
                        ₹{member.feeAmount?.toLocaleString('en-IN')} {member.feeStatus === 'overdue' ? 'overdue' : 'due'} — Please collect at front desk
                      </div>
                    </div>
                  )}

                  {/* Attendance mini calendar */}
                  <div className="kiosk-attendance">
                    <div className="kiosk-attendance-label">
                      {new Date().toLocaleDateString('en-US', { month: 'long' }).toUpperCase()} ATTENDANCE
                    </div>
                    <div className="kiosk-attendance-circles">
                      {member.attendance.map((present, i) => {
                        const dayNum = i + 1;
                        const isToday = dayNum === new Date().getDate();
                        return (
                          <div
                            key={i}
                            className={`kiosk-att-circle ${isToday ? 'kiosk-att-circle--today' :
                                present ? 'kiosk-att-circle--present' :
                                  'kiosk-att-circle--absent'
                              }`}
                          >
                            {dayNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue hint */}
              {showContinueHint && (
                <div className="kiosk-continue-hint">
                  TAP OR PRESS ANY KEY TO CONTINUE
                </div>
              )}

              {/* Auto-reset progress bar */}
              <div className="kiosk-reset-bar-track">
                <div
                  className="kiosk-reset-bar-fill"
                  style={{ width: `${resetProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══ BOTTOM ZONE ═══ */}
        <div className="kiosk-bottom">
          <div className="kiosk-bottom-left">
            <div className="kiosk-stat-pill">TODAY  43 CHECK-INS</div>
            <div className="kiosk-stat-pill">ACTIVE MEMBERS  {config.memberCount}</div>
            <div className="kiosk-stat-pill">OPEN {config.openTime} – {config.closeTime}</div>
          </div>
          <div className="kiosk-bottom-center">
            <div className={`kiosk-quote ${quoteFading ? 'kiosk-quote--fading' : ''}`}>
              &ldquo;{QUOTES[quoteIdx]}&rdquo;
            </div>
          </div>
          <div className="kiosk-bottom-right" />
        </div>
      </div>

      {/* Demo Navigation */}
      <DemoNav />

      {/* ═══ STYLES ═══ */}
      <style jsx>{`
        /* ── Reset & Root ── */
        .kiosk-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          user-select: none;
          display: flex;
          flex-direction: column;
        }

        /* ── Background ── */
        .kiosk-bg {
          position: absolute;
          inset: 0;
          background: #0A0A0A;
          z-index: 0;
        }

        .kiosk-bg-grid {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(400px) rotateX(45deg);
          transform-origin: bottom center;
          opacity: 0.6;
        }

        .kiosk-bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 120%;
          height: 60%;
          background: radial-gradient(ellipse at center, rgba(var(--brand-color-rgb),0.08) 0%, transparent 70%);
        }

        .kiosk-bg-floor {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 8%;
          background: linear-gradient(to top, rgba(255,255,255,0.02) 0%, transparent 100%);
        }

        .kiosk-bg-rack {
          position: absolute;
          left: 2%;
          bottom: 10%;
          width: 12%;
          height: 50%;
          opacity: 0.7;
        }

        .kiosk-bg-lifter {
          position: absolute;
          right: 3%;
          bottom: 10%;
          width: 10%;
          height: 45%;
          opacity: 0.7;
        }

        .kiosk-bg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10,10,10,0.85);
        }

        /* ── Top Zone ── */
        .kiosk-top {
          position: relative;
          z-index: 2;
          flex: 0 0 20%;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 32px 48px 0;
        }

        .kiosk-top-left {
          display: flex;
          flex-direction: column;
        }

        .kiosk-gym-name {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 3px;
          font-stretch: condensed;
        }

        .kiosk-gym-tagline {
          font-size: 12px;
          color: ${config.primaryColor};
          letter-spacing: 2px;
          margin-top: 4px;
        }

        .kiosk-gym-line {
          width: 40px;
          height: 2px;
          background: ${config.primaryColor};
          margin-top: 12px;
        }

        .kiosk-top-center {
          text-align: center;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 28px;
        }

        .kiosk-clock {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          color: #FFFFFF;
          letter-spacing: 4px;
          line-height: 1;
        }

        .kiosk-date {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 4px;
          margin-top: 4px;
        }

        .kiosk-top-right {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1px;
        }

        /* ── Middle Zone ── */
        .kiosk-middle {
          position: relative;
          z-index: 2;
          flex: 0 0 55%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── IDLE ── */
        .kiosk-idle {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 300ms ease;
        }

        .kiosk-idle--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .kiosk-idle--hidden {
          opacity: 0;
          transform: translateY(-100%);
          pointer-events: none;
        }

        .kiosk-welcome {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 72px;
          color: #FFFFFF;
          letter-spacing: 8px;
          line-height: 1;
          margin: 0;
        }

        .kiosk-welcome-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1px;
          margin-top: 8px;
        }

        /* ── Input Card ── */
        .kiosk-input-card {
          margin-top: 32px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 32px 40px;
          width: 480px;
          max-width: 90vw;
        }

        .kiosk-input-label {
          font-size: 10px;
          color: ${config.primaryColor};
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .kiosk-digit-slots {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          justify-content: center;
        }

        .kiosk-digit-slot {
          width: 56px;
          height: 72px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          color: #FFFFFF;
          transition: all 150ms ease;
        }

        .kiosk-digit-slot--active {
          border-bottom: 3px solid ${config.primaryColor};
        }

        .kiosk-digit-slot--error {
          border-color: #EF4444 !important;
          animation: errorFlash 200ms ease 2;
        }

        .kiosk-digit-empty {
          color: rgba(255,255,255,0.15);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
        }

        .kiosk-enter-hint {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 16px;
        }

        .kiosk-error-msg {
          font-size: 13px;
          color: #EF4444;
          margin-top: 16px;
          text-align: center;
          animation: fadeSlideUp 200ms ease forwards;
        }

        /* ── Shake ── */
        .kiosk-shake {
          animation: shake 400ms ease;
        }

        /* ── Numpad ── */
        .kiosk-numpad {
          display: grid;
          grid-template-columns: repeat(3, 64px);
          gap: 8px;
          margin-top: 24px;
        }

        .kiosk-numpad-key {
          width: 64px;
          height: 56px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #FFFFFF;
          font-size: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 100ms ease;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .kiosk-numpad-key:hover {
          background: rgba(255,255,255,0.12);
        }

        .kiosk-numpad-key:active {
          transform: scale(0.95);
          background: rgba(255,255,255,0.18);
        }

        .kiosk-numpad-key--checkin {
          background: ${config.primaryColor};
          font-size: 13px;
          font-weight: 600;
        }

        .kiosk-numpad-key--checkin:hover {
          background: #C44D00;
        }

        .kiosk-numpad-key--back {
          font-size: 22px;
        }

        /* ── Member Card ── */
        .kiosk-member-card {
          width: 100%;
          max-width: 860px;
          padding: 0 24px;
          transition: all 350ms cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .kiosk-member-card--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .kiosk-member-card--hidden {
          opacity: 0;
          transform: translateY(60px);
        }

        .kiosk-member-inner {
          background: rgba(15,15,15,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px 40px;
          backdrop-filter: blur(20px);
          display: flex;
          gap: 36px;
        }

        /* ── Left Column ── */
        .kiosk-member-left {
          flex: 0 0 35%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-top: 8px;
        }

        .kiosk-member-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
        }

        .kiosk-member-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          color: #FFFFFF;
          line-height: 1;
          margin-top: 14px;
        }

        .kiosk-member-id {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
        }

        .kiosk-member-plan-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 999px;
          margin-top: 8px;
          letter-spacing: 0.5px;
        }

        /* ── Check Badge ── */
        .kiosk-check-badge {
          margin-top: 16px;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kiosk-check-badge--in {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          color: #22C55E;
        }

        .kiosk-check-badge--out {
          background: rgba(var(--brand-color-rgb),0.15);
          border: 1px solid rgba(var(--brand-color-rgb),0.3);
          color: ${config.primaryColor};
        }

        .kiosk-check-badge-ring {
          position: absolute;
          inset: -4px;
          border-radius: 14px;
          border: 2px solid currentColor;
          opacity: 0;
          animation: pulseRing 2s ease-out infinite;
        }

        /* ── Right Column ── */
        .kiosk-member-right {
          flex: 1;
          min-width: 0;
        }

        .kiosk-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .kiosk-info-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .kiosk-info-label {
          font-size: 10px;
          color: ${config.primaryColor};
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .kiosk-info-value {
          font-size: 22px;
          color: #FFFFFF;
          font-weight: 700;
          margin-top: 4px;
          line-height: 1.2;
        }

        .kiosk-info-value--large {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
        }

        .kiosk-info-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
        }

        .kiosk-info-sub--green { color: #22C55E; }
        .kiosk-info-sub--orange { color: #F59E0B; }
        .kiosk-info-sub--red { color: #EF4444; font-weight: 600; }

        /* ── Fee Warning ── */
        .kiosk-fee-warning {
          margin-top: 12px;
          background: rgba(var(--brand-color-rgb),0.12);
          border: 1px solid rgba(var(--brand-color-rgb),0.35);
          border-radius: 10px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kiosk-fee-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kiosk-fee-icon {
          font-size: 18px;
        }

        .kiosk-fee-label {
          font-size: 12px;
          font-weight: 700;
          color: ${config.primaryColor};
          letter-spacing: 1px;
        }

        .kiosk-fee-right {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }

        /* ── Attendance ── */
        .kiosk-attendance {
          margin-top: 14px;
        }

        .kiosk-attendance-label {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .kiosk-attendance-circles {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .kiosk-att-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
        }

        .kiosk-att-circle--present {
          background: rgba(34,197,94,0.25);
          border: 1px solid #22C55E;
          color: #22C55E;
        }

        .kiosk-att-circle--absent {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.25);
        }

        .kiosk-att-circle--today {
          background: ${config.primaryColor};
          color: #FFFFFF;
          font-weight: 700;
        }

        /* ── Continue hint ── */
        .kiosk-continue-hint {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          margin-top: 12px;
          animation: fadeSlideUp 200ms ease forwards;
        }

        /* ── Reset progress bar ── */
        .kiosk-reset-bar-track {
          height: 3px;
          background: rgba(255,255,255,0.05);
          border-radius: 0 0 20px 20px;
          margin-top: 2px;
          overflow: hidden;
        }

        .kiosk-reset-bar-fill {
          height: 100%;
          background: ${config.primaryColor};
          transition: width 50ms linear;
          border-radius: 3px;
        }

        /* ── Bottom Zone ── */
        .kiosk-bottom {
          position: relative;
          z-index: 2;
          flex: 0 0 25%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 48px 32px;
        }

        .kiosk-bottom-left {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .kiosk-stat-pill {
          background: rgba(255,255,255,0.05);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 10px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .kiosk-bottom-center {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          max-width: 500px;
        }

        .kiosk-quote {
          font-size: 12px;
          font-style: italic;
          color: rgba(255,255,255,0.25);
          transition: opacity 400ms ease;
          line-height: 1.6;
        }

        .kiosk-quote--fading {
          opacity: 0;
        }

        .kiosk-bottom-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .kiosk-demo-label {
          font-size: 8px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .kiosk-demo-btn {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 4px 14px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 150ms ease;
          cursor: pointer;
        }

        .kiosk-demo-btn:hover {
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.3);
        }

        /* ═══ KEYFRAMES ═══ */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          12.5% { transform: translateX(-8px); }
          25% { transform: translateX(8px); }
          37.5% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          62.5% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
          87.5% { transform: translateX(-3px); }
        }

        @keyframes pulseRing {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.15);
          }
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes errorFlash {
          0%, 100% { border-color: rgba(255,255,255,0.15); }
          50% { border-color: #EF4444; }
        }
      `}</style>
    </>
  );
}
