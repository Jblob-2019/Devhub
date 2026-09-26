import crypto from 'node:crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../services/auth.js';
import { createUser, findUserByEmail, findUserByGithubId, findUserById, linkGithubToUser, updateGithubAccessToken } from '../models/user.js';

const router = Router();

// --- Validation Schemas ---
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

// Properly typed validation middleware
const validateBody = <T extends z.ZodSchema>(schema: T) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  (req as any).validatedBody = result.data as z.infer<T>;
  next();
};

const getGithubCallbackUrl = () => {
  const url = process.env.GITHUB_CALLBACK_URL;
  if (!url) throw new Error('GITHUB_CALLBACK_URL is not configured');
  return url;
};

const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL;
  if (!url) throw new Error('FRONTEND_URL is not configured');
  return url;
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    path: '/',
  };
};

const getOauthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? ('none' as const) : ('lax' as const);
  return {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/',
    maxAge: 10 * 60 * 1000,
  };
};

// ---------- Email registration ----------
router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = (req as any).validatedBody as RegisterInput;
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with that email already exists' });
  }
  const password_hash = await hashPassword(password);
  const user = await createUser({ name, email, password_hash });
  const token = signJwt(user);
  res
    .cookie('session', token, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
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
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = (req as any).validatedBody as LoginInput;
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
    .cookie('session', token, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
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
  res.clearCookie('session', getCookieOptions());
  res.clearCookie('oauth_state', getOauthCookieOptions());
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
  res.cookie('oauth_state', state, getOauthCookieOptions());
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGithubCallbackUrl(),
    scope: 'read:user user:email',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// ---------- GitHub OAuth callback ----------
router.get('/github/callback', async (req, res) => {
  const log = (label: string, meta?: Record<string, unknown>) => {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { label, ts: new Date().toISOString(), env: isProd ? 'production' : 'development' };
    if (meta) console.log(JSON.stringify({ ...base, ...meta }));
    else console.log(JSON.stringify(base));
  };

  const startTime = Date.now();

  try {
    log('oauth:start', { hasCode: !!req.query.code, hasState: !!req.query.state, hasCookieState: !!req.cookies?.oauth_state });

    const { code, state } = req.query as Record<string, string>;
    const storedState = req.cookies?.oauth_state;

    if (!code || !state || !storedState || state !== storedState) {
      log('oauth:invalid_state', { state, storedState });
      return res.redirect(`${getFrontendUrl()}/login?error=invalid_state`);
    }

    // Clear the state cookie
    res.clearCookie('oauth_state', getOauthCookieOptions());

    // Exchange code for access token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: getGithubCallbackUrl(),
      }),
    });

    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || tokenData.error) {
      log('oauth:token_error', { error: tokenData.error, error_description: tokenData.error_description });
      return res.redirect(`${getFrontendUrl()}/login?error=token_exchange_failed`);
    }

    const githubAccessToken = tokenData.access_token;

    // Fetch GitHub user info
    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userResp.ok) {
      log('oauth:user_fetch_failed', { status: userResp.status });
      return res.redirect(`${getFrontendUrl()}/login?error=user_fetch_failed`);
    }

    const githubUser = await userResp.json();

    // Fetch user email if not public
    let githubEmail = githubUser.email;
    if (!githubEmail) {
      const emailsResp = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });
      if (emailsResp.ok) {
        const emails = await emailsResp.json();
        const primary = emails.find((e: any) => e.primary && e.verified);
        githubEmail = primary?.email ?? emails[0]?.email;
      }
    }

    if (!githubEmail) {
      log('oauth:no_email', { githubId: githubUser.id });
      return res.redirect(`${getFrontendUrl()}/login?error=no_email`);
    }

    // Find or create user
    let user = await findUserByEmail(githubEmail);
    if (!user) {
      user = await findUserByGithubId(String(githubUser.id));
    }

    if (user) {
      // Link GitHub account if not already linked
      if (!user.github_id) {
        user = await linkGithubToUser(user.id, String(githubUser.id), githubUser.login, githubUser.avatar_url, githubAccessToken);
      } else {
        // Update access token
        user = await updateGithubAccessToken(user.id, githubAccessToken);
      }
    } else {
      // Create new user
      user = await createUser({
        email: githubEmail,
        name: githubUser.name ?? githubUser.login,
        username: githubUser.login,
        avatar_url: githubUser.avatar_url,
        github_id: String(githubUser.id),
        github_username: githubUser.login,
        github_access_token: githubAccessToken,
      });
    }

    const token = signJwt(user);
    res
      .cookie('session', token, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
      .redirect(getFrontendUrl());

  } catch (err: any) {
    log('oauth:exception', { error: err?.message ?? String(err) });
    return res.redirect(`${getFrontendUrl()}/login?error=server_error`);
  }
});

export default router;
