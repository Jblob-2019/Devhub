import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/apiBase';

export interface RecentItem {
  type: 'repo' | 'dev';
  id: string;
  name: string;
  time: string;
}

export interface SavedState {
  savedRepos: string[];
  savedDevs: string[];
  followingDevs: string[];
  recentlyViewed: RecentItem[];
  loadingFavorites: boolean;
  favoritesError: string | null;
}

export interface DevHubStore extends SavedState {
  toggleSaveRepo: (repoName: string) => Promise<void>;
  toggleSaveDev: (devHandle: string) => Promise<void>;
  toggleFollowDev: (devHandle: string) => void;
  addRecent: (item: { type: 'repo' | 'dev'; id: string; name: string }) => void;
  refetchFavorites: () => Promise<void>;
}

// Helper to safely access localStorage
const getStoredItems = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setStoredItems = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
};

// Singleton shared state
let globalState: SavedState = {
  savedRepos: [],
  savedDevs: [],
  followingDevs: getStoredItems<string[]>('devhub_following_devs', []),
  recentlyViewed: getStoredItems<RecentItem[]>('devhub_recently_viewed', []),
  loadingFavorites: false,
  favoritesError: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

let activeFetchPromise: Promise<void> | null = null;

async function loadFavoritesFromApi(): Promise<void> {
  if (activeFetchPromise) return activeFetchPromise;

  globalState = { ...globalState, loadingFavorites: true, favoritesError: null };
  notify();

  activeFetchPromise = (async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/favorites`, { credentials: 'include' });
      if (!resp.ok) {
        if (resp.status === 401) {
          // Unauthenticated – empty state
          globalState = {
            ...globalState,
            savedRepos: [],
            savedDevs: [],
            loadingFavorites: false,
            favoritesError: null,
          };
          notify();
          return;
        }
        throw new Error('Failed to load favorites');
      }

      const data = await resp.json() as Array<{ type: string; target: string }>;
      const savedRepos = data.filter((f) => f.type === 'repository').map((f) => f.target);
      const savedDevs = data.filter((f) => f.type === 'developer').map((f) => f.target);

      globalState = {
        ...globalState,
        savedRepos,
        savedDevs,
        loadingFavorites: false,
        favoritesError: null,
      };
      notify();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading favorites';
      globalState = {
        ...globalState,
        loadingFavorites: false,
        favoritesError: msg,
      };
      notify();
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

export function useDevHubStore(): DevHubStore {
  const { user, loading: authLoading } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  // Single auth-coordinated effect: fetch when authenticated, clear on logout
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (globalState.savedRepos.length > 0 || globalState.savedDevs.length > 0) {
        globalState = {
          ...globalState,
          savedRepos: [],
          savedDevs: [],
          loadingFavorites: false,
          favoritesError: null,
        };
        notify();
      }
      return;
    }

    void loadFavoritesFromApi();
  }, [user, authLoading]);

  const toggleSaveRepo = useCallback(async (repoName: string) => {
    const exists = globalState.savedRepos.includes(repoName);
    const prevRepos = globalState.savedRepos;

    // Optimistically update
    globalState = {
      ...globalState,
      savedRepos: exists
        ? prevRepos.filter((r) => r !== repoName)
        : [...prevRepos, repoName],
    };
    notify();

    try {
      const resp = exists
        ? await fetch(`${API_BASE}/api/favorites/repository/${encodeURIComponent(repoName)}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        : await fetch(`${API_BASE}/api/favorites`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'repository', target: repoName }),
          });

      if (!resp.ok) {
        throw new Error(`Failed to ${exists ? 'remove' : 'save'} repository`);
      }
    } catch (err) {
      console.error('[FAVORITES] toggleSaveRepo error:', err);
      // Rollback on failure
      globalState = { ...globalState, savedRepos: prevRepos };
      notify();
    }
  }, []);

  const toggleSaveDev = useCallback(async (devHandle: string) => {
    const exists = globalState.savedDevs.includes(devHandle);
    const prevDevs = globalState.savedDevs;

    // Optimistically update
    globalState = {
      ...globalState,
      savedDevs: exists
        ? prevDevs.filter((d) => d !== devHandle)
        : [...prevDevs, devHandle],
    };
    notify();

    try {
      const resp = exists
        ? await fetch(`${API_BASE}/api/favorites/developer/${encodeURIComponent(devHandle)}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        : await fetch(`${API_BASE}/api/favorites`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'developer', target: devHandle }),
          });

      if (!resp.ok) {
        throw new Error(`Failed to ${exists ? 'remove' : 'save'} developer`);
      }
    } catch (err) {
      console.error('[FAVORITES] toggleSaveDev error:', err);
      // Rollback on failure
      globalState = { ...globalState, savedDevs: prevDevs };
      notify();
    }
  }, []);

  const toggleFollowDev = useCallback((devHandle: string) => {
    const exists = globalState.followingDevs.includes(devHandle);
    const updated = exists
      ? globalState.followingDevs.filter((d) => d !== devHandle)
      : [...globalState.followingDevs, devHandle];

    globalState = { ...globalState, followingDevs: updated };
    setStoredItems('devhub_following_devs', updated);
    notify();
  }, []);

  const addRecent = useCallback((item: { type: 'repo' | 'dev'; id: string; name: string }) => {
    const updated: RecentItem[] = [
      { ...item, time: 'Just now' },
      ...globalState.recentlyViewed.filter((r) => r.id !== item.id),
    ].slice(0, 10);

    globalState = { ...globalState, recentlyViewed: updated };
    setStoredItems('devhub_recently_viewed', updated);
    notify();
  }, []);

  return {
    ...globalState,
    toggleSaveRepo,
    toggleSaveDev,
    toggleFollowDev,
    addRecent,
    refetchFavorites: loadFavoritesFromApi,
  };
}