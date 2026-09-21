import { Router } from 'express';
import { GitHubService } from '../services/github.service.js';

const router = Router();
const gh = new GitHubService();

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
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch repository data' });
  }
});

// User profile details
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

export default router;
