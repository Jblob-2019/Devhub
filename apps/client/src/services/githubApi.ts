/**
 * Frontend GitHub API proxy service.
 * All calls go through the backend.
 */

import { API_BASE } from '../lib/apiBase';
import type { DashboardData, DeveloperProfileData } from '../types';

export interface GitHubSearchResponse<T> {
  items: T[];
  totalCount: number;
}

export const searchRepositories = async (
  query: string,
  page: number = 1,
  per_page: number = 20,
  sort?: string,
  order?: 'asc' | 'desc',
): Promise<GitHubSearchResponse<any>> => {
  const url = new URL(`${API_BASE}/api/github/search/repositories`, window.location.href);
  url.searchParams.set('q', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(per_page));
  if (sort) url.searchParams.set('sort', sort);
  if (order) url.searchParams.set('order', order);

  const resp = await fetch(url.toString(), {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to search repositories');
  }
  const data = await resp.json();
  return {
    items: data.items ?? [],
    totalCount: data.total_count ?? 0,
  };
};

export const searchUsers = async (
  query: string,
  page: number = 1,
  per_page: number = 20,
  sort?: string,
  order?: 'asc' | 'desc',
): Promise<GitHubSearchResponse<any>> => {
  const url = new URL(`${API_BASE}/api/github/search/users`, window.location.href);
  url.searchParams.set('q', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(per_page));
  if (sort) url.searchParams.set('sort', sort);
  if (order) url.searchParams.set('order', order);

  const resp = await fetch(url.toString(), {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to search developers');
  }
  const data = await resp.json();
  return {
    items: data.items ?? [],
    totalCount: data.total_count ?? 0,
  };
};

export const getFullRepository = async (owner: string, repo: string) => {
  const resp = await fetch(`${API_BASE}/api/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 404) throw new Error('Repository not found');
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to fetch repository');
  }
  return await resp.json();
};

export const getUser = async (username: string) => {
  const resp = await fetch(`${API_BASE}/api/github/users/${encodeURIComponent(username)}`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 404) throw new Error('User not found');
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to fetch user');
  }
  return await resp.json();
};

export const getRecommendations = async (): Promise<any[]> => {
  const resp = await fetch(`${API_BASE}/api/github/recommendations`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to load recommendations');
  }
  return await resp.json();
};

export const getDeveloperProfile = async (username: string): Promise<DeveloperProfileData> => {
  const resp = await fetch(`${API_BASE}/api/github/users/${encodeURIComponent(username)}/profile`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 404) throw new Error('Developer not found');
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to fetch developer profile');
  }
  return await resp.json();
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const resp = await fetch(`${API_BASE}/api/github/me/dashboard`, {
    credentials: 'include',
  });
  if (!resp.ok) {
    if (resp.status === 401) throw new Error('Not authenticated');
    if (resp.status === 400) throw new Error('GitHub account not connected');
    if (resp.status === 403) throw new Error('GitHub API rate limit exceeded');
    throw new Error('Failed to fetch dashboard data');
  }
  return await resp.json();
};