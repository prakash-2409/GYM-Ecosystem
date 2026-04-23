'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useGymConfig } from '@/lib/gym-config-store';

interface GymBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  slug: string;
}

interface GymContextType {
  branding: GymBranding | null;
  isLoading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: ReactNode }) {
  const { config } = useGymConfig();

  const branding: GymBranding = {
    name: config.gymName,
    logoUrl: config.logoUrl,
    primaryColor: config.primaryColor,
    secondaryColor: config.primaryColor,
    slug: config.gymName.toLowerCase().replace(/\s+/g, '-'),
  };

  return (
    <GymContext.Provider value={{ branding, isLoading: false }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error('useGym must be used within GymProvider');
  return ctx;
}
