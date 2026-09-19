export type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

export type FrameMode = 'desktop' | 'mobile';

export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  stars: number | string;
  forks: number | string;
  watchers?: number | string;
  openIssues?: number | string;
  language: string;
  topics: string[];
  updatedAt: string;
  isPrivate?: boolean;
  featured?: boolean;
  languages?: { name: string; pct: number; color?: string }[];
  readmePreview?: string;
  recentCommitsCount?: number;
}

export interface Developer {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl?: string;
  reposCount: number;
  followers: number | string;
  following: number | string;
  primaryLanguage: string;
  location?: string;
  company?: string;
  blog?: string;
  joinedDate?: string;
  pinnedRepos?: string[];
  contributionsPastYear?: number;
}

export interface CommitItem {
  sha: string;
  message: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  verified?: boolean;
}

export interface ContributorItem {
  username: string;
  name?: string;
  avatarUrl?: string;
  commitsCount: number;
  contributionsPct?: number;
}

export interface LanguageBreakdown {
  name: string;
  pct: number;
  color: string;
  bytes?: number;
}

export interface SavedCollection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  updatedAt: string;
}
