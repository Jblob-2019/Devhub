export type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register' | '/developer' | '/repository';

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

// Developer Profile types
export interface DeveloperProfileUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  createdAt: string;
}

export interface DeveloperProfileStats {
  repos: number;
  stars: number;
  forks: number;
  followers: number;
  following: number;
}

export interface DeveloperProfileLanguage {
  name: string;
  bytes: number;
  pct: number;
  color: string;
}

export interface DeveloperProfileContributions {
  total: number;
  weeks: Array<{
    days: Array<{
      date: string;
      count: number;
      color: string;
    }>;
  }>;
}

export interface DeveloperProfileActivityItem {
  type: string;
  repo: string | null;
  repoUrl: string | null;
  createdAt: string;
  payload: any;
}

export interface DeveloperProfileRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  isPrivate: boolean;
  htmlUrl: string;
}

export interface DeveloperProfileData {
  user: DeveloperProfileUser;
  stats: DeveloperProfileStats;
  languages: DeveloperProfileLanguage[];
  contributions: DeveloperProfileContributions;
  activity: DeveloperProfileActivityItem[];
  repositories: DeveloperProfileRepository[];
}

// Dashboard types (authenticated user's own dashboard)
export interface DashboardUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalRepos: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  createdAt: string;
  email: string | null;
}

export interface DashboardStats {
  repos: number;
  publicRepos: number;
  privateRepos: number;
  stars: number;
  forks: number;
  followers: number;
  following: number;
  contributions: number;
  reposContributedTo: number;
  gists: number;
  starredRepos: number;
}

export interface DashboardLanguage {
  name: string;
  bytes: number;
  pct: number;
  color: string;
}

export interface DashboardContributions {
  total: number;
  weeks: Array<{
    days: Array<{
      date: string;
      count: number;
      color: string;
    }>;
  }>;
}

export interface DashboardActivityItem {
  type: string;
  repo: string | null;
  repoUrl: string | null;
  createdAt: string;
  payload: any;
}

export interface DashboardRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  isPrivate: boolean;
  htmlUrl: string;
  owner: string | null;
  ownerAvatar: string | null;
}

export interface DashboardContributedRepo {
  nameWithOwner: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
}

export interface DashboardGist {
  id: string;
  description: string | null;
  htmlUrl: string;
  files: string[];
  public: boolean;
  updatedAt: string;
}

export interface DashboardStarredRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  htmlUrl: string;
}

export interface DashboardFollowingUser {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface DashboardOrganization {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface DashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  languages: DashboardLanguage[];
  contributions: DashboardContributions;
  repositories: DashboardRepository[];
  recentActivity: DashboardActivityItem[];
  contributedRepos: DashboardContributedRepo[];
  gists: DashboardGist[];
  starredRepos: DashboardStarredRepo[];
  following: DashboardFollowingUser[];
  organizations: DashboardOrganization[];
}
