import { useState, useEffect, useCallback } from 'react';

export interface SavedState {
  savedRepos: string[]; // repository fullNames (e.g. 'vercel/next.js')
  savedDevs: string[]; // developer handles (e.g. 'torvalds')
  followingDevs: string[];
  recentlyViewed: { type: 'repo' | 'dev'; id: string; name: string; time: string }[];
}

const DEFAULT_SAVED_STATE: SavedState = {
  savedRepos: ['vercel/next.js', 'microsoft/vscode', 'rust-lang/rust', 'denoland/deno'],
  savedDevs: ['torvalds', 'yyx990803'],
  followingDevs: ['torvalds'],
  recentlyViewed: [
    { type: 'repo', id: 'facebook/react', name: 'facebook/react', time: '10m ago' },
    { type: 'dev', id: 'sindresorhus', name: 'sindresorhus', time: '25m ago' },
    { type: 'repo', id: 'golang/go', name: 'golang/go', time: '1h ago' },
    { type: 'repo', id: 'openai/whisper', name: 'openai/whisper', time: '2h ago' },
    { type: 'dev', id: 'karpathy', name: 'karpathy', time: '3h ago' },
  ]
};

export function useDevHubStore() {
  const [state, setState] = useState<SavedState>(() => {
    try {
      const stored = localStorage.getItem('devhub_state');
      return stored ? JSON.parse(stored) : DEFAULT_SAVED_STATE;
    } catch {
      return DEFAULT_SAVED_STATE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('devhub_state', JSON.stringify(state));
    } catch {
      // Ignore local storage error
    }
  }, [state]);

  const toggleSaveRepo = useCallback((repoName: string) => {
    setState(prev => {
      const exists = prev.savedRepos.includes(repoName);
      return {
        ...prev,
        savedRepos: exists
          ? prev.savedRepos.filter(r => r !== repoName)
          : [...prev.savedRepos, repoName]
      };
    });
  }, []);

  const toggleSaveDev = useCallback((devHandle: string) => {
    setState(prev => {
      const exists = prev.savedDevs.includes(devHandle);
      return {
        ...prev,
        savedDevs: exists
          ? prev.savedDevs.filter(d => d !== devHandle)
          : [...prev.savedDevs, devHandle]
      };
    });
  }, []);

  const toggleFollowDev = useCallback((devHandle: string) => {
    setState(prev => {
      const exists = prev.followingDevs.includes(devHandle);
      return {
        ...prev,
        followingDevs: exists
          ? prev.followingDevs.filter(d => d !== devHandle)
          : [...prev.followingDevs, devHandle]
      };
    });
  }, []);

  const addRecent = useCallback((item: { type: 'repo' | 'dev'; id: string; name: string }) => {
    setState(prev => ({
      ...prev,
      recentlyViewed: [
        { ...item, time: 'Just now' },
        ...prev.recentlyViewed.filter(r => r.id !== item.id)
      ].slice(0, 10)
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
