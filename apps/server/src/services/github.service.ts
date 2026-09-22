// import fetch from 'node-fetch';

/**
 * Centralized GitHub API service.
 * All requests are proxied through the backend using the server-side GITHUB_TOKEN.
 * The service returns JSON responses directly to the frontend.
 */
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

  private async request<T>(url: string): Promise<T> {
    this.ensureConfig();
    const resp = await fetch(url, { headers: this.headers! });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`GitHub API error ${resp.status}: ${err}`);
    }
    return (await resp.json()) as T;
  }

  private async requestGraphQL<T>(query: string, variables: Record<string, any>): Promise<T> {
    this.ensureConfig();
    const resp = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: this.headers!,
      body: JSON.stringify({ query, variables }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`GitHub GraphQL error ${resp.status}: ${err}`);
    }
    const result = await resp.json();
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    return result.data as T;
  }

  // Search repositories by query string
  async searchRepositories(query: string, perPage = 20, page = 1) {
    const params = new URLSearchParams({
      q: query,
      per_page: String(perPage),
      page: String(page),
    });
    return this.request<any>(`https://api.github.com/search/repositories?${params.toString()}`);
  }

  // Search users (developers) by query
  async searchUsers(query: string, perPage = 20, page = 1) {
    const params = new URLSearchParams({
      q: query,
      per_page: String(perPage),
      page: String(page),
    });
    return this.request<any>(`https://api.github.com/search/users?${params.toString()}`);
  }

  // Get repository details
  async getRepository(owner: string, repo: string) {
    return this.request<any>(`https://api.github.com/repos/${owner}/${repo}`);
  }

  // Get repository languages
  async getRepositoryLanguages(owner: string, repo: string) {
    return this.request<Record<string, number>>(`https://api.github.com/repos/${owner}/${repo}/languages`);
  }

  // Get repository contributors (first 100)
  async getRepositoryContributors(owner: string, repo: string) {
    return this.request<any>(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`);
  }

  // Get repository commits (latest)
  async getRepositoryCommits(owner: string, repo: string, perPage = 20, page = 1) {
    const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
    return this.request<any>(`https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`);
  }

  // Get user (developer) profile by username
  async getUser(username: string) {
    return this.request<any>(`https://api.github.com/users/${username}`);
  }

  // Get user repositories (public, sorted by stars)
  async getUserRepos(username: string, perPage = 100) {
    const params = new URLSearchParams({
      sort: 'stars',
      direction: 'desc',
      per_page: String(perPage),
      type: 'public',
    });
    return this.request<any[]>(`https://api.github.com/users/${username}/repos?${params.toString()}`);
  }

  // Get user events (public activity)
  async getUserEvents(username: string, perPage = 50) {
    const params = new URLSearchParams({ per_page: String(perPage) });
    return this.request<any[]>(`https://api.github.com/users/${username}/events/public?${params.toString()}`);
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
  async getRateLimit() {
    return this.request<any>('https://api.github.com/rate_limit');
  }
}
