import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/apiBase';

export interface SavedState {
  savedRepos: string[]; // repository fullNames (e.g. 'vercel/next.js')
  savedDevs: string[]; // developer handles (e.g. 'torvalds')
  followingDevs: string[];
  recentlyViewed: { type: 'repo' | 'dev'; id: string; name: string; time: string }[];
}

export interface DevHubStore {
  savedRepos: string[];
  savedDevs: string[];
  followingDevs: string[];
  recentlyViewed: { type: 'repo' | 'dev'; id: string; name: string; time: string }[];
  toggleSaveRepo: (repoName: string) => Promise<void>;
  toggleSaveDev: (devHandle: string) => Promise<void>;
  toggleFollowDev: (devHandle: string) => void;
  addRecent: (item: { type: 'repo' | 'dev'; id: string; name: string }) => void;
}

const initialState: SavedState = {
  savedRepos: [],
  savedDevs: [],
  followingDevs: [],
  recentlyViewed: [],
};

export function useDevHubStore(): DevHubStore {
  // Merge store state with AuthContext to coordinate favorites loading
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<SavedState>(initialState);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);

  // Load favorites only after authentication is fully resolved
  useEffect(() => {
    if (!authLoading && user !== null) {
      // Authentication is resolved; safe to fetch favorites
      if (!isFetchingFavorites) {
        fetchFavorites();
      }
    }
  }, [authLoading, user, isFetchingFavorites]);

  // Reset favorites when user logs out
  useEffect(() => {
    if (authLoading === false && user === null) {
      // User has been removed (logout), clear favorites from state
      setState((prev) => ({
        ...prev,
        savedRepos: [],
        savedDevs: [],
        followingDevs: [],
      }));
    }
  }, [user, authLoading]);

  const fetchFavorites = async (): Promise<SavedState> => {
    const resp = await fetch(`${API_BASE}/api/favorites`, { credentials: 'include' });
    if (!resp.ok) {
      console.error('Failed to load favorites');
      return { savedRepos: [], savedDevs: [], followingDevs: [], recentlyViewed: [] };
    }
    const data = await resp.json();
    const savedRepos = data.filter((f: any) => f.type === 'repository').map((f: any) => f.target);
    const savedDevs = data.filter((f: any) => f.type === 'developer').map((f: any) => f.target);
    return { savedRepos, savedDevs, followingDevs: [], recentlyViewed: [] };
  };

  // Re-fetch favorites whenever state shape changes (e.g., after logout)
  useEffect(() => {
    if (!isFetchingFavorites) {
      fetchFavorites().then(favs => {
        setState((prev) => ({
          ...prev,
          ...favs,
        }));
      });
    }
  }, [isFetchingFavorites]);

  const toggleSaveRepo = useCallback(async (repoName: string) => {
    const exists = state.savedRepos.includes(repoName);
    if (exists) {
      await fetch(`${API_BASE}/api/favorites/repository/${encodeURIComponent(repoName)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } else {
      await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'repository', target: repoName }),
      });
    }
    setState((prev) => ({
      ...prev,
      savedRepos: exists ? prev.savedRepos.filter((r) => r !== repoName) : [...prev.savedRepos, repoName],
    }));
  }, [state.savedRepos]);

  const toggleSaveDev = useCallback(async (devHandle: string) => {
    const exists = state.savedDevs.includes(devHandle);
    if (exists) {
      await fetch(`${API_BASE}/api/favorites/developer/${encodeURIComponent(devHandle)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } else {
      await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'developer', target: devHandle }),
      });
    }
    setState((prev) => ({
      ...prev,
      savedDevs: exists ? prev.savedDevs.filter((d) => d !== devHandle) : [...prev.savedDevs, devHandle],
    }));
  }, [state.savedDevs]);

  const toggleFollowDev = useCallback((devHandle: string) => {
    setState((prev) => {
      const exists = prev.followingDevs.includes(devHandle);
      return {
        ...prev,
        followingDevs: exists ? prev.followingDevs.filter((d) => d !== devHandle) : [...prev.followingDevs, devHandle],
      };
    });
  }, []);

  const addRecent = useCallback((item: { type: 'repo' | 'dev'; id: string; name: string }) => {
    setState((prev) => ({
      ...prev,
      recentlyViewed: [{ ...item, time: 'Just now' }, ...prev.recentlyViewed.filter((r) => r.id !== item.id)].slice(0, 10),
    }));
  }, []);

  return {
    ...state,
    toggleSaveRepo,
    toggleSaveDev,
    toggleFollowDev,
    addRecent,
  };
}