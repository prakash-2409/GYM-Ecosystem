'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string, gymSlug?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// DEMO MODE: Pre-authenticated as gym owner
const DEMO_USER: User = {
  id: 'demo-owner-001',
  name: 'Rajesh Gupta',
  role: 'gym_owner',
  phone: '+91 99887 76655',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(DEMO_USER);
  const [token] = useState<string | null>('demo-token');
  const [isLoading] = useState(false);

  const login = async () => {
    // Demo mode — already logged in
  };

  const logout = () => {
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
