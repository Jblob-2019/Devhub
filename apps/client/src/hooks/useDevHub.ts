import { useState, useMemo, useEffect } from 'react';
import { Repository, Developer } from '../types';
import { getRecommendations, searchUsers } from '../services/githubApi';

export const CATEGORIES_DEFAULT = [
  'All',
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'React',
  'AI/ML',
  'DevOps',
  'Web3',
  'Mobile',
];

interface GitHubRepoItem {
  id: number;
  name: string;
  owner: { login: string };
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
}

interface GitHubUserItem {
  id: number;
  login: string;
  name?: string | null;
  bio?: string | null;
  avatar_url?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  language?: string | null;
}

function normalizeRepo(item: GitHubRepoItem): Repository {
  return {
    id: String(item.id),
    name: item.name,
    owner: item.owner?.login ?? '',
    fullName: item.full_name,
    description: item.description ?? 'No description available',
    stars: item.stargazers_count,
    forks: item.forks_count,
    language: item.language ?? 'Other',
    topics: item.topics ?? [],
    updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently',
    languages: [],
  };
}

export function useDevHub() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [featuredRepo, setFeaturedRepo] = useState<Repository | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [categories] = useState<string[]>(CATEGORIES_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [repoItems, devRes] = await Promise.all([
          getRecommendations(),
          searchUsers('followers:>1000', 1, 6, 'followers').catch(() => ({ items: [], totalCount: 0 })),
        ]);

        if (!cancelled) {
          const normalized = (repoItems || []).map(normalizeRepo);
          setRepositories(normalized);
          if (normalized.length > 0) {
            setFeaturedRepo(normalized[0]);
          }

          const normalizedDevs: Developer[] = (devRes.items || []).map((u: GitHubUserItem) => ({
            id: String(u.id),
            name: u.name || u.login,
            username: u.login,
            bio: u.bio ?? '',
            avatarUrl: u.avatar_url,
            reposCount: u.public_repos ?? 0,
            followers: u.followers ?? 0,
            following: u.following ?? 0,
            primaryLanguage: u.language ?? 'Unknown',
          }));
          setDevelopers(normalizedDevs);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load recommendations';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const matchCat =
        selectedCategory === 'All' ||
        repo.language.toLowerCase() === selectedCategory.toLowerCase() ||
        repo.topics.some(t => t.toLowerCase() === selectedCategory.toLowerCase());
      const matchQuery =
        !searchQuery ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.topics.some(t => t.toLowerCase() === searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [repositories, selectedCategory, searchQuery]);

  return {
    featuredRepo,
    repositories: filteredRepositories,
    developers,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    error,
  };
}