'use client';

import { Home, Bell, TrendingUp, User } from 'lucide-react';

export type Tab = 'home' | 'notifications' | 'progress' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadCount: number;
  brandColor: string;
}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'notifications', label: 'Alerts', icon: Bell },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
  { key: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange, unreadCount, brandColor }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-[#111111] border-t border-white/[0.07] z-40"
      style={{ maxWidth: '430px' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const showBadge = tab.key === 'notifications' && unreadCount > 0;
          return (
            <button
              key={tab.key}
              id={`member-nav-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 relative active:scale-[0.92] ${
                isActive ? '' : 'text-[#555]'
              }`}
              style={isActive ? { color: brandColor } : undefined}
            >
              {isActive && (
                <div
                  className="absolute -top-[1px] w-6 h-[3px] rounded-full transition-all duration-300"
                  style={{ backgroundColor: brandColor }}
                />
              )}
              <div className="relative">
                <Icon size={20} />
                {showBadge && (
                  <div className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 flex items-center justify-center px-0.5">
                    <span className="text-[9px] font-semibold text-white leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-[11px] transition-all duration-200 ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for notched phones */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
