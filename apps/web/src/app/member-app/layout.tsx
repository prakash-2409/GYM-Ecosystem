import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Iron Paradise Gym — Member App',
  description: 'Your personal gym companion',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Iron Paradise',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F0F0F',
};

export default function MemberAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="member-app-root">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      {children}
    </div>
  );
}
