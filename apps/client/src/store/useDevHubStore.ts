import { useState, useEffect, useCallback } from 'react';

export interface SavedState {
  savedRepos: string[]; // repository fullNames (e.g. 'vercel/next.js')
  savedDevs: string[]; // developer handles (e.g. 'torvalds')
  followingDevs: string[];
  recentlyViewed: { type: 'repo' | 'dev'; id: string; name: string; time: string }[];
}

// Helper to fetch favorites from backend
const fetchFavorites = async (): Promise<SavedState> => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, { credentials: 'include' });
  if (!resp.ok) {
    console.error('Failed to load favorites');
    return { savedRepos: [], savedDevs: [], followingDevs: [], recentlyViewed: [] };
  }
  const data = await resp.json();
  // Backend returns array of { id, type, target }
  const savedRepos = data.filter((f:any) => f.type === 'repository').map((f:any) => f.target);
  const savedDevs = data.filter((f:any) => f.type === 'developer').map((f:any) => f.target);
  return { savedRepos, savedDevs, followingDevs: [], recentlyViewed: [] };
};

export function useDevHubStore() {
  const [state, setState] = useState<SavedState>({ savedRepos: [], savedDevs: [], followingDevs: [], recentlyViewed: [] });

  // Load favorites on mount
  useEffect(() => {
    let cancelled = false;
    fetchFavorites().then(favs => {
      if (!cancelled) setState(prev => ({ ...prev, ...favs }));
    });
    return () => { cancelled = true; };
  }, []);

  const toggleSaveRepo = useCallback(async (repoName: string) => {
    const exists = state.savedRepos.includes(repoName);
    if (exists) {
      // DELETE favorite
      await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/repository/${encodeURIComponent(repoName)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } else {
      // POST new favorite
      await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'repository', target: repoName }),
      });
    }
    setState(prev => ({
      ...prev,
      savedRepos: exists ? prev.savedRepos.filter(r => r !== repoName) : [...prev.savedRepos, repoName],
    }));
  }, [state.savedRepos]);

  const toggleSaveDev = useCallback(async (devHandle: string) => {
    const exists = state.savedDevs.includes(devHandle);
    if (exists) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/developer/${encodeURIComponent(devHandle)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } else {
      await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'developer', target: devHandle }),
      });
    }
    setState(prev => ({
      ...prev,
      savedDevs: exists ? prev.savedDevs.filter(d => d !== devHandle) : [...prev.savedDevs, devHandle],
    }));
  }, [state.savedDevs]);

  const toggleFollowDev = useCallback((devHandle: string) => {
    setState(prev => {
      const exists = prev.followingDevs.includes(devHandle);
      return {
        ...prev,
        followingDevs: exists ? prev.followingDevs.filter(d => d !== devHandle) : [...prev.followingDevs, devHandle],
      };
    });
  }, []);

  const addRecent = useCallback((item: { type: 'repo' | 'dev'; id: string; name: string }) => {
    setState(prev => ({
      ...prev,
      recentlyViewed: [{ ...item, time: 'Just now' }, ...prev.recentlyViewed.filter(r => r.id !== item.id)].slice(0, 10),
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
