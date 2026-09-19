export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  stars: number | string;
  forks: number | string;
  language: string;
  topics: string[];
  updatedAt: string;
  // optional fields for future use
  watchers?: number | string;
  openIssues?: number | string;
  featured?: boolean;
  languages?: { name: string; pct: number; color?: string }[];
  recentCommitsCount?: number;
}

export interface Developer {
  id: string;
  name: string;
  username: string;
  bio: string;
  reposCount: number;
  followers: number | string;
  following: number | string;
  primaryLanguage: string;
  location?: string;
  company?: string;
  blog?: string;
  joinedDate?: string;
  contributionsPastYear?: number;
}
