import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SessionUser, User, UserStats } from '../../shared/types';
import { api, ApiError } from '../lib/api';
import { useI18n } from '../i18n';
import { useTheme } from './ThemeProvider';

interface AuthValue {
  user: User | null;
  stats: UserStats | null;
  loading: boolean;
  apiReachable: boolean | null;
  login: (contact: string, password: string) => Promise<void>;
  register: (name: string, contact: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  applySession: (session: SessionUser) => void;
  updateLocalUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);
  const { setLang } = useI18n();
  const { setTheme } = useTheme();

  const applySession = useCallback(
    (session: SessionUser) => {
      setUser(session.user);
      setStats(session.stats);
      setLang(session.user.locale);
      setTheme(session.user.theme);
    },
    [setLang, setTheme],
  );

  const refresh = useCallback(async () => {
    try {
      const session = await api.me();
      applySession(session);
      setApiReachable(true);
    } catch (error) {
      setUser(null);
      setStats(null);
      if (error instanceof ApiError && error.status === 0) setApiReachable(false);
      else setApiReachable(true);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (contact: string, password: string) => {
      const session = await api.login({ contact, password });
      applySession(session);
      setApiReachable(true);
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, contact: string, password: string, passwordConfirm: string) => {
      const session = await api.register({ name, contact, password, passwordConfirm });
      applySession(session);
      setApiReachable(true);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStats(null);
    }
  }, []);

  const updateLocalUser = useCallback((next: User) => setUser(next), []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      stats,
      loading,
      apiReachable,
      login,
      register,
      logout,
      refresh,
      applySession,
      updateLocalUser,
    }),
    [user, stats, loading, apiReachable, login, register, logout, refresh, applySession, updateLocalUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
