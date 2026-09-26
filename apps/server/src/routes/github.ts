import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GitHubService } from '../services/github.service.js';
import { requireAuth } from '../middleware/auth.js';
import { findUserById } from '../models/user.js';

const router = Router();
const gh = new GitHubService();

// --- Validation Schemas ---
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(500, 'Query too long'),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).max(10).optional().default(1),
});

const repoParamsSchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
});

const usernameParamsSchema = z.object({
  username: z.string().min(1).max(100),
});

type SearchQueryInput = z.infer<typeof searchQuerySchema>;
type RepoParamsInput = z.infer<typeof repoParamsSchema>;
type UsernameParamsInput = z.infer<typeof usernameParamsSchema>;

// Properly typed validation middleware
const validateQuery = <T extends z.ZodSchema>(schema: T) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  (req as any).validatedQuery = result.data as z.infer<T>;
  next();
};

const validateParams = <T extends z.ZodSchema>(schema: T) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  (req as any).validatedParams = result.data as z.infer<T>;
  next();
};

// Language colors inline (to avoid import issues with Node16 module resolution)
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Zig: '#ec915c',
  Other: '#8b949e',
};

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Other;
}

// Helper: aggregate language stats across repos
function aggregateLanguages(repos: any[]) {
  const langBytes: Record<string, number> = {};
  let totalBytes = 0;

  for (const repo of repos) {
    if (repo.language) {
      const bytes = repo.size * 1024; // approximate from repo size in KB
      langBytes[repo.language] = (langBytes[repo.language] || 0) + bytes;
      totalBytes += bytes;
    }
  }

  return Object.entries(langBytes)
    .map(([name, bytes]) => ({
      name,
      bytes,
      pct: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

// Helper: process contribution calendar into heatmap format
function processContributionCalendar(calendar: any) {  if (!calendar?.weeks) return { total: 0, weeks: [] };

  const total = calendar.totalContributions || 0;
  const weeks = calendar.weeks.map((week: any) => ({
    days: week.contributionDays.map((day: any) => ({
      date: day.date,
      count: day.contributionCount,
      color: day.color,
    })),
  }));

  return { total, weeks };
}

// Helper: process events into activity timeline
function processEvents(events: any[]) {
  return events
    .filter((e) => ['PushEvent', 'CreateEvent', 'IssuesEvent', 'PullRequestEvent', 'WatchEvent', 'ForkEvent', 'ReleaseEvent'].includes(e.type))
    .slice(0, 30)
    .map((e) => ({
      type: e.type,
      repo: e.repo?.name,
      repoUrl: e.repo?.url?.replace('api.github.com/repos', 'github.com'),
      createdAt: e.created_at,
      payload: e.payload,
    }));
}

// Repository search
router.get('/search/repositories', validateQuery(searchQuerySchema), async (req, res) => {
  const { q, per_page, page } = (req as any).validatedQuery as SearchQueryInput;
  try {
    const result = await gh.searchRepositories(q, per_page, page);
    res.json(result);
  } catch (e: any) {
    console.error('GitHub search error:', e);
    const status = e?.status ?? 500;
    const message = status === 403 ? 'GitHub API rate limit exceeded' : 'GitHub search failed';
    res.status(status).json({ error: message });
  }
});

// User (developer) search
router.get('/search/users', validateQuery(searchQuerySchema), async (req, res) => {
  const { q, per_page, page } = (req as any).validatedQuery as SearchQueryInput;
  try {
    const result = await gh.searchUsers(q, per_page, page);
    res.json(result);
  } catch (e: any) {
    console.error('GitHub user search error:', e);
    const status = e?.status ?? 500;
    const message = status === 403 ? 'GitHub API rate limit exceeded' : 'GitHub user search failed';
    res.status(status).json({ error: message });
  }
});

// Repository details
router.get('/repos/:owner/:repo', validateParams(repoParamsSchema), async (req, res) => {
  const { owner, repo } = (req as any).validatedParams as RepoParamsInput;
  try {
    const repoData = await gh.getRepository(owner, repo);
    const languages = await gh.getRepositoryLanguages(owner, repo);
    const contributors = await gh.getRepositoryContributors(owner, repo);
    const commits = await gh.getRepositoryCommits(owner, repo);
    res.json({ repo: repoData, languages, contributors, commits });
  } catch (e: any) {
    console.error('Repo fetch error:', e);
    const status = e?.status ?? 500;
    let message = 'Failed to fetch repository data';
    if (status === 404) message = 'Repository not found';
    else if (status === 403) message = 'GitHub API rate limit exceeded or access forbidden';
    else if (status === 401) message = 'GitHub authentication required';
    res.status(status).json({ error: message, status });
  }
});

// User profile details (basic)
router.get('/users/:username', validateParams(usernameParamsSchema), async (req, res) => {
  const { username } = (req as any).validatedParams as UsernameParamsInput;
  try {
    const userData = await gh.getUser(username);
    res.json(userData);
  } catch (e: any) {
    console.error('User fetch error:', e);
    const status = e?.status ?? 500;
    let message = 'Failed to fetch user data';
    if (status === 404) message = 'User not found';
    res.status(status).json({ error: message, status });
  }
});

// Comprehensive developer profile endpoint
router.get('/users/:username/profile', validateParams(usernameParamsSchema), async (req, res) => {
  const { username } = (req as any).validatedParams as UsernameParamsInput;
  try {
    const [userData, repos, events, contributions] = await Promise.all([
      gh.getUser(username),
      gh.getUserRepos(username, 100),
      gh.getUserEvents(username, 50),
      gh.getUserContributions(username).catch(() => null),
    ]);

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const repoCount = repos.length;

    const languageStats = aggregateLanguages(repos);

    const contributionsData = contributions?.user?.contributionsCollection?.contributionCalendar
      ? processContributionCalendar(contributions.user.contributionsCollection.contributionCalendar)
      : { total: 0, weeks: [] };

    const activityTimeline = processEvents(events);

    const topRepos = repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        updatedAt: r.updated_at,
        isPrivate: r.private,
        htmlUrl: r.html_url,
      }));

    res.json({
      user: {
        login: userData.login,
        name: userData.name,
        bio: userData.bio,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        location: userData.location,
        company: userData.company,
        blog: userData.blog,
        createdAt: userData.created_at,
      },
      stats: {
        repos: repoCount,
        stars: totalStars,
        forks: totalForks,
        followers: userData.followers,
        following: userData.following,
      },
      languages: languageStats,
      contributions: contributionsData,
      activity: activityTimeline,
      repositories: topRepos,
    });
  } catch (e: any) {
    console.error('Profile fetch error:', e);
    const status = e?.status ?? 500;
    let message = 'Failed to fetch developer profile';
    if (status === 404) message = 'User not found';
    else if (status === 403) message = 'GitHub API rate limit exceeded';
    res.status(status).json({ error: message, status });
  }
});

// Rate limit endpoint
router.get('/rate_limit', async (_req, res) => {
  try {
    const data = await gh.getRateLimit();
    res.json(data);
  } catch (e: any) {
    console.error('Rate limit fetch error:', e);
    const status = e?.status ?? 500;
    res.status(status).json({ error: 'Failed to fetch rate limit', status });
  }
});

// ===== Authenticated User Dashboard endpoint =====
router.get('/me/dashboard', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const dbUser = await findUserById(user.id);
    if (!dbUser || !dbUser.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected or token missing' });
    }

    const githubToken = dbUser.github_access_token;

    const [
      authUser,
      repos,
      contributions,
      gists,
      starredRepos,
      following,
      orgs,
    ] = await Promise.all([
      gh.getAuthenticatedUser(githubToken).catch(() => null),
      gh.getAuthenticatedUserRepos(githubToken, 100).catch(() => []),
      gh.getAuthenticatedUserContributions(githubToken).catch(() => null),
      gh.getAuthenticatedUserGists(githubToken, 50).catch(() => []),
      gh.getAuthenticatedUserStarredRepos(githubToken, 50).catch(() => []),
      gh.getAuthenticatedUserFollowing(githubToken, 50).catch(() => []),
      gh.getAuthenticatedUserOrgs(githubToken).catch(() => []),
    ]);

    if (!authUser) {
      return res.status(401).json({ error: 'GitHub token invalid or expired' });
    }

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const repoCount = repos.length;
    const privateRepoCount = repos.filter(r => r.private).length;
    const publicRepoCount = repoCount - privateRepoCount;

    const languageStats = aggregateLanguages(repos);

    const contributionsData = contributions?.viewer?.contributionsCollection?.contributionCalendar
      ? processContributionCalendar(contributions.viewer.contributionsCollection.contributionCalendar)
      : { total: 0, weeks: [] };

    const reposContributedTo = contributions?.viewer?.repositoriesContributedTo?.totalCount || 0;
    const contributedRepos = contributions?.viewer?.repositoriesContributedTo?.nodes || [];

    const topRepos = repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 20)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        updatedAt: r.updated_at,
        isPrivate: r.private,
        htmlUrl: r.html_url,
        owner: r.owner?.login,
        ownerAvatar: r.owner?.avatar_url,
      }));

    const recentActivity = repos
      .filter(r => r.pushed_at)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 10)
      .map(r => ({
        type: 'PushEvent',
        repo: r.full_name,
        repoUrl: r.html_url,
        createdAt: r.pushed_at,
        payload: { ref: r.default_branch },
      }));

    const gistData = gists.map(g => ({
      id: g.id,
      description: g.description,
      htmlUrl: g.html_url,
      files: Object.keys(g.files || {}),
      public: g.public,
      updatedAt: g.updated_at,
    }));

    const starredData = starredRepos.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      htmlUrl: r.html_url,
    }));

    const followingData = following.map(u => ({
      login: u.login,
      avatarUrl: u.avatar_url,
      htmlUrl: u.html_url,
    }));

    const orgsData = orgs.map(o => ({
      login: o.login,
      avatarUrl: o.avatar_url,
      htmlUrl: o.html_url,
    }));

    res.json({
      user: {
        login: authUser.login,
        name: authUser.name,
        bio: authUser.bio,
        avatarUrl: authUser.avatar_url,
        htmlUrl: authUser.html_url,
        followers: authUser.followers,
        following: authUser.following,
        publicRepos: authUser.public_repos,
        totalRepos: repoCount,
        location: authUser.location,
        company: authUser.company,
        blog: authUser.blog,
        createdAt: authUser.created_at,
        email: authUser.email,
      },
      stats: {
        repos: repoCount,
        publicRepos: publicRepoCount,
        privateRepos: privateRepoCount,
        stars: totalStars,
        forks: totalForks,
        followers: authUser.followers,
        following: authUser.following,
        contributions: contributionsData.total,
        reposContributedTo,
        gists: gists.length,
        starredRepos: starredRepos.length,
      },
      languages: languageStats,
      contributions: contributionsData,
      repositories: topRepos,
      recentActivity,
      contributedRepos,
      gists: gistData,
      starredRepos: starredData,
      following: followingData,
      organizations: orgsData,
    });
  } catch (e: any) {
    console.error('Dashboard fetch error:', e);
    const status = e?.status ?? 500;
    let message = 'Failed to fetch dashboard data';
    if (status === 401) message = 'GitHub token invalid or expired';
    else if (status === 403) message = 'GitHub API rate limit exceeded';
    res.status(status).json({ error: message, status });
  }
});

// Recommendations endpoint - requires authentication
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    let query = 'stars:>1000';

    if (user?.github_username) {
      try {
        const userRepos = await gh.searchRepositories(`user:${user.github_username}`, 100);
        const languageCounts: Record<string, number> = {};

        for (const repo of userRepos.items || []) {
          try {
            const languages = await gh.getRepositoryLanguages(repo.owner.login, repo.name);
            for (const [lang, bytes] of Object.entries(languages)) {
              languageCounts[lang] = (languageCounts[lang] || 0) + (bytes as number);
            }
          } catch {
            // Skip repos that fail
          }
        }

        const preferredLanguages = Object.entries(languageCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([lang]) => lang);

        if (preferredLanguages.length > 0) {
          query = preferredLanguages.map(l => `language:${l}`).join(' ') + ' stars:>100';
        }
      } catch {
        // Fallback to default query
      }
    }

    const result = await gh.searchRepositories(query, 20);
    res.json(result.items || []);
  } catch (e: any) {
    console.error('Recommendations error:', e);
    const status = e?.status ?? 500;
    let message = 'Failed to fetch recommendations';
    if (status === 403) message = 'GitHub API rate limit exceeded';
    res.status(status).json({ error: message, status });
  }
});

export default router;
