'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from '@/lib/api-client';
import type { User } from '@gymstack/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string, gymSlug?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('gymstack_token');
    const storedUser = localStorage.getItem('gymstack_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string, gymSlug?: string) => {
    const res = await apiClient.post('/auth/login', { phone, password, gymSlug });
    const { token: newToken, user: newUser, gym } = res.data;

    localStorage.setItem('gymstack_token', newToken);
    localStorage.setItem('gymstack_user', JSON.stringify(newUser));
    if (gym) localStorage.setItem('gymstack_slug', gym.slug);

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('gymstack_token');
    localStorage.removeItem('gymstack_user');
    localStorage.removeItem('gymstack_slug');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
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
