# DevHub — Complete Current Codebase Audit Report

**Repository:** `Jblob-2019/Devhub`  
**Branch audited:** `main`  
**Audit date:** 2026-09-27  
**Audit type:** Full source-level architecture, runtime-flow, logic, data-integrity, security, API, routing, and UI/UX audit.

## Audit scope

The current public repository was inspected across the core client/server code paths, including:

- application bootstrap and routing
- authentication and GitHub OAuth
- auth/session middleware
- database user/favorites access
- GitHub API service
- GitHub API routes
- Home
- Explore
- Developer Profile
- Repository Details
- Dashboard
- Saved Items
- mobile navigation
- API base/environment configuration
- TypeScript configuration
- database migrations
- Vercel configuration
- package/build configuration

**Important:** this report is a source-level audit of the accessible repository. It does not claim that Render/Vercel runtime behavior was executed from this audit environment. Runtime-only checks must be verified by running the application.

---

# Executive Summary

The codebase has a reasonable full-stack structure and several previous fixes are present, but the current `main` branch is **not acceptance-ready**.

The highest-impact problems are:

1. **GitHub OAuth backend callback route is wrong.**
2. **GitHub OAuth access tokens are stored as plaintext despite the migration/documentation claiming encryption.**
3. **Explore pagination/sorting changes are only partially implemented and currently do not fully work.**
4. **Explore has a major client-side filtering bug that can hide valid API results.**
5. **Home still contains fabricated production analytics and hardcoded recently viewed repositories.**
6. **Dashboard contains a broken `/settings` navigation path and non-functional repository creation controls.**
7. **Repository Star/Watch/Fork controls are local UI state, not GitHub actions.**
8. **Repository commit/contributor counts are page-result counts, not repository totals.**
9. **Saved Collections are hardcoded fake data.**
10. **Favorites store performs redundant requests and can silently show incorrect state when API calls fail.**
11. **Developer/mobile flows contain incomplete data/navigation behavior.**
12. **There is still extensive `any`, `@ts-ignore`, and weak API typing despite strict TypeScript configuration.**
13. **Several routes/components are dead or duplicated.**
14. **GitHub recommendation logic can issue up to ~100 additional language requests for one recommendation request.**
15. **GitHub API requests have no explicit timeout.**

---

# Severity Legend

- 🔴 **CRITICAL** — authentication/security/data-integrity/runtime failure
- 🟠 **HIGH** — major functionality is incorrect or misleading
- 🟡 **MEDIUM** — broken/incomplete behavior or maintainability problem
- 🔵 **LOW** — polish/cleanup

---

# 🔴 CRITICAL FINDINGS

## C-001 — GitHub OAuth callback route is incorrect

### Evidence

`apps/server/src/index.ts` mounts:

```ts
app.use('/api/auth', authRouter);
```

But `apps/server/src/routes/auth.ts` defines:

```ts
router.get('/auth/callback', async (req, res) => {
```

Therefore Express exposes:

```text
/api/auth/auth/callback
```

not:

```text
/api/auth/github/callback
```

The environment template and OAuth design expect:

```text
/api/auth/github/callback
```

### Correct solution

Change:

```ts
router.get('/auth/callback', async (req, res) => {
```

to:

```ts
router.get('/github/callback', async (req, res) => {
```

Keep the frontend callback separate:

```text
/auth/callback
```

### Correct flow

```text
/api/auth/github
        ↓
GitHub
        ↓
/api/auth/github/callback
        ↓
session cookie
        ↓
/auth/callback
        ↓
/api/auth/me
        ↓
/home
```

---

## C-002 — GitHub OAuth access tokens are stored plaintext

### Evidence

The database migration says:

```sql
COMMENT ON COLUMN public.users.github_access_token
IS 'Encrypted GitHub OAuth access token for user-specific API calls';
```

But the actual model directly writes:

```ts
github_access_token: user.github_access_token
```

and:

```ts
UPDATE users
SET github_access_token = $1
```

The OAuth route directly passes:

```ts
githubAccessToken
```

into the database.

There is no encryption/decryption implementation in the inspected authentication path.

### Risk

A database compromise exposes users' GitHub OAuth access tokens.

### Correct solution

Implement server-side authenticated encryption, preferably AES-256-GCM.

Flow:

```text
GitHub OAuth token
       ↓
encrypt()
       ↓
PostgreSQL
       ↓
decrypt()
       ↓
GitHub API
```

Use a server-only environment secret such as:

```env
GITHUB_TOKEN_ENCRYPTION_KEY=...
```

Never expose this key or the OAuth token through `VITE_*`.

---

## C-003 — Explore pagination/sort implementation is incomplete

The frontend currently calls:

```ts
searchRepositories(fullQuery, page, 20, sortParam)
```

which is good.

However, the backend schema only defines:

```ts
q
per_page
page
```

and the backend calls:

```ts
gh.searchRepositories(q, per_page, page)
```

The `sort` query parameter is not validated, extracted, or passed to the GitHub service.

The GitHub service also defines:

```ts
async searchRepositories(query: string, perPage = 20, page = 1)
```

with no `sort` argument.

### Result

The UI exposes:

```text
Stars
Forks
Updated
Relevance
```

but the selected sort does not reliably reach GitHub.

### Correct solution

Add:

```ts
sort: z.enum(['stars', 'forks', 'updated']).optional()
```

and pass it through:

```text
Explore
→ githubApi
→ Express route
→ GitHubService
→ GitHub API
```

---

## C-004 — Explore refetch dependencies are wrong

The effect currently has:

```ts
useEffect(() => {
   ...
}, [query]);
```

But the request depends on:

```text
query
filters
tab
sort
page
```

### Result

Changing page, filter, or sort does not necessarily trigger a new API request.

### Correct solution

Use the actual dependencies:

```ts
}, [query, filters, tab, sort, page]);
```

Preferably reset page when filters/query/sort change.

---

## C-005 — Explore client-side filtering breaks GitHub search syntax

The initial query is:

```ts
const [query, setQuery] = useState('stars:>0');
```

Then the frontend performs:

```ts
repo.fullName.toLowerCase().includes(q)
repo.description.toLowerCase().includes(q)
repo.topics.some(...)
```

So it attempts to find:

```text
"stars:>0"
```

inside repository names/descriptions/topics.

That is not how GitHub search syntax works.

### Result

Valid GitHub results can be removed by the frontend.

### Correct solution

Do not apply raw GitHub search syntax as a local text filter.

Separate:

```text
searchText
```

from:

```text
githubQuery
```

and let GitHub perform the search/filtering.

Only apply client-side filtering to fields intentionally meant for local UI filtering.

---

# 🟠 HIGH FINDINGS

## H-001 — Home still displays fabricated analytics

Home contains:

```tsx
<span>Total: 1,482 commits</span>
<span>↑ 18.4% vs last mo</span>
```

and hardcoded language percentages:

```text
TypeScript 38%
Python 27%
Rust 15%
Go 11%
Other 9%
```

These values are not sourced from the recommendation API.

### Correct solution

Remove them or calculate them from actual backend data.

Do not present invented metrics as live GitHub analytics.

---

## H-002 — Home "Recently Viewed" is hardcoded

Home renders:

```text
facebook/react
golang/go
denoland/deno
```

instead of using the application's `recentlyViewed` state.

### Correct solution

Use:

```ts
useDevHubStore()
```

and render the actual user's recently viewed repositories.

---

## H-003 — Home says "Trending" but recommendation algorithm is popularity-based

The backend defaults to:

```text
stars:>1000
```

and personalized results are based on language preferences plus:

```text
stars:>100
```

This is better described as:

```text
Recommended Repositories
```

rather than genuine time-based trending.

### Correct solution

Either:

- rename the section to "Recommended for you", or
- implement a documented trending algorithm.

---

## H-004 — Recommendation endpoint has an N+1 request problem

The backend retrieves up to 100 repositories and then calls:

```ts
gh.getRepositoryLanguages(...)
```

for each repository.

One request can therefore generate approximately:

```text
1 search request
+
up to 100 language requests
+
1 final recommendation request
```

### Result

High GitHub API usage and slow response times.

### Correct solution

Use repository metadata where possible, sample a bounded number of repositories, cache language analysis, or aggregate through a more efficient strategy.

---

## H-005 — Repository Star/Watch/Fork controls are fake actions

Repository details uses:

```ts
setWatched(!watched)
```

and:

```ts
setStarred(!starred)
```

These only modify React state.

The Fork button has no action.

### Result

The UI implies GitHub actions occurred when they did not.

### Correct solution

Either:

1. implement authenticated GitHub API actions using the user's OAuth token, or
2. replace these with clear external GitHub actions such as "View on GitHub".

---

## H-006 — Repository commit/contributor metrics are misleading

The page displays:

```ts
repoData?.contributors?.length
repoData?.commits?.length
```

as:

```text
Contributors
Commits
```

But the backend fetches only a limited contributor/commit result set.

Therefore:

```text
Commits: 20
```

means "20 commits fetched", not "the repository has 20 commits".

### Correct solution

Rename:

```text
Recent commits
Top contributors
```

or implement true pagination/aggregation.

---

## H-007 — Repository Code/Issues/Pull Requests tabs are placeholders

The page contains tabs:

```text
Overview
Code
Issues
Pull Requests
Analytics
```

but Code/Issues/Pull Requests currently render a generic placeholder.

### Correct solution

Either implement the data-backed views or remove the tabs until implemented.

Never label a placeholder as live synchronized functionality.

---

## H-008 — Repository Analytics charts are not backed by actual repository analytics

The Analytics tab renders generic `VectorChart` components such as:

```text
Commit Activity Frequency
Pull Request Velocity
```

without supplying corresponding GitHub time-series data.

### Correct solution

Provide real data or remove the charts.

---

## H-009 — Dashboard Public Profile navigation is incomplete

Current:

```ts
onClick={() => (onNav ?? fallbackNav)('/developer')}
```

The developer profile requires:

```text
/developer?username=<username>
```

### Correct solution

```ts
navigate(
  `/developer?username=${encodeURIComponent(username)}`
);
```

---

## H-010 — Dashboard Create Repository button is non-functional

The button exists:

```text
New Repository
```

but has no `onClick`.

The empty-state "Create your first repository" button is also non-functional.

### Correct solution

Open:

```text
https://github.com/new
```

in a new tab, or implement an actual repository creation API flow.

---

## H-011 — Dashboard points users to a nonexistent `/settings` route

Dashboard error handling contains:

```ts
navigate('/settings')
```

but the application's route tree does not define `/settings`.

### Result

A user encountering the "Connect GitHub" dashboard state can be sent to a nonexistent page.

### Correct solution

Either implement `/settings` or route the action to a real GitHub connection/login flow.

---

## H-012 — Dashboard contribution year is inaccurate

The backend uses GitHub's contribution calendar, which represents a rolling contribution period.

The UI says:

```text
123 contributions in 2026
```

and:

```text
No contributions yet this year
```

### Correct solution

Use:

```text
123 contributions in the last year
```

and:

```text
No contributions in the last year
```

---

## H-013 — Dashboard repository/language totals are only based on the fetched page

The backend requests:

```text
/user/repos?per_page=100
```

and then calculates:

```text
repoCount
stars
forks
privateRepoCount
languageStats
```

from that returned page.

For accounts with more than 100 repositories, these are not complete account-wide totals.

### Correct solution

Paginate or use GitHub's aggregate/profile values where appropriate.

Explicitly label values as:

```text
first 100 repositories
```

if intentionally bounded.

---

## H-014 — Dashboard language statistics are approximate

The backend calculates language percentages using:

```ts
repo.size * 1024
```

combined with the repository's primary language.

Repository size is not language byte distribution.

### Correct solution

Use `/repos/:owner/:repo/languages` for actual language byte counts, with bounded concurrency/caching.

---

# 🟡 MEDIUM FINDINGS

## M-001 — Favorites store performs redundant fetches

The store has two effects that can call `fetchFavorites()`.

The first waits for authentication:

```ts
if (!authLoading && user !== null) {
  fetchFavorites();
}
```

The second independently calls:

```ts
fetchFavorites()
```

when `isFetchingFavorites` changes.

`isFetchingFavorites` is never actually set to `true`, so it does not function as a fetch lock.

### Correct solution

Have one auth-aware effect:

```ts
useEffect(() => {
  if (authLoading) return;

  if (!user) {
    setState(initialState);
    return;
  }

  void loadFavorites();
}, [authLoading, user]);
```

---

## M-002 — Favorites failures silently become empty favorites

The store does:

```ts
if (!resp.ok) {
  return emptyState;
}
```

A:

```text
401
500
network failure
```

can therefore look like:

```text
user has zero favorites
```

### Correct solution

Distinguish:

```text
unauthenticated
server failure
network failure
legitimate empty result
```

and expose an error state.

---

## M-003 — Favorite toggle updates UI even if backend request fails

`toggleSaveRepo` and `toggleSaveDev` perform the request but do not verify `resp.ok` before updating local state.

### Result

UI can say an item is saved while the database rejected the operation.

### Correct solution

Only update local state after a successful response, or optimistically update and rollback on failure.

---

## M-004 — Following developers is not persisted

`toggleFollowDev` only modifies React state.

Refreshing the page loses all follows.

### Correct solution

Either implement a database-backed follow table or remove/rename the feature so it is not presented as persistent.

---

## M-005 — Saved Collections are hardcoded

The Collections tab contains:

```text
Core Frameworks
Systems & Low-Level
AI & Machine Learning
```

with fixed counts:

```text
4
3
2
```

and:

```text
Updated today
```

These are not database-backed user collections.

### Correct solution

Implement collections persistence or remove the Collections tab.

---

## M-006 — Developer search assumes full profile fields from GitHub search results

Explore maps user-search results to:

```ts
bio
public_repos
followers
following
language
```

GitHub search-user results should not be treated as a complete `/users/:username` profile.

### Correct solution

Either:

- render only fields guaranteed by search, or
- enrich search results through the profile endpoint.

---

## M-007 — Mobile developer navigation loses the username

`MobileHome.tsx` has:

```ts
onNav('/developer');
```

instead of:

```ts
onNav(`/developer?username=${encodeURIComponent(username)}`);
```

### Result

Selecting a developer on mobile can open a profile page without a target username.

---

## M-008 — Mobile developer section is effectively empty

`useDevHub()` declares:

```ts
const [developers, setDevelopers] = useState<Developer[]>([]);
```

but the hook does not populate `developers`.

Therefore Mobile Home's "Top Developers" section has no real source.

### Correct solution

Fetch developer recommendations or remove the section.

---

## M-009 — Dead route functions remain in App.tsx

`PublicRoutes()` and `PrivateRoutes()` are defined but the application renders a separate direct `<Routes>` tree.

### Correct solution

Remove the unused route components and maintain one canonical route tree.

---

## M-010 — Dead `AuthCallbackPage` remains

`AuthCallbackPage` exists alongside `AuthCallbackPageWithError`, but only the latter is routed.

### Correct solution

Keep exactly one implementation.

---

## M-011 — `MobileHomePage` is imported but not routed/rendered

`App.tsx` imports:

```ts
MobileHomePage
```

but the route tree uses `HomePage`.

### Correct solution

Either use the component or remove it.

---

## M-012 — SPA navigation still uses hard reloads

`MobileLayout.handleNav()` uses:

```ts
window.location.href = ...
```

instead of React Router navigation.

### Result

Full page reloads can reset client state and unnecessarily reinitialize authentication/data.

### Correct solution

Use:

```ts
navigate(...)
```

throughout the SPA.

---

## M-013 — Auth callback retry URL is manually constructed

The callback page uses:

```ts
window.location.href =
  `${import.meta.env.VITE_API_URL || ''}/api/auth/github`;
```

This bypasses the centralized `API_BASE` abstraction.

### Correct solution

Use:

```ts
githubLogin();
```

---

## M-014 — Auth UI has incomplete mode switching

The Login/Register switch is only shown when an error exists.

Normal users do not always get a visible way to switch modes.

### Correct solution

Always display the relevant:

```text
Create an account
Already have an account? Sign in
```

CTA.

---

## M-015 — Forgot password is non-functional

The UI displays:

```text
Forgot password?
```

but it is only a `<span>` with no recovery flow.

### Correct solution

Implement password reset or remove the control.

---

## M-016 — API base production fallback can hide deployment misconfiguration

If `VITE_API_URL` is absent in production, the client falls back to:

```ts
window.location.origin
```

This can make the application silently call:

```text
https://client-jet-two-14.vercel.app/api/...
```

instead of the Render backend.

### Correct solution

Fail fast in production when `VITE_API_URL` is missing.

Example:

```ts
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is required in production');
}
```

---

## M-017 — OAuth state cookie clear uses a `maxAge` option

The state cookie is created with:

```ts
maxAge: 10 * 60 * 1000
```

and the same options are passed to:

```ts
res.clearCookie(...)
```

This can trigger Express cookie-option deprecation behavior.

### Correct solution

Use shared security attributes for deletion but do not pass `maxAge` when clearing the cookie.

---

## M-018 — Request validation still uses `req as any`

Examples include:

```ts
(req as any).validatedBody
(req as any).validatedQuery
(req as any).validatedParams
```

### Correct solution

Add Express request augmentation:

```ts
declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
      user?: User;
      userId?: string;
    }
  }
}
```

Prefer typed middleware generics so individual handlers receive the correct type.

---

# 🔵 TYPE-SAFETY FINDINGS

## T-001 — Extensive `any` remains

Examples:

```ts
request<any>
map((r: any) => ...)
map((u: any) => ...)
catch (e: any)
Record<string, any>
payload: any
```

This is especially problematic because both client and server have:

```json
"strict": true
```

The project therefore has strict TypeScript configuration while bypassing it in important API boundaries.

### Correct solution

Create explicit types for:

- GitHubRepository
- GitHubUser
- GitHubCommit
- GitHubContributor
- GitHubSearchResponse
- GitHubEvent
- GitHubGist
- GitHubOrganization
- GitHubLanguageMap
- API error payloads
- OAuth token exchange response

---

## T-002 — `@ts-ignore` remains in auth middleware

Current code:

```ts
// @ts-ignore
req.user = user;

// @ts-ignore
req.userId = user.id;
```

### Correct solution

Use Express declaration merging.

---

## T-003 — Frontend types still contain `payload: any`

`DeveloperProfileActivityItem` and `DashboardActivityItem` use:

```ts
payload: any;
```

### Correct solution

Define event payload unions for the supported GitHub event types.

---

# 🔐 SECURITY FINDINGS

## S-001 — OAuth token encryption is missing

Covered by C-002.

This is the highest-priority security issue.

---

## S-002 — GitHub callback should validate required secrets before token exchange

The callback directly sends:

```ts
process.env.GITHUB_CLIENT_ID
process.env.GITHUB_CLIENT_SECRET
```

The client ID is validated in the start endpoint, but the callback should also fail clearly if either OAuth credential is missing.

### Correct solution

Centralize environment validation at startup.

---

## S-003 — GitHub API requests have no explicit timeout

The GitHub service uses:

```ts
fetch(url, ...)
```

without an `AbortSignal` timeout.

### Result

A stalled upstream request can hold a server request open unnecessarily.

### Correct solution

Use:

```ts
AbortSignal.timeout(10_000)
```

or an `AbortController`.

---

## S-004 — Global rate limiter is applied to every endpoint

Current configuration:

```text
300 requests / 15 minutes
```

for the entire server.

Auth endpoints also have a separate limiter.

This is acceptable as a baseline but should be reviewed for production traffic because a single client can consume the global budget for unrelated API calls.

---

## S-005 — OAuth callback shares the GitHub-start rate-limit bucket

Because:

```ts
app.use('/api/auth/github', authLimiter);
```

matches the callback path as well, repeated OAuth attempts/callbacks can consume the same auth limit.

### Correct solution

Use separate rate limits for:

```text
/oauth start
/oauth callback
login
register
```

or carefully configure the matcher.

---

# 📊 DATA ACCURACY FINDINGS

## D-001 — Home commit velocity is fake

```text
1,482 commits
+18.4%
```

must be removed or backed by real data.

---

## D-002 — Home language distribution is fake

The 38/27/15/11/9 values are hardcoded.

---

## D-003 — Explore totals are fake

The UI still uses:

```ts
filteredRepos.length * 482
filteredDevs.length * 214
```

for displayed counts.

This must use GitHub's actual `total_count`.

---

## D-004 — Repository commit count is a fetched-page count

Rename or implement real aggregation.

---

## D-005 — Dashboard repository count is bounded to the fetched page

Do not call a first-page count "Total Repositories" unless it is actually total.

---

## D-006 — Dashboard language percentages are approximations

They are calculated from repository size × primary language rather than actual language bytes.

---

# 🎨 UI/UX FINDINGS

## UX-001 — Functional state and visual state are inconsistent

Several controls visually imply backend/GitHub actions:

- Star
- Watch
- Fork
- Follow
- Collections
- Create Repository

but some are local-only or non-functional.

### Required rule

Every visible action must be:

```text
functional
OR
clearly labeled as unavailable
OR
removed
```

---

## UX-002 — Error messages are often too generic

Examples:

```text
Login failed
Registration failed
Failed to search repositories
Failed to fetch dashboard data
```

The backend often knows whether the cause is:

```text
401
403
404
429
500
network
```

### Correct solution

Map known errors to useful user-facing messages while keeping sensitive server details hidden.

---

## UX-003 — Loading states are generally present

This is a positive area.

Home, Dashboard, and Repository Details contain loading/error states.

However, Explore and Saved Items need stronger loading/error/empty handling.

---

## UX-004 — Saved Items can fail during hydration

`Promise.all()` in Saved Items can reject if one saved repository/developer cannot be loaded.

There is no local error state around the hydration request.

### Correct solution

Use per-item error handling or `Promise.allSettled()`.

---

# 🏗️ ARCHITECTURE FINDINGS

## A-001 — There are multiple navigation abstractions

The application mixes:

```text
navigate()
window.location.href
onNav()
fallbackNav()
```

### Correct solution

Use React Router for internal routes.

Use `window.open()` only for external GitHub URLs.

---

## A-002 — Multiple auth abstractions exist

The application uses:

```text
AuthContext
useAuth
AuthGate
ProtectedRoute
```

This is not inherently wrong, but the route architecture has duplicate concepts.

### Correct solution

Keep:

```text
AuthProvider
useAuth
ProtectedRoute
PublicOnlyRoute
```

and remove unnecessary duplicate wrappers.

---

## A-003 — Home and Mobile Home use different product implementations

Desktop Home and Mobile Home both implement discovery UI separately.

This creates risk of behavior divergence.

### Correct solution

Share:

- data hooks
- cards
- navigation handlers
- loading/error states
- data mapping

and keep only layout-specific presentation separate.

---

# 🧪 ACCEPTANCE TESTS REQUIRED

Before calling DevHub production-ready, execute:

## Authentication

- [ ] Register valid user
- [ ] Reject duplicate email
- [ ] Login valid user
- [ ] Reject invalid password
- [ ] Refresh while authenticated
- [ ] Logout
- [ ] Protected route after logout

## GitHub OAuth

- [ ] `/api/auth/github` redirects to GitHub
- [ ] GitHub callback reaches `/api/auth/github/callback`
- [ ] state cookie is created
- [ ] state is validated
- [ ] code exchange succeeds
- [ ] user is created/linked
- [ ] session cookie is created
- [ ] `/auth/callback` loads
- [ ] `/api/auth/me` returns authenticated user
- [ ] `/home` loads

## Explore

- [ ] repository search
- [ ] developer search
- [ ] language filter
- [ ] stars filter
- [ ] updated filter
- [ ] license filter
- [ ] sorting
- [ ] page 1
- [ ] page 2
- [ ] empty result
- [ ] API failure
- [ ] rate-limit response

## Repository

- [ ] valid repository
- [ ] invalid repository
- [ ] owner navigation
- [ ] language breakdown
- [ ] commits
- [ ] contributors
- [ ] save
- [ ] external GitHub link
- [ ] no React object rendering crash

## Developer

- [ ] valid user
- [ ] invalid user
- [ ] profile
- [ ] repositories
- [ ] contributions
- [ ] activity
- [ ] save developer
- [ ] correct username routing

## Dashboard

- [ ] correct authenticated user
- [ ] real repositories
- [ ] real contribution calendar
- [ ] real language data
- [ ] gists
- [ ] starred repositories
- [ ] following
- [ ] organizations
- [ ] public profile navigation
- [ ] create repository action
- [ ] GitHub token failure handling

## Saved

- [ ] save repository
- [ ] save developer
- [ ] refresh persistence
- [ ] remove repository
- [ ] remove developer
- [ ] empty state
- [ ] API failure
- [ ] no cross-user leakage

## Responsive

Test:

```text
375px
768px
1024px
1280px
1440px+
```

Verify:

- [ ] no horizontal overflow
- [ ] navigation works
- [ ] cards don't clip
- [ ] buttons remain usable
- [ ] tables/cards remain readable

---

# FINAL PRIORITY ORDER

## P0 — Fix immediately

1. OAuth callback route
2. OAuth token encryption
3. Explore effect/dependency logic
4. Explore sort backend wiring
5. Explore GitHub-query/local-filter conflict
6. Remove fake Home analytics
7. Remove fake Explore counts
8. Fix dashboard `/settings` dead route

## P1 — Fix next

9. Dashboard profile URL
10. Dashboard repository creation action
11. Repository fake Star/Watch/Fork actions
12. Repository misleading commit/contributor totals
13. Saved Collections
14. Favorites failure handling
15. Favorites duplicate fetch
16. Mobile developer navigation
17. Mobile developer data
18. Recommendation N+1 API calls
19. API request timeout

## P2 — Hardening

20. Remove `any`
21. Remove `@ts-ignore`
22. Add typed Express request augmentation
23. Remove dead routes/components
24. Unify navigation
25. Improve error states
26. Improve Saved Items hydration
27. Improve API error typing

---

# Definition of Done

DevHub should not be marked production-ready until:

- [ ] OAuth works end-to-end
- [ ] OAuth callback path is correct
- [ ] Session survives OAuth redirect
- [ ] OAuth tokens are encrypted at rest
- [ ] No fake production analytics remain
- [ ] Explore filters actually reach GitHub
- [ ] Explore sorting actually changes API results
- [ ] Explore pagination actually fetches new pages
- [ ] GitHub `total_count` is used where totals are shown
- [ ] Repository metrics are accurately labeled
- [ ] Dashboard metrics are accurately labeled
- [ ] Favorites persist correctly
- [ ] Follow state is intentionally persistent or removed
- [ ] Collections are real or removed
- [ ] Every visible button either works or is removed
- [ ] No dead routes/components remain
- [ ] TypeScript builds cleanly
- [ ] No avoidable `any`/`@ts-ignore` remains
- [ ] API failures have proper UI states
- [ ] Mobile navigation works
- [ ] Production environment configuration fails fast when required variables are missing
- [ ] GitHub API requests have sensible timeout/rate-limit handling

---

# Source References

Primary repository:
https://github.com/Jblob-2019/Devhub

Key inspected files:

- `apps/server/src/routes/auth.ts`
- `apps/server/src/index.ts`
- `apps/server/src/middleware/auth.ts`
- `apps/server/src/models/user.ts`
- `apps/server/src/services/auth.ts`
- `apps/server/src/services/github.service.ts`
- `apps/server/src/routes/github.ts`
- `apps/server/src/routes/favorites.ts`
- `apps/client/src/App.tsx`
- `apps/client/src/context/AuthContext.tsx`
- `apps/client/src/services/authService.ts`
- `apps/client/src/services/githubApi.ts`
- `apps/client/src/lib/apiBase.ts`
- `apps/client/src/hooks/useDevHub.ts`
- `apps/client/src/store/useDevHubStore.ts`
- `apps/client/src/pages/Home.tsx`
- `apps/client/src/pages/Explore.tsx`
- `apps/client/src/pages/Auth.tsx`
- `apps/client/src/pages/DeveloperProfile.tsx`
- `apps/client/src/pages/RepositoryDetails.tsx`
- `apps/client/src/pages/Dashboard.tsx`
- `apps/client/src/pages/SavedItems.tsx`
- `apps/client/src/pages/MobileHome.tsx`
- `db/migrations/20240920_create_favorites.sql`
- `db/migrations/20240925_add_github_access_token.sql`
- `.env.example`
- `vercel.json`

## Audit conclusion

**Current status: NOT ACCEPTANCE-READY.**

The project has a workable foundation, but the remaining issues are not merely cosmetic. The OAuth callback mismatch, plaintext GitHub OAuth token storage, Explore request-flow bugs, fake analytics, and non-functional controls need to be resolved before treating the application as production-ready.

The next engineering pass should focus on **correctness and data integrity first**, then security hardening, then UI polish.
