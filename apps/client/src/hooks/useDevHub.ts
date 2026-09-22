import { useState, useMemo, useEffect } from 'react';
import { Repository, Developer } from '../types';
import { getRecommendations } from '../services/githubApi';

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

function normalizeRepo(item: any): Repository {
  return {
    id: String(item.id),
    name: item.name,
    owner: item.owner.login,
    fullName: item.full_name,
    description: item.description ?? 'No description available',
    stars: item.stargazers_count,
    forks: item.forks_count,
    language: item.language ?? '',
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
  const [categories, setCategories] = useState<string[]>(CATEGORIES_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getRecommendations();
        if (!cancelled) {
          const normalized = items.map(normalizeRepo);
          setRepositories(normalized);
          if (normalized.length > 0) {
            setFeaturedRepo(normalized[0]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load recommendations');
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
        repo.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
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