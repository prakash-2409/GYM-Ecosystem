'use client';

import { useAuth } from '@/providers/auth-provider';
import { useGym } from '@/providers/gym-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, Dumbbell,
  UtensilsCrossed, BarChart3, Bell, Settings, UserCog, Receipt,
  Menu, X, LogOut, Monitor,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gym_owner', 'receptionist', 'coach'] },
  { href: '/members', label: 'Members', icon: Users, roles: ['gym_owner', 'receptionist', 'coach'] },
  { href: '/check-ins', label: 'Check-ins', icon: CalendarCheck, roles: ['gym_owner', 'receptionist'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['gym_owner', 'receptionist'] },
  { href: '/plans', label: 'Plans', icon: Receipt, roles: ['gym_owner'] },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell, roles: ['gym_owner', 'coach'] },
  { href: '/diets', label: 'Diets', icon: UtensilsCrossed, roles: ['gym_owner', 'coach'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['gym_owner'] },
  { href: '/staff', label: 'Staff', icon: UserCog, roles: ['gym_owner'] },
  { href: '/notifications', label: 'Notifications', icon: Bell, roles: ['gym_owner', 'receptionist'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['gym_owner'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { branding } = useGym();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-page">
      {/* ─── Sidebar — 240px, #111111 bg ─────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-sidebar bg-sidebar',
          'transform transition-transform duration-normal lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo area — 56px height */}
        <div className="flex items-center gap-3 h-sidebar-logo px-4 border-b border-sidebar-border-bottom">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.name} className="h-8 w-8 rounded" />
          ) : (
            <div className="h-8 w-8 rounded-btn bg-primary flex items-center justify-center text-white font-medium text-caption">
              {branding?.name?.[0] || 'G'}
            </div>
          )}
          <span className="font-medium text-body truncate text-sidebar-text">{branding?.name || 'GymOS'}</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-sidebar-muted hover:text-sidebar-text transition-colors duration-normal"
            aria-label="Close sidebar"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-2">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'sidebar-nav-item',
                  isActive && 'active'
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/kiosk"
            target="_blank"
            className="sidebar-nav-item"
          >
            <Monitor size={18} strokeWidth={1.5} />
            Open Kiosk
          </Link>
        </nav>

        {/* Bottom section — avatar + name + logout */}
        <div className="p-3 border-t border-sidebar-border-bottom">
          <div className="flex items-center gap-3">
            <div className="avatar bg-sidebar-active-bg text-sidebar-text">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium truncate text-sidebar-text">{user?.name}</p>
              <p className="text-caption text-sidebar-muted capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="text-sidebar-muted hover:text-danger transition-colors duration-normal p-1"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-overlay z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Main content area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — 56px, sticky, white bg, border-bottom */}
        <header className="topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-colors duration-normal"
            aria-label="Open sidebar"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
          <div className="flex-1" />
          <span className="text-caption text-text-secondary font-mono">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </header>

        {/* Page content — 32px horizontal, 48px top padding */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-page-h pt-page-top pb-8">{children}</main>
      </div>
    </div>
  );
}
