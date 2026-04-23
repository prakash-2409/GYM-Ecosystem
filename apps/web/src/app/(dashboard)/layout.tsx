'use client';

import { useAuth } from '@/providers/auth-provider';
import { useGymConfig } from '@/lib/gym-config-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, Dumbbell,
  UtensilsCrossed, BarChart3, Bell, Settings, UserCog, Receipt,
  Menu, X, LogOut, Monitor, IndianRupee, Smartphone,
} from 'lucide-react';
import { DemoNav } from '@/components/DemoNav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gym_owner', 'receptionist', 'coach'] },
  { href: '/members', label: 'Members', icon: Users, roles: ['gym_owner', 'receptionist', 'coach'] },
  { href: '/fees', label: 'Fees', icon: IndianRupee, roles: ['gym_owner', 'receptionist'] },
  { href: '/check-ins', label: 'Check-ins', icon: CalendarCheck, roles: ['gym_owner', 'receptionist'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['gym_owner', 'receptionist'] },
  { href: '/plans', label: 'Plans', icon: Receipt, roles: ['gym_owner'] },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell, roles: ['gym_owner', 'coach'] },
  { href: '/dashboard/plans/library', label: 'Scheduler', icon: CalendarCheck, roles: ['gym_owner', 'coach'] },
  { href: '/diets', label: 'Diets', icon: UtensilsCrossed, roles: ['gym_owner', 'coach'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['gym_owner'] },
  { href: '/staff', label: 'Staff', icon: UserCog, roles: ['gym_owner'] },
  { href: '/notifications', label: 'Notifications', icon: Bell, roles: ['gym_owner', 'receptionist'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['gym_owner'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { config } = useGymConfig();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-page">
      {/* Sidebar — dark #111111 */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] transform transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
          <div
            className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.logoInitials || config.gymName[0] || 'G'}
          </div>
          <span className="font-bold text-lg truncate text-white">{config.gymName || 'GymOS'}</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-400 hover:text-white transition-colors duration-150">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out relative',
                  isActive
                    ? 'bg-primary/15 text-primary border-r-2 border-primary'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/kiosk"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
          >
            <Monitor size={18} />
            Open Kiosk
          </Link>
          <Link
            href="/member-app"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
          >
            <Smartphone size={18} />
            Member App
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors duration-150" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors duration-150">
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-500 font-mono">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>

      {/* Demo Navigation */}
      <DemoNav />
    </div>
  );
}
