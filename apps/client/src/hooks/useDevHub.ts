import { useState, useMemo, useEffect } from 'react';
import { Repository, Developer } from '../types';

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

export function useDevHub() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const defaultRepo: Repository = {
    id: '',
    name: '',
    owner: '',
    fullName: '',
    description: '',
    stars: 0,
    forks: 0,
    language: '',
    topics: [],
    updatedAt: '',
  };
  const [featuredRepo, setFeaturedRepo] = useState<Repository>(defaultRepo);

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [categories, setCategories] = useState<string[]>(CATEGORIES_DEFAULT);

  // No longer fetch mock endpoints. The Explore page performs its own search.

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
  };
}
