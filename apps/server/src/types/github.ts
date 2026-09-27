export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepositoryOwner {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepositoryLicense {
  key: string;
  name: string;
  spdx_id: string | null;
  url: string | null;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubRepositoryOwner;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
  subscribers_count?: number;
  license?: GitHubRepositoryLicense | null;
}

export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

export interface GitHubCommitInfo {
  author: GitHubCommitAuthor;
  committer: GitHubCommitAuthor;
  message: string;
  comment_count: number;
  verification?: {
    verified: boolean;
    reason: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: GitHubCommitInfo;
  html_url: string;
  author: {
    id?: number;
    login?: string;
    avatar_url?: string;
    html_url?: string;
  } | null;
  committer: {
    id?: number;
    login?: string;
    avatar_url?: string;
    html_url?: string;
  } | null;
  parents: Array<{ sha: string }>;
  verified?: boolean;
}

export interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export interface GitHubSearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export interface GitHubEventPayload {
  action?: string;
  ref?: string;
  ref_type?: string;
  commits?: Array<{ sha: string; message: string }>;
  release?: { tag_name: string };
  issue?: { number: number; title: string };
  pull_request?: { number: number; title: string };
  [key: string]: unknown;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: GitHubEventPayload;
  public: boolean;
  created_at: string;
}

export interface GitHubGistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
}

export interface GitHubGist {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
  files: Record<string, GitHubGistFile>;
}

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
  html_url: string;
}

export interface GitHubRateLimit {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
    };
    search: {
      limit: number;
      remaining: number;
      reset: number;
    };
    graphql: {
      limit: number;
      remaining: number;
      reset: number;
    };
  };
}
