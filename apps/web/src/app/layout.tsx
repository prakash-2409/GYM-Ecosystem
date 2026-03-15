import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { GymProvider } from '@/providers/gym-provider';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'GymStack — Gym Management Platform',
  description: 'White-label gym management SaaS for Indian gyms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-page text-gray-900 antialiased font-sans">
        <QueryProvider>
          <AuthProvider>
            <GymProvider>{children}</GymProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
