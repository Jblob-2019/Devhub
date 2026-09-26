# DevHub — Codebase Audit Report

**Generated:** 2026-09-26T17:16:02.434Z
**Auditor:** FRIDAY (AI Engineering Assistant)
**Scope:** Full codebase review of `Devhub/` workspace

---

## Executive Summary

The workspace contains **two distinct projects**:

| Project | Path | Status | Purpose |
|---------|------|--------|---------|
| **DevHub (Production)** | `my-app/` | **Active** | Full-stack monorepo: React frontend + Express backend + PostgreSQL |
| **DevHub Wireframe** | `dock/` | **Prototype** | Figma Make-generated wireframe/prototype (React 19, Vite, Tailwind v4) |

**Primary finding:** The production application (`my-app/`) is a well-structured monorepo with solid architectural foundations but has several **P1–P2 issues** requiring attention before production deployment. The `dock/` directory is a separate design prototype and should not be confused with the production codebase.

---

## Architecture Overview

### my-app/ (Production Monorepo)

```
my-app/
├── apps/
│   ├── client/          # React 18 + Vite + TypeScript + TanStack Query + Tailwind v4
│   └── server/          # Express + TypeScript + PostgreSQL (Supabase)
├── packages/
│   ├── ui/              # (empty - placeholder)
│   ├── shared-types/    # (empty - placeholder)
│   └── config/          # (empty - placeholder)
├── db/migrations/       # SQL migrations
├── infra/               # Docker, Nginx
└── .env                 # Production secrets (⚠️ COMMITTED)
```

### Technology Stack

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| Frontend Runtime | React | 18.3.1 | ✅ Current |
| Build Tool | Vite | 5.3.1 | ✅ Current |
| Styling | Tailwind CSS | 4.0.0 | ✅ Current (v4) |
| State/Cache | TanStack Query | 5.103.2 | ✅ Current |
| Routing | React Router | 6.23.0 | ✅ Current |
| Backend Runtime | Node.js | 20+ | ✅ Current |
| Framework | Express | 4.18.2 | ✅ Stable |
| Database | PostgreSQL (Supabase) | 15+ | ✅ Current |
| ORM/Query | Raw `pg` + SQL | — | ⚠️ No ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs | 9.0.2 / 2.4.3 | ✅ Standard |
| GitHub API | Native `fetch` + GraphQL | — | ✅ Modern |

---

## Critical Issues (P0 — System Failure)

### 🔴 P0-1: Production Secrets Committed to Repository
**File:** `my-app/.env`
**Severity:** CRITICAL — Immediate remediation required

The `.env` file contains **live production credentials**:
- `GITHUB_TOKEN` — GitHub Personal Access Token (classic)
- `JWT_SECRET` — Base64-encoded secret
- `GITHUB_CLIENT_SECRET` — OAuth client secret
- `DATABASE_URL` — Supabase PostgreSQL connection string with password
- `FRONTEND_URL` / `GITHUB_CALLBACK_URL` — Production URLs

**Impact:** Full compromise of GitHub API access, database, authentication system, and OAuth flow.

**Remediation:**
1. **Immediately rotate all secrets** (GitHub token, JWT secret, GitHub OAuth secret, database password)
2. Remove `.env` from git history (use `git filter-repo` or BFG Repo-Cleaner)
3. Add `.env` to `.gitignore` (already present in `.gitignore` but file was committed before)
4. Use environment variable injection in deployment (Render, Vercel, etc.)

---

### 🔴 P0-2: bcryptjs Version Mismatch
**Files:** 
- `my-app/package.json`: `bcryptjs@^3.0.3` (root)
- `my-app/apps/server/package.json`: `bcryptjs@^2.4.3` (server)

**Impact:** Version 3.x has different API (ESM-only, different exports). Server uses `import bcrypt from 'bcryptjs'` which works in v2 but **will fail in v3** with `Module not found` or `bcrypt.hash is not a function`.

**Fix:** Align to v2.4.3 (stable, CommonJS-compatible) or update server code for v3 ESM imports.

---

## High Priority Issues (P1 — Critical)

### 🟠 P1-1: No Input Validation on Auth Endpoints
**File:** `my-app/apps/server/src/routes/auth.ts`

Registration and login accept raw body without validation:
```typescript
const { name, email, password } = req.body;
// No validation: email format, password strength, name length
```

**Risk:** NoSQL injection (not applicable here but bad practice), weak passwords, malformed data in DB.

**Fix:** Add `zod` schemas (already in TRD spec) or `express-validator`.

---

### 🟠 P1-2: GitHub OAuth State Parameter Not Validated Properly
**File:** `my-app/apps/server/src/routes/auth.ts` (lines 90-120)

```typescript
const storedState = req.cookies?.oauth_state;
if (!code || !state || !storedState || state !== storedState) {
  return res.redirect(`${getFrontendUrl()}/login?error=invalid_state`);
}
```

**Issue:** The `oauth_state` cookie uses `lax` SameSite in development. If frontend is on different port (3000) vs backend (4000), cookie **may not be sent** in cross-origin redirect, causing valid OAuth flows to fail.

**Fix:** Use `SameSite: 'none'` + `Secure: true` with proper domain config, or proxy OAuth through same origin.

---

### 🟠 P1-3: No Rate Limiting on Auth Endpoints
**File:** `my-app/apps/server/src/index.ts`

No `express-rate-limit` on `/api/auth/login`, `/register`, `/github`. Vulnerable to brute-force and enumeration attacks.

**Fix:** Add rate limiter middleware (already in `devDependencies` but unused).

---

### 🟠 P1-4: CORS Configuration Allows Null Origin
**File:** `my-app/apps/server/src/index.ts`

```typescript
origin: (origin, callback) => {
  if (!origin) return callback(null, true);  // Allows non-browser clients
  // ...
}
```

**Risk:** Allows requests from `file://`, Postman, curl with no origin header. Should require explicit origin in production.

**Fix:** In production, reject requests with no origin: `if (!origin) return callback(new Error('Origin required'));`

---

### 🟠 P1-5: JWT Secret Fallback Missing Validation
**File:** `my-app/apps/server/src/services/auth.ts`

```typescript
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
};
```

**Issue:** Good that it throws, but no validation of **secret entropy** (min 32 chars for HS256). Current secret in `.env` appears to be base64-encoded but length unverified.

---

### 🟠 P1-6: Database Connection Pool Not Configured for Production
**File:** `my-app/apps/server/src/config/db.ts`

```typescript
pool = new Pool({ connectionString });
```

**Issues:**
- No `max` pool size (defaults to 10 — may exhaust Supabase limits)
- No `idleTimeoutMillis`, `connectionTimeoutMillis`
- No SSL configuration for Supabase (requires `ssl: { rejectUnauthorized: false }`)

**Fix:** Configure pool for Supabase:
```typescript
new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false }
})
```

---

### 🟠 P1-7: GitHub Token Used for All Requests (No Per-User Token Support)
**File:** `my-app/apps/server/src/services/github.service.ts`

The `GitHubService` class only uses the server-wide `GITHUB_TOKEN`. The `createUserHeaders` method exists but **is never used**. User-specific GitHub OAuth tokens (stored encrypted in `users.github_access_token`) are **never utilized** for authenticated GitHub API calls.

**Impact:** 
- All users share the same rate limit (5000 req/hr)
- Private repo access impossible
- User-specific actions (star, fork, watch) non-functional

**Fix:** Integrate `createUserHeaders` into routes that need user context (dashboard, user-specific actions).

---

### 🟠 P1-8: Missing Helmet Security Headers
**File:** `my-app/apps/server/src/index.ts`

`helmet` is in `devDependencies` but **not imported or used** in the Express app.

**Fix:** Add `app.use(helmet())` with appropriate CSP for SPA.

---

## Medium Priority Issues (P2 — High)

### 🟡 P2-1: No ORM / Type-Safe Database Layer
**Files:** `my-app/apps/server/src/config/db.ts`, `models/user.ts`

Raw SQL with `pg` Pool. No migration tooling (manual SQL files), no type safety between DB and TypeScript.

**Risk:** Runtime errors from schema drift, SQL injection if parameters mishandled (though parameterized queries used), no intellisense.

**Recommendation:** Adopt Prisma or Drizzle ORM (both in TRD spec).

---

### 🟡 P2-2: Duplicate Route Definitions (App.tsx vs AppRoutes.tsx)
**Files:** 
- `my-app/apps/client/src/App.tsx` — defines routes inline with `WithNav` wrapper
- `my-app/apps/client/src/routes/AppRoutes.tsx` — defines routes separately

**Issue:** `App.tsx` is the actual entry point (used in `main.tsx`). `AppRoutes.tsx` is **dead code** — not imported anywhere. Creates confusion.

**Fix:** Remove `AppRoutes.tsx` or refactor `App.tsx` to use it.

---

### 🟡 P2-3: AuthContext Race Condition on Refresh
**File:** `my-app/apps/client/src/context/AuthContext.tsx`

```typescript
const refresh = useCallback(async () => {
  setLoading(true);
  const u = await fetchCurrentUser();
  // ...
  setUser(u);
  setLoading(false);
}, [queryClient]);
```

**Issue:** Multiple simultaneous `refresh()` calls (e.g., on mount + on auth callback) can race. No deduplication or abort controller.

**Fix:** Add `isRefreshing` ref guard or use `useQuery` for auth state.

---

### 🟡 P2-4: Frontend API Base URL Empty String Default
**File:** `my-app/apps/client/src/lib/apiBase.ts`

```typescript
export const API_BASE = import.meta.env.VITE_API_URL ?? '';
```

**Issue:** If `VITE_API_URL` not set, requests go to `''/api/...` → relative to current page. Works in dev (Vite proxy) but **breaks in production** if env var missing.

**Fix:** Throw error or default to `window.location.origin` in production.

---

### 🟡 P2-5: No Error Boundary in React App
**File:** `my-app/apps/client/src/main.tsx`

No `<ErrorBoundary>` wrapper. Uncaught errors in components crash entire app.

**Fix:** Add `react-error-boundary` with fallback UI.

---

### 🟡 P2-6: Inconsistent TypeScript Configuration
| Config | Target | Module | Strict |
|--------|--------|--------|--------|
| Server | ES2020 | Node16 | ✅ |
| Client | ES2020 | ESNext (bundler) | ✅ |
| Root | — | — | — |

**Issue:** Client uses `bundler` module resolution but server uses `Node16`. Shared types in `packages/shared-types` (empty) would need compatible config.

---

### 🟡 P2-7: Empty Shared Packages
**Paths:** `my-app/packages/ui`, `shared-types`, `config`

Each contains only `.gitkeep`. Defeats purpose of monorepo structure.

**Fix:** Either populate with shared code or remove from workspaces.

---

### 🟡 P2-8: GitHub API Error Handling Exposes Internal Details
**File:** `my-app/apps/server/src/routes/github.ts`

```typescript
const statusMatch = e?.message?.match(/GitHub API error (d+):/);
const status = statusMatch ? parseInt(statusMatch[1], 10) : 500;
```

**Issue:** Parses error message string for status code. Fragile — if GitHub changes error format, breaks. Also returns raw GitHub error text to client in some paths.

**Fix:** Use `resp.status` directly from `fetch` response; sanitize error messages.

---

### 🟡 P2-9: No Request Validation on GitHub Routes
**File:** `my-app/apps/server/src/routes/github.ts`

Search endpoints accept raw `q` parameter without sanitization or length limits.

```typescript
const { q, per_page, page } = req.query as Record<string, string>;
```

**Risk:** DoS via expensive GitHub search queries, injection via `q` parameter.

**Fix:** Validate `q` length, sanitize, enforce max `per_page`.

---

### 🟡 P2-10: Frontend Uses Both TanStack Query AND Custom Store for Same Data
**Files:** `useDevHubStore.ts`, `useAuth.ts`, `Dashboard.tsx`

`useDevHubStore` (Zustand-like) manages `savedRepos`, `savedDevs`, `recentlyViewed` locally. But `Dashboard.tsx` uses `useQuery` for server data. Two sources of truth for favorites.

**Fix:** Single source of truth — either server state (TanStack Query) with optimistic updates, or client store synced to server.

---

## Low Priority Issues (P3–P4)

### 🔵 P3-1: Dockerfiles Are Empty Placeholders
**Files:** `my-app/infra/Dockerfile.client`, `Dockerfile.server`

```dockerfile
FROM node:20-alpine
```

**Fix:** Complete multi-stage builds for production.

---

### 🔵 P3-2: No Test Infrastructure
**Finding:** No `test` scripts, no `jest`, `vitest`, `playwright`, `supertest` in any `package.json`.

**TRD Spec:** Unit tests, integration tests, coverage targets defined but **not implemented**.

---

### 🔵 P3-3: No CI/CD Pipeline
**Finding:** `.github/workflows/ci.yml` exists in `my-app/.github/workflows/` but **empty/minimal**. No lint, typecheck, test, build, deploy steps.

---

### 🔵 P3-4: `dock/` Directory Confuses Project Root
**Issue:** `dock/` is a Figma Make prototype with its own `package.json`, `vite.config.ts`, `src/`. Developers may accidentally run commands in wrong directory.

**Recommendation:** Move to `design/wireframes/` or `.figma/prototype/`, or delete if not needed.

---

### 🔵 P3-5: Hardcoded Language Colors in Multiple Places
**Files:** 
- `my-app/apps/client/src/lib/utils.ts`
- `my-app/apps/server/src/routes/github.ts`
- `my-app/apps/client/src/pages/DeveloperProfile.tsx`

**Fix:** Centralize in `packages/shared-types` or `packages/config`.

---

### 🔵 P3-6: Console Logging in Production Code
**Files:** `my-app/apps/server/src/routes/auth.ts` (structured JSON logs), `github.service.ts`

`console.log` / `console.error` used directly. No structured logger (Pino, Winston).

---

### 🔵 P3-7: Missing `Content-Security-Policy` for SPA
**File:** `my-app/apps/server/src/index.ts`

No CSP header. Increases XSS risk.

---

### 🔵 P3-8: No API Versioning
**Routes:** `/api/auth`, `/api/github`, `/api/favorites`

No version prefix (`/api/v1/`). Breaking changes will require new domain or complex routing.

---

### 🔵 P3-9: Frontend Bundle Analysis Not Configured
**Recommendation:** Add `vite-plugin-bundle-analyzer` or `rollup-plugin-visualizer` to monitor bundle size.

---

### 🔵 P3-10: `devDependencies` Bleed into Root `package.json`
**File:** `my-app/package.json`

`bcryptjs`, `cookie-parser`, `jsonwebtoken` listed in root `dependencies` but only used in server. Root should only have `concurrently` and workspace tooling.

---

## Security Assessment

| Control | Status | Notes |
|---------|--------|-------|
| JWT in httpOnly cookies | ✅ Implemented | Secure in prod, lax in dev |
| Password hashing (bcrypt) | ✅ Implemented | Salt factor 10 |
| GitHub OAuth 2.0 | ✅ Implemented | PKCE not used (optional) |
| CORS lockdown | ⚠️ Partial | Null origin allowed |
| Rate limiting | ❌ Missing | Auth endpoints exposed |
| Helmet headers | ❌ Missing | Not imported |
| CSP | ❌ Missing | No policy |
| Input validation | ❌ Missing | No zod/validator |
| SQL injection protection | ✅ Parameterized queries | Raw SQL but params used |
| Secrets management | ❌ FAILED | `.env` committed |
| Dependency scanning | ❌ Missing | No `npm audit` in CI |

---

## Code Quality Metrics

| Metric | Client | Server |
|--------|--------|--------|
| TypeScript Strict Mode | ✅ | ✅ |
| ESLint Configured | ❌ (no config) | ❌ (no config) |
| Prettier Configured | ❌ (no config) | ❌ (no config) |
| Test Coverage | 0% | 0% |
| Dead Code | `AppRoutes.tsx` | `controllers/index.ts`, `middleware/index.ts`, `api.ts` |
| Bundle Size | Unknown (no analysis) | N/A |

---

## Documentation Status

| Document | Path | Status |
|----------|------|--------|
| README | `my-app/README.md` | ✅ Comprehensive |
| PRD | `dock/PRD.md` | ✅ Detailed |
| TRD | `dock/TRD.md` | ✅ Detailed |
| Phase 1 Plan | `agent/implementation_plan_phase1.md` | ✅ Complete |
| Phase 2 Plan | `agent/implementation_plan_phase2.md` | ✅ Complete |
| Architecture Diagram | TRD (Mermaid) | ✅ |
| API Reference | README | ✅ Partial |
| Deployment Guide | README | ✅ Render/Vercel |

---

## Deployment Readiness

| Environment | Client | Server | Database |
|-------------|--------|--------|----------|
| Local Dev | ✅ Vite proxy | ✅ tsx | ⚠️ Needs local PG or Supabase |
| Staging | ❌ Not configured | ❌ Not configured | ❌ |
| Production | ✅ Vercel (configured) | ✅ Render (configured) | ✅ Supabase |

**Blockers for Production:**
1. **P0-1**: Rotate all committed secrets
2. **P1-3**: Add rate limiting
3. **P1-8**: Add Helmet
4. **P1-6**: Fix DB pool config
5. **P3-1**: Complete Dockerfiles

---

## Recommendations Priority Matrix

### Immediate (This Week)
1. 🔴 **Rotate all secrets** — GitHub token, JWT secret, DB password, OAuth secret
2. 🔴 **Fix bcryptjs version** — Pin to 2.4.3 in root and server
3. 🔴 **Add rate limiting** to auth endpoints
3. 🔴 **Add Helmet** middleware
4. 🔴 **Fix DB pool** for Supabase SSL + limits

### Short Term (Next Sprint)
5. 🟠 Add input validation (zod) to all endpoints
6. 🟠 Fix OAuth state cookie SameSite for cross-origin dev
7. 🟠 Implement per-user GitHub token usage
8. 🟡 Remove dead code (`AppRoutes.tsx`, empty controllers/middleware)
9. 🟡 Add Error Boundary to React app
10. 🟡 Centralize language colors / shared constants

### Medium Term
11. 🟡 Adopt Prisma or Drizzle ORM
12. 🟡 Implement test infrastructure (Vitest + Playwright)
13. 🟡 Add CI/CD pipeline (GitHub Actions)
14. 🟡 Complete Dockerfiles
15. 🟡 API versioning (`/api/v1/`)
16. 🟡 Structured logging (Pino)
17. 🟡 CSP headers

### Long Term
18. 🔵 Populate shared packages or remove
19. 🔵 Bundle analysis
20. 🔵 Dependency scanning in CI
21. 🔵 Clean up `dock/` prototype directory

---

## File Inventory Summary

| Category | Count | Notes |
|----------|-------|-------|
| TypeScript/TSX (client) | ~35 | Well-organized |
| TypeScript (server) | ~15 | Clean separation |
| SQL Migrations | 2 | Users, favorites, github_token |
| Docker/Infra | 4 | Placeholders |
| Documentation | 8 | Comprehensive |
| Config files | 12 | TS, Vite, Tailwind, etc. |
| Prototype (dock) | ~20 | Separate project |

---

## Conclusion

**DevHub (`my-app/`) is a well-architected, feature-complete foundation** for a GitHub analytics platform. The codebase demonstrates:
- Clean separation of concerns (client/server)
- Modern tech stack (React 18, TanStack Query, Tailwind v4)
- Proper auth architecture (JWT + httpOnly cookies + GitHub OAuth)
- Thoughtful API design with caching strategy
- Comprehensive documentation (PRD, TRD, implementation plans)

**However, it is NOT production-ready** due to:
1. **Critical security failure** — live secrets committed
2. **Missing security controls** — rate limiting, Helmet, CSP, input validation
3. **Operational gaps** — no tests, no CI/CD, incomplete Docker, no monitoring

**Estimated effort to production-ready:** 2–3 weeks for a single developer addressing P0–P2 items.

---

## Appendix: Key Files Reference

### Production Entry Points
- Client: `my-app/apps/client/src/main.tsx` → `App.tsx`
- Server: `my-app/apps/server/src/index.ts`

### Auth Flow
1. `POST /api/auth/register` / `login` → sets `session` cookie
2. `GET /api/auth/me` → validates JWT, returns user
3. `GET /api/auth/github` → redirects to GitHub OAuth
4. `GET /api/auth/github/callback` → exchanges code, links account, sets cookie

### GitHub API Proxy
- `GET /api/github/search/repositories?q=`
- `GET /api/github/search/users?q=`
- `GET /api/github/repos/:owner/:repo`
- `GET /api/github/users/:username/profile`
- `GET /api/github/me/dashboard` (requires auth)

### Favorites API (requires auth)
- `GET /api/favorites`
- `POST /api/favorites` { type, target }
- `DELETE /api/favorites/:type/:target`

---

*End of Audit Report*
