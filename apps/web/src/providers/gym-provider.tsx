'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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

// DEMO MODE: Pre-configured gym branding
const DEMO_BRANDING: GymBranding = {
  name: 'Iron Paradise',
  logoUrl: null,
  primaryColor: '#8B5CF6',
  secondaryColor: '#06B6D4',
  slug: 'iron-paradise',
};

export function GymProvider({ children }: { children: ReactNode }) {
  const [branding] = useState<GymBranding | null>(DEMO_BRANDING);
  const [isLoading] = useState(false);

  // Apply branding CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', DEMO_BRANDING.primaryColor);
    root.style.setProperty('--color-primary-dark', '#7C3AED');
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
