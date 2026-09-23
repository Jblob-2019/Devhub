import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../lib/apiBase';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  github_username?: string;
  github_id?: string;
}

/** Context shape – this shape is now exported so any file can import it */
export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

/** Fetch the current user – must include cookies */
const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const resp = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
    });
    console.debug('[AUTH] /api/auth/me status:', resp.status);
    if (!resp.ok) return null;
    return (await resp.json()) as AuthUser;
  } catch (e) {
    console.debug('[AUTH] fetchCurrentUser error', e);
    return null;
  }
}

/**
 * AuthProvider – single source of truth for authentication state.
 * - loading = true while we are waiting for /auth/me
 * - user  = null until the /auth/me call resolves successfully
 * - refresh updates both `user` and `loading`, returns the user
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    const previousUser = user;
    setUser(u);
    setLoading(false);

    // Invalidate dashboard cache when user changes
    if (previousUser?.id !== u?.id) {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }

    return u;
  }, [user, queryClient]);

  // Run once on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    // Invalidate dashboard cache on logout
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const value: AuthContextValue = {
    user,
    loading,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);