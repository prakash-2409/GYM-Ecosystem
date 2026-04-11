import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { GymProvider } from '@/providers/gym-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'GymOS — Gym Management Platform',
  description: 'White-label gym management SaaS for Indian gyms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only 400 and 500 weights — NEVER 600 or 700 */}
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-page text-text-primary antialiased font-sans">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <GymProvider>{children}</GymProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
