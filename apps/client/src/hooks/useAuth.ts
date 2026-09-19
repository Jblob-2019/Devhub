import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

/** Fetch current session */
export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
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

/** Hook to expose auth state */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
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

  return { user, loading, refresh, logout };
};
