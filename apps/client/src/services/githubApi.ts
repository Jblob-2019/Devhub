/**
 * Frontend GitHub API proxy service.
 * All calls go through the backend at VITE_API_URL.
 */

export const searchRepositories = async (query: string) => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/github/search/repositories?q=${encodeURIComponent(query)}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to search repositories');
  const data = await resp.json();
  return data.items as any[]; // GitHub returns { items: [...] }
};

export const searchUsers = async (query: string) => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/github/search/users?q=${encodeURIComponent(query)}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to search users');
  const data = await resp.json();
  return data.items as any[];
};

export const getFullRepository = async (owner: string, repo: string) => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/github/repos/${owner}/${repo}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to fetch repository');
  return await resp.json(); // { repo, languages, contributors, commits }
};

export const getUser = async (username: string) => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/github/users/${username}`, {
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to fetch user');
  return await resp.json();
};
