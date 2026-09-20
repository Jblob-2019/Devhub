import React, { createContext, useContext, useEffect, useState } from 'react';

/** Simple user shape returned from /auth/me */
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

/**
 * Authentication context providing the current user, loading state, and helper actions.
 * This context is mounted at the root of the app (see App.tsx) and replaces the previous
 * per‑component `useAuth` hook. All components import `useAuth` from `../hooks/useAuth`,
 * which now simply re‑exports this hook.
 */

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Fetch current session */
const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: 'include',
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data as AuthUser;
  } catch (e) {
    console.error('Error fetching current user', e);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    // Initial load of auth state on mount
    refresh();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to access the authentication context. */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
