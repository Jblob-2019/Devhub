import crypto from 'node:crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../services/auth.js';
import { createUser, findUserByEmail, findUserByGithubId, findUserById, linkGithubToUser, updateGithubAccessToken } from '../models/user.js';
import { encryptToken } from '../services/crypto.js';

const router = Router();

// ── One-time session exchange tokens ────────────────────────────────────────
// Browsers do not reliably persist Set-Cookie headers that arrive on cross-origin
// 302 redirects. Instead the OAuth callback creates a short-lived (60 s) single-use
// OTP, redirects the browser to the frontend with ?token=<otp>, and the frontend
// calls GET /api/auth/session?token=<otp> with credentials:'include'. That XHR
// response sets the cookie cleanly so the browser stores it.
interface OtpEntry { jwt: string; expiresAt: number; }
const otpStore = new Map<string, OtpEntry>();

// Purge expired entries lazily on each new creation (no background timer needed).
const createOtp = (jwt: string): string => {
  const now = Date.now();
  for (const [k, v] of otpStore) {
    if (v.expiresAt <= now) otpStore.delete(k);
  }
  const otp = crypto.randomUUID();
  otpStore.set(otp, { jwt, expiresAt: now + 60_000 });
  return otp;
};

// Validation Schemas
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
  req.validatedBody = result.data as z.infer<T>;
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

const getOauthStateCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: 10 * 60 * 1000,
  };
};

router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.validatedBody as RegisterInput;
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

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.validatedBody as LoginInput;
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

router.post('/logout', (req, res) => {
  res.clearCookie('session', getCookieOptions());
  res.clearCookie('oauth_state', getCookieOptions());
  res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.session;
  const cookieHeader = req.headers.cookie;
  // Safe diagnostics — never log the actual token/cookie values.
  console.log(JSON.stringify({
    label: 'me:request',
    ts: new Date().toISOString(),
    origin: req.headers.origin ?? null,
    hasCookieHeader: !!cookieHeader,
    cookieNames: cookieHeader
      ? cookieHeader.split(';').map(c => c.split('=')[0].trim())
      : [],
    hasSessionToken: !!token,
  }));
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
  res.cookie('oauth_state', state, getOauthStateCookieOptions());
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

  try {
    log('oauth:start', { hasCode: !!req.query.code, hasState: !!req.query.state, hasCookieState: !!req.cookies?.oauth_state });

    const { code, state } = req.query as Record<string, string>;
    const storedState = req.cookies?.oauth_state;

    if (!code || !state || !storedState || state !== storedState) {
      log('oauth:invalid_state', { state, storedState });
      return res.redirect(`${getFrontendUrl()}/auth/callback?error=invalid_state`);
    }

    // Clear the state cookie without maxAge
    res.clearCookie('oauth_state', getCookieOptions());

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      log('oauth:missing_credentials');
      return res.redirect(`${getFrontendUrl()}/auth/callback?error=configuration_error`);
    }

    // Exchange code for access token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getGithubCallbackUrl(),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const tokenData = await tokenResp.json() as { error?: string; error_description?: string; access_token?: string };
    if (!tokenResp.ok || tokenData.error || !tokenData.access_token) {
      log('oauth:token_error', { error: tokenData.error, error_description: tokenData.error_description });
      return res.redirect(`${getFrontendUrl()}/auth/callback?error=token_exchange_failed`);
    }

    const githubAccessToken = tokenData.access_token;

    // Fetch GitHub user info
    const userResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!userResp.ok) {
      log('oauth:user_fetch_failed', { status: userResp.status });
      return res.redirect(`${getFrontendUrl()}/auth/callback?error=user_fetch_failed`);
    }

    const githubUser = await userResp.json() as {
      id: number;
      login: string;
      name?: string | null;
      email?: string | null;
      avatar_url?: string;
    };

    // Fetch user email if not public
    let githubEmail = githubUser.email;
    if (!githubEmail) {
      const emailsResp = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: 'application/vnd.github+json',
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (emailsResp.ok) {
        const emails = await emailsResp.json() as Array<{ primary?: boolean; verified?: boolean; email?: string }>;
        const primary = emails.find(e => e.primary && e.verified);
        githubEmail = primary?.email ?? emails[0]?.email;
      }
    }

    if (!githubEmail) {
      log('oauth:no_email', { githubId: githubUser.id });
      return res.redirect(`${getFrontendUrl()}/auth/callback?error=no_email`);
    }

    // Encrypt the GitHub OAuth access token before saving to database
    const encryptedToken = encryptToken(githubAccessToken);

    const githubIdStr = String(githubUser.id);

    // ── Account resolution (github_id is primary identity) ──────────────────
    // A. Find existing user by github_id — the authoritative lookup.
    let user = await findUserByGithubId(githubIdStr);
    log('oauth:lookup_by_github_id', { githubId: githubIdStr, found: !!user });

    if (user) {
      // A-hit: recognised GitHub account → just refresh the stored token.
      log('oauth:existing_github_user', { userId: user.id });
      user = await updateGithubAccessToken(user.id, encryptedToken);
    } else {
      // B. No github_id match → try email.
      const emailUser = await findUserByEmail(githubEmail);
      log('oauth:lookup_by_email', { email: githubEmail, found: !!emailUser });

      if (emailUser) {
        if (emailUser.github_id) {
          // C. Email user already linked to a *different* GitHub account → conflict.
          log('oauth:github_id_conflict', {
            userId: emailUser.id,
            existingGithubId: emailUser.github_id,
            incomingGithubId: githubIdStr,
          });
          return res.redirect(`${getFrontendUrl()}/auth/callback?error=account_conflict`);
        }

        // D. Email user exists but has no GitHub link → safe to link.
        log('oauth:linking_github_to_email_user', { userId: emailUser.id, githubId: githubIdStr });
        user = await linkGithubToUser(emailUser.id, githubIdStr, githubUser.login, githubUser.avatar_url, encryptedToken);
      } else {
        // E. No existing user at all → create a brand-new account.
        log('oauth:creating_new_user', { githubId: githubIdStr, email: githubEmail });
        user = await createUser({
          email: githubEmail,
          name: githubUser.name ?? githubUser.login,
          username: githubUser.login,
          avatar_url: githubUser.avatar_url,
          github_id: githubIdStr,
          github_username: githubUser.login,
          github_access_token: encryptedToken,
        });
      }
    }
    // ── End account resolution ───────────────────────────────────────────────

    const jwt = signJwt(user);
    const otp = createOtp(jwt);
    log('oauth:otp_issued', { userId: user.id, otpPrefix: otp.slice(0, 8) });
    // Redirect without setting cookie — cookie is set by the /session endpoint.
    res.redirect(`${getFrontendUrl()}/auth/callback?token=${otp}`);

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log('oauth:exception', { error: errorMsg });
    return res.redirect(`${getFrontendUrl()}/auth/callback?error=server_error`);
  }
});

// ── GET /session — exchange OTP for a session cookie ────────────────────────
// Called by the frontend /auth/callback page with credentials:'include'.
// Sets the httpOnly session cookie on an XHR response (reliable cross-origin).
router.get('/session', async (req, res) => {
  const otp = (req.query.token as string | undefined)?.trim();
  if (!otp) {
    console.log(JSON.stringify({ label: 'session:missing_token', ts: new Date().toISOString() }));
    return res.status(400).json({ error: 'missing_token' });
  }

  const entry = otpStore.get(otp);
  if (!entry) {
    console.log(JSON.stringify({ label: 'session:invalid_token', ts: new Date().toISOString() }));
    return res.status(401).json({ error: 'invalid_or_expired_token' });
  }

  if (entry.expiresAt <= Date.now()) {
    otpStore.delete(otp);
    console.log(JSON.stringify({ label: 'session:expired_token', ts: new Date().toISOString() }));
    return res.status(401).json({ error: 'invalid_or_expired_token' });
  }

  // Single-use — delete immediately.
  otpStore.delete(otp);

  const payload = verifyJwt(entry.jwt);
  if (!payload) {
    console.log(JSON.stringify({ label: 'session:invalid_jwt', ts: new Date().toISOString() }));
    return res.status(401).json({ error: 'invalid_jwt' });
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    console.log(JSON.stringify({ label: 'session:user_not_found', ts: new Date().toISOString() }));
    return res.status(404).json({ error: 'user_not_found' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  console.log(JSON.stringify({
    label: 'session:cookie_set',
    ts: new Date().toISOString(),
    userId: user.id,
    cookieOptions,
  }));

  res
    .cookie('session', entry.jwt, cookieOptions)
    .json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url,
      github_username: user.github_username,
      github_id: user.github_id,
    });
});

export default router;