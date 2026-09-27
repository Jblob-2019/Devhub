import {
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubContributor,
  GitHubSearchResponse,
  GitHubEvent,
  GitHubGist,
  GitHubOrganization,
  GitHubRateLimit,
} from '../types/github.js';

/**
 * Custom error class with status code and body
 */
export class GitHubApiError extends Error {
  public readonly status: number;
  public readonly responseBody: string;

  constructor(message: string, status: number, responseBody: string) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.responseBody = responseBody;
  }
}

export class GitHubService {
  private token: string | null = null;
  private headers: Record<string, string> | null = null;

  private ensureConfig() {
    if (!this.token) {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error('GITHUB_TOKEN is not configured');
      }
      this.token = token;
      this.headers = {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };
    }
  }

  private async request<T>(url: string, customHeaders?: Record<string, string>): Promise<T> {
    this.ensureConfig();
    try {
      const resp = await fetch(url, {
        headers: customHeaders ?? this.headers!,
        signal: AbortSignal.timeout(10_000),
      });

      if (!resp.ok) {
        const err = await resp.text();
        if (resp.status === 403 || resp.status === 429) {
          const resetHeader = resp.headers.get('x-ratelimit-reset');
          const resetTime = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000).toLocaleTimeString() : 'soon';
          throw new GitHubApiError(`GitHub API rate limit exceeded. Resets at ${resetTime}`, resp.status, err);
        }
        throw new GitHubApiError(`GitHub API error ${resp.status}: ${err}`, resp.status, err);
      }

      return (await resp.json()) as T;
    } catch (err: unknown) {
      if (err instanceof GitHubApiError) throw err;
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new GitHubApiError('GitHub API request timed out after 10 seconds', 504, 'Gateway Timeout');
      }
      throw err;
    }
  }

  private async requestGraphQL<T>(query: string, variables: Record<string, unknown>, customHeaders?: Record<string, string>): Promise<T> {
    this.ensureConfig();
    try {
      const resp = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: customHeaders ?? this.headers!,
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new GitHubApiError(`GitHub GraphQL error ${resp.status}: ${err}`, resp.status, err);
      }

      const result = await resp.json() as { data?: T; errors?: unknown[] };
      if (result.errors) {
        throw new GitHubApiError(`GraphQL errors: ${JSON.stringify(result.errors)}`, 400, JSON.stringify(result.errors));
      }
      return result.data as T;
    } catch (err: unknown) {
      if (err instanceof GitHubApiError) throw err;
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new GitHubApiError('GitHub GraphQL request timed out after 10 seconds', 504, 'Gateway Timeout');
      }
      throw err;
    }
  }

  // Create headers with user-specific GitHub token
  private createUserHeaders(githubToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  // Search repositories by query string with optional sort and order
  async searchRepositories(
    query: string,
    perPage = 20,
    page = 1,
    sort?: string,
    order?: 'asc' | 'desc'
  ): Promise<GitHubSearchResponse<GitHubRepository>> {
    const params = new URLSearchParams({
      q: query,
      per_page: String(perPage),
      page: String(page),
    });
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);

    return this.request<GitHubSearchResponse<GitHubRepository>>(
      `https://api.github.com/search/repositories?${params.toString()}`
    );
  }

  // Search users (developers) by query with optional sort and order
  async searchUsers(
    query: string,
    perPage = 20,
    page = 1,
    sort?: string,
    order?: 'asc' | 'desc'
  ): Promise<GitHubSearchResponse<GitHubUser>> {
    const params = new URLSearchParams({
      q: query,
      per_page: String(perPage),
      page: String(page),
    });
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);

    return this.request<GitHubSearchResponse<GitHubUser>>(
      `https://api.github.com/search/users?${params.toString()}`
    );
  }

  // Get repository details
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`https://api.github.com/repos/${owner}/${repo}`);
  }

  // Get repository languages
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    return this.request<Record<string, number>>(`https://api.github.com/repos/${owner}/${repo}/languages`);
  }

  // Get repository contributors (first 100)
  async getRepositoryContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    return this.request<GitHubContributor[]>(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`);
  }

  // Get repository commits (latest)
  async getRepositoryCommits(owner: string, repo: string, perPage = 20, page = 1): Promise<GitHubCommit[]> {
    const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
    return this.request<GitHubCommit[]>(`https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`);
  }

  // Get user (developer) profile by username
  async getUser(username: string): Promise<GitHubUser> {
    return this.request<GitHubUser>(`https://api.github.com/users/${username}`);
  }

  // Get user repositories (public, sorted by stars)
  async getUserRepos(username: string, perPage = 100): Promise<GitHubRepository[]> {
    const params = new URLSearchParams({
      sort: 'stars',
      direction: 'desc',
      per_page: String(perPage),
      type: 'public',
    });
    return this.request<GitHubRepository[]>(`https://api.github.com/users/${username}/repos?${params.toString()}`);
  }

  // Get user events (public activity)
  async getUserEvents(username: string, perPage = 50): Promise<GitHubEvent[]> {
    const params = new URLSearchParams({ per_page: String(perPage) });
    return this.request<GitHubEvent[]>(`https://api.github.com/users/${username}/events/public?${params.toString()}`);
  }

  // Get user contribution calendar (via GraphQL)
  async getUserContributions(username: string) {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;
    return this.requestGraphQL<{
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: Array<{
              contributionDays: Array<{
                date: string;
                contributionCount: number;
                color: string;
              }>;
            }>;
          };
        };
      };
    }>(query, { username });
  }

  // Get authenticated user's rate limit
  async getRateLimit(): Promise<GitHubRateLimit> {
    return this.request<GitHubRateLimit>('https://api.github.com/rate_limit');
  }

  // ===== Authenticated user methods (using user's GitHub OAuth token) =====

  // Get authenticated user's profile
  async getAuthenticatedUser(githubToken: string): Promise<GitHubUser> {
    const headers = this.createUserHeaders(githubToken);
    return this.request<GitHubUser>('https://api.github.com/user', headers);
  }

  // Get authenticated user's repositories (including private)
  async getAuthenticatedUserRepos(githubToken: string, perPage = 100, page = 1): Promise<GitHubRepository[]> {
    const headers = this.createUserHeaders(githubToken);
    const params = new URLSearchParams({
      sort: 'updated',
      direction: 'desc',
      per_page: String(perPage),
      page: String(page),
      affiliation: 'owner,collaborator,organization_member',
    });
    return this.request<GitHubRepository[]>(`https://api.github.com/user/repos?${params.toString()}`, headers);
  }

  // Get authenticated user's contributions via GraphQL
  async getAuthenticatedUserContributions(githubToken: string) {
    const headers = this.createUserHeaders(githubToken);
    const query = `
      query {
        viewer {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
          repositoriesContributedTo(first: 50) {
            totalCount
            nodes {
              nameWithOwner
              stargazerCount
              forkCount
              primaryLanguage { name }
            }
          }
        }
      }
    `;
    return this.requestGraphQL<{
      viewer: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: Array<{
              contributionDays: Array<{
                date: string;
                contributionCount: number;
                color: string;
              }>;
            }>;
          };
        };
        repositoriesContributedTo: {
          totalCount: number;
          nodes: Array<{
            nameWithOwner: string;
            stargazerCount: number;
            forkCount: number;
            primaryLanguage: { name: string } | null;
          }>;
        };
      };
    }>(query, {}, headers);
  }

  // Get authenticated user's gists
  async getAuthenticatedUserGists(githubToken: string, perPage = 50): Promise<GitHubGist[]> {
    const headers = this.createUserHeaders(githubToken);
    const params = new URLSearchParams({ per_page: String(perPage) });
    return this.request<GitHubGist[]>(`https://api.github.com/gists?${params.toString()}`, headers);
  }

  // Get authenticated user's starred repositories
  async getAuthenticatedUserStarredRepos(githubToken: string, perPage = 50): Promise<GitHubRepository[]> {
    const headers = this.createUserHeaders(githubToken);
    const params = new URLSearchParams({ per_page: String(perPage), sort: 'created', direction: 'desc' });
    return this.request<GitHubRepository[]>(`https://api.github.com/user/starred?${params.toString()}`, headers);
  }

  // Get authenticated user's following
  async getAuthenticatedUserFollowing(githubToken: string, perPage = 50): Promise<GitHubUser[]> {
    const headers = this.createUserHeaders(githubToken);
    const params = new URLSearchParams({ per_page: String(perPage) });
    return this.request<GitHubUser[]>(`https://api.github.com/user/following?${params.toString()}`, headers);
  }

  // Get authenticated user's organizations
  async getAuthenticatedUserOrgs(githubToken: string): Promise<GitHubOrganization[]> {
    const headers = this.createUserHeaders(githubToken);
    return this.request<GitHubOrganization[]>('https://api.github.com/user/orgs', headers);
  }
}

export const githubService = new GitHubService();
