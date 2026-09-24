import crypto from 'node:crypto';
import { Router } from 'express';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../services/auth.js';
import { createUser, findUserByEmail, findUserByGithubId, findUserById, linkGithubToUser, updateGithubAccessToken } from '../models/user.js';

const router = Router();

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
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: 10 * 60 * 1000,
  };
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
      log('oauth:state-mismatch', { hasCode: !!code, hasState: !!state, hasStoredState: !!storedState, stateMatch: state === storedState });
      return res.status(400).send('Invalid OAuth state');
    }
    log('oauth:state-ok');

    // 1. Exchange code for access token
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
        redirect_uri: getGithubCallbackUrl(),
        state,
      }),
    });
    const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string; error_description?: string; token_type?: string; scope?: string };
    if (!tokenData.access_token) {
      log('oauth:token-exchange:failed', { ghStatus: tokenResponse.status, ghError: tokenData.error, ghErrorDesc: tokenData.error_description });
      return res.status(400).send(tokenData.error_description || 'Failed to authenticate with GitHub');
    }
    log('oauth:token-exchange:ok', { tokenType: tokenData.token_type, scope: tokenData.scope });

    const githubToken = tokenData.access_token;

    // 2. Fetch GitHub user profile
    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!userResp.ok) {
      log('oauth:user:failed', { ghStatus: userResp.status });
      return res.status(400).send('Failed to fetch GitHub profile');
    }
    const ghUser = (await userResp.json()) as {
      id: number;
      login: string;
      name?: string | null;
      avatar_url?: string;
      email?: string | null;
    };
    log('oauth:user:ok', { ghLogin: ghUser.login, ghId: ghUser.id, hasEmail: !!ghUser.email });

    // 3. Fetch email if not provided
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
        log('oauth:email:ok', { emailFound: !!email, emailCount: emails.length });
      } else {
        log('oauth:email:failed', { ghStatus: emailResp.status });
      }
    } else {
      log('oauth:email:ok', { source: 'user-profile' });
    }

    // 4. Find or create user
    const githubId = String(ghUser.id);
    log('oauth:db-find-by-github-id:start', { githubId });

    let user = await findUserByGithubId(githubId);
    log('oauth:db-find-by-github-id:ok', { userFound: !!user, userId: user?.id });

    if (!user && email) {
      log('oauth:db-find-by-email:start', { email });
      const emailUser = await findUserByEmail(email);
      log('oauth:db-find-by-email:ok', { userFound: !!emailUser, userId: emailUser?.id });

      if (emailUser) {
        log('oauth:db-link:start', { userId: emailUser.id });
        user = await linkGithubToUser(emailUser.id, githubId, ghUser.login, ghUser.avatar_url, githubToken);
        log('oauth:db-link:ok', { userId: user?.id });
      }
    }

    if (!user) {
      log('oauth:db-create:start', { email: email ?? `${ghUser.login}@github.local`, username: ghUser.login });
      user = await createUser({
        email: email ?? `${ghUser.login}@github.local`,
        name: ghUser.name ?? ghUser.login,
        username: ghUser.login,
        github_id: githubId,
        github_username: ghUser.login,
        avatar_url: ghUser.avatar_url,
        github_access_token: githubToken,
      });
      log('oauth:db-create:ok', { userId: user?.id });
    } else if (user && githubToken) {
      // Update GitHub access token for existing user
      log('oauth:db-token-update:start', { userId: user.id });
      await updateGithubAccessToken(user.id, githubToken);
      log('oauth:db-token-update:ok', { userId: user.id });
    }

    // 5. Sign JWT
    log('oauth:jwt:start', { userId: user.id });
    const jwtToken = signJwt(user);
    log('oauth:jwt:ok');

    // 6. Set session cookie and redirect
    log('oauth:session-cookie:set', { hasCookieOptions: true });
    res.clearCookie('oauth_state', getOauthCookieOptions());
    res.cookie('session', jwtToken, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

    const redirectUrl = `${getFrontendUrl()}/auth/callback`;
    log('oauth:redirect', { redirectUrl, totalMs: Date.now() - startTime });
    res.redirect(redirectUrl);
  } catch (error: any) {
    // Safe error logging - never log secrets
    const safeError = {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      // Include PostgreSQL error code if available (e.g., 42703 = undefined_column)
      pgCode: error?.code,
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    };
    log('oauth:error', { ...safeError, totalMs: Date.now() - startTime });

    // Determine user-facing message based on error type
    let userMessage = 'GitHub authentication failed';
    const isProd = process.env.NODE_ENV === 'production';

    // Network errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.message?.includes('fetch failed')) {
      userMessage = 'Unable to reach GitHub. Please try again.';
    }
    // Database schema errors - missing column (PostgreSQL error code 42703 = undefined_column)
    else if (error?.code === '42703' || error?.message?.includes('column "github_access_token"') || error?.message?.includes('github_access_token') || error?.message?.includes('DATABASE_URL') || error?.message?.includes('relation')) {
      userMessage = 'Database schema outdated. Please contact support to run migrations.';
    }
    // JWT configuration errors
    else if (error?.message?.includes('JWT_SECRET')) {
      userMessage = 'Server configuration error. Please contact support.';
    }
    // GitHub OAuth specific errors
    else if (error?.message?.includes('bad_verification_code') || error?.message?.includes('invalid_grant')) {
      userMessage = 'GitHub authorization code expired or invalid. Please try logging in again.';
    }

    if (!isProd) {
      return res.status(500).json({ error: userMessage, debug: safeError });
    }
    res.status(500).send(userMessage);
  }
});

export default router;
