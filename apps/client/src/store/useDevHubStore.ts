import { useState, useEffect, useCallback } from 'react';

import { API_BASE } from '../lib/apiBase';

export interface SavedState {
  savedRepos: string[]; // repository fullNames (e.g. 'vercel/next.js')
  savedDevs: string[]; // developer handles (e.g. 'torvalds')
  followingDevs: string[];
  recentlyViewed: { type: 'repo' | 'dev'; id: string; name: string; time: string }[];
}

const fetchFavorites = async (): Promise<SavedState> => {
  const resp = await fetch(`${API_BASE}/api/favorites`, { credentials: 'include' });
  if (!resp.ok) {
    console.error('Failed to load favorites');
    return { savedRepos: [], savedDevs: [], followingDevs: [], recentlyViewed: [] };
  }
  const data = await resp.json();
  // Backend returns array of { id, type, target }
  const savedRepos = data.filter((f: any) => f.type === 'repository').map((f: any) => f.target);
  const savedDevs = data.filter((f: any) => f.type === 'developer').map((f: any) => f.target);
  return { savedRepos, savedDevs, followingDevs: [], recentlyViewed: [] };
};

export function useDevHubStore() {
  const [state, setState] = useState<SavedState>({
    savedRepos: [],
    savedDevs: [],
    followingDevs: [],
    recentlyViewed: [],
  });

  // Load favorites on mount
  useEffect(() => {
    let cancelled = false;
    fetchFavorites().then(favs => {
      if (!cancelled) setState((prev: SavedState) => ({ ...prev, ...favs }));
    });
    return () => { cancelled = true; };
  }, []);

  const toggleSaveRepo = useCallback(async (repoName: string) => {
    const exists = state.savedRepos.includes(repoName);
    if (exists) {
      // DELETE favorite
      await fetch(`${API_BASE}/api/favorites/repository/${encodeURIComponent(repoName)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } else {
      // POST new favorite
      await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'repository', target: repoName }),
      });
    }
    setState((prev: SavedState) => ({
      ...prev,
      savedRepos: exists ? prev.savedRepos.filter((r: string) => r !== repoName) : [...prev.savedRepos, repoName],
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
    setState((prev: SavedState) => ({
      ...prev,
      savedDevs: exists ? prev.savedDevs.filter((d: string) => d !== devHandle) : [...prev.savedDevs, devHandle],
    }));
  }, [state.savedDevs]);

  const toggleFollowDev = useCallback((devHandle: string) => {
    setState((prev: SavedState) => {
      const exists = prev.followingDevs.includes(devHandle);
      return {
        ...prev,
        followingDevs: exists ? prev.followingDevs.filter((d: string) => d !== devHandle) : [...prev.followingDevs, devHandle],
      };
    });
  }, []);

  const addRecent = useCallback((item: { type: 'repo' | 'dev'; id: string; name: string }) => {
    setState((prev: SavedState) => ({
      ...prev,
      recentlyViewed: [{ ...item, time: 'Just now' }, ...prev.recentlyViewed.filter((r: { type: 'repo' | 'dev'; id: string; name: string; time: string }) => r.id !== item.id)].slice(0, 10),
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