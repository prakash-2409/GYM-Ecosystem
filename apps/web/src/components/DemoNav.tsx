'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  match: (path: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Kiosk',
    href: '/kiosk',
    match: (p) => p.startsWith('/kiosk'),
  },
  {
    label: 'Admin',
    href: '/dashboard',
    match: (p) =>
      p.startsWith('/dashboard') ||
      p.startsWith('/members') ||
      p.startsWith('/fees') ||
      p.startsWith('/check-ins') ||
      p.startsWith('/payments') ||
      p.startsWith('/plans') ||
      p.startsWith('/workouts') ||
      p.startsWith('/diets') ||
      p.startsWith('/analytics') ||
      p.startsWith('/staff') ||
      p.startsWith('/notifications') ||
      p.startsWith('/settings') ||
      p.startsWith('/invoices'),
  },
  {
    label: 'Member App',
    href: '/member-app',
    match: (p) => p.startsWith('/member-app'),
  },
];

export function DemoNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeIdx = NAV_ITEMS.findIndex((item) => item.match(pathname));

  if (collapsed) {
    return (
      <div
        className="demo-nav-collapsed"
        onClick={() => setCollapsed(false)}
        title="GymOS Demo Navigator"
      >
        🎯
      </div>
    );
  }

  return (
    <div className="demo-nav">
      {/* Collapse button */}
      <button
        className="demo-nav-collapse-btn"
        onClick={() => setCollapsed(true)}
        aria-label="Collapse demo nav"
      >
        —
      </button>

      {/* DEMO label */}
      <span className="demo-nav-label">🎯 DEMO</span>

      {/* Navigation buttons */}
      {NAV_ITEMS.map((item, idx) => (
        <button
          key={item.label}
          className={`demo-nav-btn ${idx === activeIdx ? 'demo-nav-btn--active' : ''}`}
          onClick={() => router.push(item.href)}
        >
          {item.label}
        </button>
      ))}

      {/* Settings button */}
      <button
        className="demo-nav-settings"
        onClick={() => router.push('/dashboard/settings')}
        aria-label="Settings"
      >
        <Settings size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
