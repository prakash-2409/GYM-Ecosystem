'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from '@/lib/api-client';
import type { GymBranding } from '@gymstack/shared';

interface GymContextType {
  branding: GymBranding | null;
  isLoading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<GymBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBranding() {
      try {
        // Extract slug from subdomain or localStorage
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        let slug = localStorage.getItem('gymstack_slug');

        if (parts.length >= 3 && parts[0] !== 'www') {
          slug = parts[0];
        }

        if (slug) {
          const res = await apiClient.get(`/gym/branding?slug=${slug}`);
          setBranding(res.data);

          // Apply branding as CSS variables
          const root = document.documentElement;
          root.style.setProperty('--color-primary', res.data.primaryColor);
          root.style.setProperty('--color-secondary', res.data.secondaryColor);
        }
      } catch {
        // Use defaults
      } finally {
        setIsLoading(false);
      }
    }
    fetchBranding();
  }, []);

  return (
    <GymContext.Provider value={{ branding, isLoading }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error('useGym must be used within GymProvider');
  return ctx;
}
