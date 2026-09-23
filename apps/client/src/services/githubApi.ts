/**
 * Frontend GitHub API proxy service.
 * All calls go through the backend via Vite proxy.
 */

import { API_BASE } from '../lib/apiBase';

export const searchRepositories = async (query: string) => {
  const resp = await fetch(`${API_BASE}/api/github/search/repositories?q=${encodeURIComponent(query)}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to search repositories');
  const data = await resp.json();
  return data.items as any[]; // GitHub returns { items: [...] }
};

export const searchUsers = async (query: string) => {
  const resp = await fetch(`${API_BASE}/api/github/search/users?q=${encodeURIComponent(query)}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to search users');
  const data = await resp.json();
  return data.items as any[];
};

export const getFullRepository = async (owner: string, repo: string) => {
  const resp = await fetch(`${API_BASE}/api/github/repos/${owner}/${repo}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to fetch repository');
  return await resp.json(); // { repo, languages, contributors, commits }
};

export const getUser = async (username: string) => {
  const resp = await fetch(`${API_BASE}/api/github/users/${username}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to fetch user');
  return await resp.json();
};

export const getRecommendations = async () => {
  const resp = await fetch(`${API_BASE}/api/github/recommendations`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to load recommendations');
  return await resp.json();
};

export const getDeveloperProfile = async (username: string) => {
  const resp = await fetch(`${API_BASE}/api/github/users/${encodeURIComponent(username)}/profile`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 404) throw new Error('Developer not found');
    throw new Error('Failed to fetch developer profile');
  }
  return await resp.json();
};

export const getDashboardData = async () => {
  const resp = await fetch(`${API_BASE}/api/github/me/dashboard`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 401) throw new Error('Not authenticated');
    if (resp.status === 400) throw new Error('GitHub account not connected');
    throw new Error('Failed to fetch dashboard data');
  }
  return await resp.json();
};