'use client';

// ─── Gym Config Store ──────────────────────────────────────
// Persisted to localStorage under "gymos_gym_config".
// Provides a React context so every component can read live config
// and the Settings page can write to it.

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';

// ─── Types ─────────────────────────────────────────────────

export interface GymPlanPrices {
  silverMonthly: number;
  goldThreeMonth: number;
  goldSixMonth: number;
  platinumAnnual: number;
}

export interface GymConfig {
  gymName: string;
  tagline: string;
  primaryColor: string;
  logoInitials: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;
  memberCount: number;
  city: string;
  ownerName: string;
  coachName: string;
  whatsappNumber: string;
  planPrices: GymPlanPrices;
}

// ─── Default Config ────────────────────────────────────────

export const DEFAULT_GYM_CONFIG: GymConfig = {
  gymName: 'IronPeak Fitness Club',
  tagline: 'Train Hard. Live Strong.',
  primaryColor: '#E85D04',
  logoInitials: 'IP',
  logoUrl: null,
  address: '42 Anna Salai, Chennai 600002',
  phone: '9944556677',
  email: 'info@ironpeakfitness.in',
  openTime: '06:00 AM',
  closeTime: '10:00 PM',
  memberCount: 247,
  city: 'Chennai',
  ownerName: 'Rajesh Menon',
  coachName: 'Suresh Kumar',
  whatsappNumber: '9944556677',
  planPrices: {
    silverMonthly: 1500,
    goldThreeMonth: 3600,
    goldSixMonth: 5400,
    platinumAnnual: 12000,
  },
};

const STORAGE_KEY = 'gymos_gym_config';

// ─── Persistence helpers ───────────────────────────────────

function readFromStorage(): GymConfig {
  if (typeof window === 'undefined') return DEFAULT_GYM_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GYM_CONFIG;
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields always exist
    return { ...DEFAULT_GYM_CONFIG, ...parsed, planPrices: { ...DEFAULT_GYM_CONFIG.planPrices, ...(parsed.planPrices || {}) } };
  } catch {
    return DEFAULT_GYM_CONFIG;
  }
}

function writeToStorage(config: GymConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ─── Apply brand color ─────────────────────────────────────

function applyBrandColor(color: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--brand-color', color);
  root.style.setProperty('--color-primary', color);

  // Compute a darker variant for hover states
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  root.style.setProperty('--brand-color-rgb', `${r}, ${g}, ${b}`);

  const rDark = Math.max(0, r - 25);
  const gDark = Math.max(0, g - 25);
  const bDark = Math.max(0, b - 25);
  root.style.setProperty(
    '--color-primary-dark',
    `#${rDark.toString(16).padStart(2, '0')}${gDark.toString(16).padStart(2, '0')}${bDark.toString(16).padStart(2, '0')}`
  );
}

// ─── Context ───────────────────────────────────────────────

interface GymConfigContextType {
  config: GymConfig;
  updateConfig: (partial: Partial<GymConfig>) => void;
  saveConfig: () => Promise<void>;
  resetConfig: () => void;
  isDirty: boolean;
}

const GymConfigContext = createContext<GymConfigContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────

export function GymConfigProvider({ children }: { children: ReactNode }) {
  const [savedConfig, setSavedConfig] = useState<GymConfig>(DEFAULT_GYM_CONFIG);
  const [config, setConfig] = useState<GymConfig>(DEFAULT_GYM_CONFIG);
  const [isDirty, setIsDirty] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = readFromStorage();
    setSavedConfig(stored);
    setConfig(stored);
    applyBrandColor(stored.primaryColor);
  }, []);

  // Track dirty state
  useEffect(() => {
    setIsDirty(JSON.stringify(config) !== JSON.stringify(savedConfig));
  }, [config, savedConfig]);

  // Live-apply brand color whenever it changes
  useEffect(() => {
    applyBrandColor(config.primaryColor);
  }, [config.primaryColor]);

  const updateConfig = useCallback((partial: Partial<GymConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const saveConfig = useCallback(async () => {
    // Simulate network delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 800));
    writeToStorage(config);
    setSavedConfig(config);
  }, [config]);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_GYM_CONFIG);
    writeToStorage(DEFAULT_GYM_CONFIG);
    setSavedConfig(DEFAULT_GYM_CONFIG);
    applyBrandColor(DEFAULT_GYM_CONFIG.primaryColor);
  }, []);

  return (
    <GymConfigContext.Provider value={{ config, updateConfig, saveConfig, resetConfig, isDirty }}>
      {children}
    </GymConfigContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────

export function useGymConfig() {
  const ctx = useContext(GymConfigContext);
  if (!ctx) throw new Error('useGymConfig must be used within GymConfigProvider');
  return ctx;
}
