import { Router } from 'express';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../services/auth.js';
import { createUser, findUserByEmail, findUserByGithubId, findUserById, linkGithubToUser } from '../models/user.js';

const router = Router();

// ---------- Email registration ----------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with that email already exists' });
  }
  const password_hash = await hashPassword(password);
  const user = await createUser({ name, email, password_hash });
  const token = signJwt(user);
  res
    .cookie('session', token, { httpOnly: true, secure: true, sameSite: 'lax' })
    .status(201)
    .json({ id: user.id, email: user.email, name: user.name });
});

// ---------- Email login ----------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signJwt(user);
  res
    .cookie('session', token, { httpOnly: true, secure: true, sameSite: 'lax' })
    .json({ id: user.id, email: user.email, name: user.name });
});

// ---------- Logout ----------
router.post('/logout', (req, res) => {
  res.clearCookie('session').json({ message: 'Logged out' });
});

// ---------- Current user ----------
router.get('/me', async (req, res) => {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  const user = await findUserById(payload.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url });
});

// ---------- GitHub OAuth start ----------
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.FRONTEND_URL || ''}/auth/github/callback`;
  const state = Math.random().toString(36).substring(2, 15); // simple CSRF token; in prod store in cookie / session
  res.cookie('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax' });
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=user:email&state=${state}`;
  res.redirect(githubAuthUrl);
});

// ---------- GitHub OAuth callback ----------
router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query as Record<string, string>;
  const storedState = req.cookies?.oauth_state;
  if (!code || !state || state !== storedState) {
    return res.status(400).json({ error: 'Invalid OAuth state' });
  }
  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.FRONTEND_URL || ''}/auth/github/callback`,
      state,
    }),
  });
  const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    return res.status(400).json({ error: 'Failed to obtain GitHub access token' });
  }
  // Fetch user profile
  const userResp = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${tokenData.access_token}`, Accept: 'application/json' },
  });
  const ghUser = (await userResp.json()) as { id: number; login: string; avatar_url?: string; email?: string };
  // Try to find existing user by github_id
  let user = await findUserByGithubId(String(ghUser.id));
  if (!user) {
    // If email is provided and matches an existing email‑based account, link them
    if (ghUser.email) {
      const emailUser = await findUserByEmail(ghUser.email);
      if (emailUser) {
        user = await linkGithubToUser(emailUser.id, String(ghUser.id), ghUser.login, ghUser.avatar_url);
      }
    }
  }
  if (!user) {
    // Create a brand‑new account
    user = await createUser({
      email: ghUser.email ?? `${ghUser.login}@github`, // placeholder if email hidden
      name: ghUser.login,
      github_id: String(ghUser.id),
      github_username: ghUser.login,
      avatar_url: ghUser.avatar_url,
    });
  }
  const jwtToken = signJwt(user);
  // Set session cookie and redirect back to frontend (or send JSON)
  res
    .cookie('session', jwtToken, { httpOnly: true, secure: true, sameSite: 'lax' })
    .redirect(process.env.FRONTEND_URL || '/');
});

export default router;
