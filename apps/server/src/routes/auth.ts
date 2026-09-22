import crypto from 'node:crypto';
import { Router } from 'express';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../services/auth.js';
import { createUser, findUserByEmail, findUserByGithubId, findUserById, linkGithubToUser } from '../models/user.js';

const router = Router();
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
if (!GITHUB_CALLBACK_URL) {
  throw new Error('GITHUB_CALLBACK_URL is not configured');
}
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error('FRONTEND_URL is not configured');
}

// Cookie configuration
// In development (HTTP), use 'lax' which works on localhost without HTTPS.
// In production (HTTPS), use 'none' with secure: true for cross-site cookies.
const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
};

const oauthCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 10 * 60 * 1000,
};

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
    .cookie('session', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(201)
    .json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url,
    });
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
    .cookie('session', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url,
    });
});

// ---------- Logout ----------
router.post('/logout', (req, res) => {
  res.clearCookie('session', cookieOptions);
  res.clearCookie('oauth_state', oauthCookieOptions);
  res.json({ message: 'Logged out' });
});

// ---------- Current user ----------
router.get('/me', async (req, res) => {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  const payload = verifyJwt(token as string);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  const user = await findUserById(payload.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatar_url: user.avatar_url,
    github_username: user.github_username,
    github_id: user.github_id,
  });
});

// ---------- GitHub OAuth start ----------
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GitHub OAuth is not configured' });
  }
  const state = crypto.randomUUID();
  res.cookie('oauth_state', state, oauthCookieOptions);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// ---------- GitHub OAuth callback ----------
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query as Record<string, string>;
    const storedState = req.cookies?.oauth_state;
    if (!code || !state || !storedState || state !== storedState) {
      return res.status(400).send('Invalid OAuth state');
    }
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
        state,
      }),
    });
    const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string; error_description?: string };
    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return res.status(400).send(tokenData.error_description || 'Failed to authenticate with GitHub');
    }
    const githubToken = tokenData.access_token;
    // Fetch GitHub user profile
    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!userResp.ok) {
      return res.status(400).send('Failed to fetch GitHub profile');
    }
    const ghUser = (await userResp.json()) as {
      id: number;
      login: string;
      name?: string | null;
      avatar_url?: string;
      email?: string | null;
    };
    // Fetch email if not provided
    let email = ghUser.email;
    if (!email) {
      const emailResp = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (emailResp.ok) {
        const emails = (await emailResp.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
        const primary = emails.find(e => e.primary && e.verified);
        email = primary?.email ?? emails.find(e => e.verified)?.email ?? null;
      }
    }
    const githubId = String(ghUser.id);
    let user = await findUserByGithubId(githubId);
    if (!user && email) {
      const emailUser = await findUserByEmail(email);
      if (emailUser) {
        user = await linkGithubToUser(emailUser.id, githubId, ghUser.login, ghUser.avatar_url);
      }
    }
    if (!user) {
      user = await createUser({
        email: email ?? `${ghUser.login}@github.local`,
        name: ghUser.name ?? ghUser.login,
        username: ghUser.login,
        github_id: githubId,
        github_username: ghUser.login,
        avatar_url: ghUser.avatar_url,
      });
    }
    const jwtToken = signJwt(user);
    res.clearCookie('oauth_state', oauthCookieOptions);
    res.cookie('session', jwtToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    // Redirect to frontend auth callback page to complete the flow
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    console.error('GitHub OAuth callback failed:', error);
    res.status(500).send('GitHub authentication failed');
  }
});

export default router;
