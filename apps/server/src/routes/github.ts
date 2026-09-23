import { Router } from 'express';
import { GitHubService } from '../services/github.service.js';
import { requireAuth } from '../middleware/auth.js';
import { findUserById } from '../models/user.js';

const router = Router();
const gh = new GitHubService();

// Language color map for stats cards
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  HTML: '#e34c26',
  CSS: '#1572B6',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Other: '#8b949e',
};

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
      color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

// Helper: process contribution calendar into heatmap format
function processContributionCalendar(calendar: any) {
  if (!calendar?.weeks) return { total: 0, weeks: [] };

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
router.get('/search/repositories', async (req, res) => {
  const { q, per_page, page } = req.query as Record<string, string>;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  try {
    const result = await gh.searchRepositories(q, Number(per_page) || 20, Number(page) || 1);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'GitHub search failed' });
  }
});

// User (developer) search
router.get('/search/users', async (req, res) => {
  const { q, per_page, page } = req.query as Record<string, string>;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  try {
    const result = await gh.searchUsers(q, Number(per_page) || 20, Number(page) || 1);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'GitHub user search failed' });
  }
});

// Repository details
router.get('/repos/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const repoData = await gh.getRepository(owner, repo);
    const languages = await gh.getRepositoryLanguages(owner, repo);
    const contributors = await gh.getRepositoryContributors(owner, repo);
    const commits = await gh.getRepositoryCommits(owner, repo);
    res.json({ repo: repoData, languages, contributors, commits });
  } catch (e: any) {
    console.error(e);
    // Extract status from error message (format: "GitHub API error 404: ...")
    const statusMatch = e?.message?.match(/GitHub API error (\d+):/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : 500;
    if (status === 404) {
      return res.status(404).json({ error: 'Repository not found', status: 404 });
    }
    if (status === 403) {
      return res.status(403).json({ error: 'GitHub API rate limit exceeded or access forbidden', status: 403 });
    }
    if (status === 401) {
      return res.status(401).json({ error: 'GitHub authentication required', status: 401 });
    }
    res.status(status).json({ error: 'Failed to fetch repository data', status });
  }
});

// User profile details (basic)
router.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const userData = await gh.getUser(username);
    res.json(userData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Comprehensive developer profile endpoint
router.get('/users/:username/profile', async (req, res) => {
  const { username } = req.params;
  try {
    // Fetch all data in parallel
    const [userData, repos, events, contributions] = await Promise.all([
      gh.getUser(username),
      gh.getUserRepos(username, 100),
      gh.getUserEvents(username, 50),
      gh.getUserContributions(username).catch(() => null), // GraphQL may fail if no token scope
    ]);

    // Calculate stats from repos
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const repoCount = repos.length;

    // Language distribution
    const languageStats = aggregateLanguages(repos);

    // Contribution calendar
    const contributionsData = contributions?.user?.contributionsCollection?.contributionCalendar
      ? processContributionCalendar(contributions.user.contributionsCollection.contributionCalendar)
      : { total: 0, weeks: [] };

    // Activity timeline
    const activityTimeline = processEvents(events);

    // Repository grid data (top 12 by stars)
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
  } catch (e) {
    console.error('Profile fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch developer profile' });
  }
});

// Rate limit endpoint
router.get('/rate_limit', async (_req, res) => {
  try {
    const data = await gh.getRateLimit();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch rate limit' });
  }
});

// ===== Authenticated User Dashboard endpoint =====
// Returns comprehensive dashboard data for the currently logged-in user
router.get('/me/dashboard', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Fetch user from DB to get GitHub access token
    const dbUser = await findUserById(user.id);
    if (!dbUser || !dbUser.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected or token missing' });
    }

    const githubToken = dbUser.github_access_token;

    // Fetch all data in parallel using user's GitHub token
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

    // Calculate stats from repos (including private)
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const repoCount = repos.length;
    const privateRepoCount = repos.filter(r => r.private).length;
    const publicRepoCount = repoCount - privateRepoCount;

    // Language distribution from user's repos
    const languageStats = aggregateLanguages(repos);

    // Contribution calendar
    const contributionsData = contributions?.viewer?.contributionsCollection?.contributionCalendar
      ? processContributionCalendar(contributions.viewer.contributionsCollection.contributionCalendar)
      : { total: 0, weeks: [] };

    // Repositories contributed to
    const reposContributedTo = contributions?.viewer?.repositoriesContributedTo?.totalCount || 0;
    const contributedRepos = contributions?.viewer?.repositoriesContributedTo?.nodes || [];

    // Repository grid data (top repos by stars, including private)
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

    // Recent activity from events would require a different endpoint
    // For now, we'll use recent pushes to repos
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

    // Gists
    const gistData = gists.map(g => ({
      id: g.id,
      description: g.description,
      htmlUrl: g.html_url,
      files: Object.keys(g.files || {}),
      public: g.public,
      updatedAt: g.updated_at,
    }));

    // Starred repos
    const starredData = starredRepos.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      htmlUrl: r.html_url,
    }));

    // Following users
    const followingData = following.map(u => ({
      login: u.login,
      avatarUrl: u.avatar_url,
      htmlUrl: u.html_url,
    }));

    // Organizations
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
  } catch (e) {
    console.error('Dashboard fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Recommendations endpoint - requires authentication
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    // Get the authenticated user's GitHub info
    const user = (req as any).user;
    let query = 'stars:>1000';

    if (user?.github_username) {
      try {
        // Fetch user's repositories to analyze language preferences
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
  } catch (e) {
    console.error('Recommendations error:', e);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;