'use client';

import { useState, useEffect, useCallback } from 'react';
import { DemoNav } from '@/components/DemoNav';
import { useGymConfig } from '@/lib/gym-config-store';
import { MEMBER_APP_NOTIFICATIONS } from '@/lib/mock-data';

// Member App Components
import { BottomNav, type Tab } from '@/components/member-app/BottomNav';
import { QRModal } from '@/components/member-app/QRModal';
import { PWAInstallBanner } from '@/components/member-app/PWAInstallBanner';
import { PullToRefresh } from '@/components/member-app/PullToRefresh';
import { HomeTab } from '@/components/member-app/HomeTab';
import { NotificationsTab } from '@/components/member-app/NotificationsTab';
import { ProgressTab } from '@/components/member-app/ProgressTab';
import { ProfileTab } from '@/components/member-app/ProfileTab';

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

  const handleRefresh = useCallback(async () => {
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, []);

  const unreadCount = MEMBER_APP_NOTIFICATIONS.filter((n) => !n.read).length;

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
      {/* Pull-to-refresh wrapper with scrollable content */}
      <PullToRefresh onRefresh={handleRefresh} brandColor={config.primaryColor}>
        {/* PWA Install Banner — only on home tab */}
        {activeTab === 'home' && (
          <PWAInstallBanner
            isInstallable={isInstallable}
            isStandalone={isStandalone}
            isIOS={isIOS}
            showBanner={showInstallBanner}
            showIOSTutorial={showIOSTutorial}
            brandColor={config.primaryColor}
            onInstallClick={handleInstallClick}
            onDismiss={() => setShowInstallBanner(false)}
            onCloseTutorial={() => setShowIOSTutorial(false)}
          />
        )}

        {/* ═══════ TAB CONTENT ═══════ */}
        {activeTab === 'home' && (
          <HomeTab
            onShowQR={() => setShowQR(true)}
            brandColor={config.primaryColor}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab brandColor={config.primaryColor} />
        )}

        {activeTab === 'progress' && (
          <ProgressTab brandColor={config.primaryColor} />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            brandColor={config.primaryColor}
            isStandalone={isStandalone}
            isInstallable={isInstallable}
            isIOS={isIOS}
            onInstallClick={handleInstallClick}
          />
        )}
      </PullToRefresh>

      {/* ═══════ QR MODAL ═══════ */}
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        memberCode="1042"
      />

      {/* iOS Install Tutorial is inside PWAInstallBanner */}

      {/* ═══════ BOTTOM NAVIGATION ═══════ */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        brandColor={config.primaryColor}
      />

      {/* Demo Navigation */}
      <DemoNav />
    </div>
  );
}
