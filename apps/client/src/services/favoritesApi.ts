/**
 * Favorites API service.
 * All calls go through the backend with credentials.
 */

import { API_BASE } from '../lib/apiBase';

export interface FavoriteItem {
  id: string;
  type: 'repository' | 'developer';
  target: string;
  created_at: string;
}

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  const resp = await fetch(`${API_BASE}/api/favorites`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to fetch favorites');
  return await resp.json();
};

export const addFavorite = async (params: {
  type: 'repository' | 'developer';
  targetId: string;
  targetName: string;
  targetUrl: string;
  metadata?: Record<string, any>;
}) => {
  // Backend expects { type, target } where target is the full identifier
  const target = params.type === 'repository' ? params.targetId : params.targetName;
  const resp = await fetch(`${API_BASE}/api/favorites`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: params.type, target }),
  });
  if (!resp.ok) throw new Error('Failed to add favorite');
  return await resp.json();
};

export const removeFavorite = async (type: 'repository' | 'developer', target: string) => {
  const resp = await fetch(`${API_BASE}/api/favorites/${type}/${encodeURIComponent(target)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 404) throw new Error('Favorite not found');
    throw new Error('Failed to remove favorite');
  }
  return await resp.json();
};

export const isFavorite = async (target: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    // Check both repository (owner/repo) and developer (username) formats
    return favorites.some((f) =>
      f.target === target ||
      f.target.toLowerCase() === target.toLowerCase()
    );
  } catch {
    return false;
  }
};