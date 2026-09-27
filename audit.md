# DevHub — Code Audit & Repair Checklist

## Scope
This audit covers the current DevHub codebase and records the issues that must be verified and resolved before considering the application production-ready.

## Critical / Runtime

### 1. GitHub OAuth callback flow
**Finding:** Multiple callback implementations/routes create conflicting OAuth flow behavior.

**Required fix:**
- Keep one canonical `/auth/callback` frontend flow.
- Backend OAuth callback must set the session cookie and redirect to:
  `/auth/callback`
- Frontend callback must call `/api/auth/me`, update AuthContext, then navigate to `/home`.
- Remove duplicate/dead callback implementations.

### 2. Wrong frontend API environment variable
**Finding:** OAuth retry logic uses `VITE_API_BASE` while the project uses `VITE_API_URL` / `API_BASE`.

**Required fix:**
- Centralize API URL usage through `API_BASE`.
- No component should manually construct inconsistent backend URLs.

### 3. Authentication/favorites race condition
**Finding:** Favorites can load before authentication has finished resolving.

**Required fix:**
- Wait for AuthContext loading to finish.
- Fetch favorites only when an authenticated user exists.
- Clear favorites state on logout.

### 4. Route parameter consistency
**Finding:** Developer/repository navigation can omit required query parameters.

**Required fix:**
- Developer: `/developer?username=<username>`
- Repository: `/repository?owner=<owner>&repo=<repo>`
- Encode query parameters with `encodeURIComponent`.

### 5. Dead/duplicate routing architecture
**Finding:** Multiple routing approaches/components exist.

**Required fix:**
- Keep one canonical React Router tree.
- Remove dead route implementations and duplicated auth callback components.

---

## Data Integrity

### 6. Fake Home analytics
**Finding:** Hardcoded commits, percentage changes, language percentages, and other analytics are displayed as real user data.

**Required fix:**
- Remove fake values.
- Use real backend/GitHub data or remove the metric.

### 7. Fake Explore counts
**Finding:** Repository/developer totals are mathematically fabricated from the number of displayed results.

**Required fix:**
- Use GitHub `total_count` or another real backend value.
- Never multiply UI result counts to simulate totals.

### 8. Broken Explore pagination
**Finding:** Frontend page state is not reliably passed to the GitHub search request.

**Required fix:**
- Send `page` and `per_page` to the backend.
- Refetch whenever query/filter/sort/page changes.
- Preserve GitHub pagination metadata.

### 9. Broken/partial Explore sorting
**Finding:** UI sorting options are not fully connected to GitHub search sorting.

**Required fix:**
- Map Stars/Forks/Updated/Relevance to real API parameters.
- Ensure changing sort triggers a new request.

### 10. Developer search mapping
**Finding:** GitHub user-search results are treated as full user profiles.

**Required fix:**
- Only render fields actually returned by search.
- Enrich with `/users/:username` when profile fields are required.

### 11. Fake Saved Collections
**Finding:** Collections/counts are hardcoded rather than persisted.

**Required fix:**
- Either implement database-backed collections or remove the feature from the UI.

### 12. Following is frontend-only
**Finding:** Following developers only changes React state and disappears after refresh.

**Required fix:**
- Persist follows in the database, or clearly make it temporary and label it accordingly.

### 13. GitHub action buttons are simulated
**Finding:** Star/Watch/Fork-style controls can change local UI state without performing GitHub actions.

**Required fix:**
- Either implement authenticated GitHub API actions or replace them with clear “View on GitHub” actions.

### 14. Repository metrics are mislabeled
**Finding:** Length of fetched contributor/commit arrays is presented as repository totals.

**Required fix:**
- Label them as recent/top fetched data, or implement proper pagination/aggregation for true totals.

### 15. Dashboard language statistics
**Finding:** Repository size × primary language is used as a language distribution approximation.

**Required fix:**
- Use GitHub language-byte data for actual language statistics.

### 16. Contribution period wording
**Finding:** Contribution data is presented as a calendar-year total when the underlying data represents a rolling period.

**Required fix:**
- Label it accurately, e.g. “contributions in the last year.”

---

## Security / Backend

### 17. GitHub OAuth token storage
**Finding:** Database schema describes the GitHub token as encrypted, but the code path must be verified to ensure encryption actually occurs.

**Required fix:**
- Encrypt OAuth access tokens at rest using authenticated encryption such as AES-256-GCM.
- Keep encryption keys server-side only.
- Never expose OAuth tokens to the frontend.

### 18. Type safety
**Finding:** Backend uses `any` in important GitHub/API/auth paths.

**Required fix:**
- Define explicit GitHub/API/database types.
- Remove avoidable `any`.
- Keep TypeScript strict mode enabled.

### 19. API error handling
**Finding:** Some failures are converted into empty data, making errors indistinguishable from legitimate empty states.

**Required fix:**
- Distinguish 401, 404, 429, 5xx, network errors, and genuine empty results.
- Use consistent API error responses.
- Show meaningful frontend error states.

### 20. GitHub API performance
**Finding:** Recommendation logic can make many GitHub API requests sequentially.

**Required fix:**
- Minimize API calls.
- Use bounded concurrency where needed.
- Reuse available repository metadata.
- Add sensible GitHub request timeouts and rate-limit handling.

### 21. Database migration reliability
**Finding:** Production can start with missing tables if migrations have not been applied.

**Required fix:**
- Make migration status explicit and documented.
- Verify required tables before deployment/startup.
- Use the repository's canonical migrations; do not invent incompatible schemas.

---

## UI / UX

### 22. Remove fake/non-functional controls
Audit every button, link, tab, filter, menu, and CTA.
- If it works: keep it.
- If it is unfinished: implement it.
- If it cannot be implemented now: remove or relabel it.

### 23. Loading states
Every API-driven page must have useful skeleton/loading states.

### 24. Error states
Every API-driven page must have retryable error states.

### 25. Empty states
Empty favorites, no repositories, no developers, no contributions, etc. must have intentional empty-state UI.

### 26. Navigation consistency
Use React Router for SPA navigation. Avoid unnecessary `window.location.href` navigation inside the application.

### 27. Responsive UI
Audit desktop, tablet, and mobile layouts. Fix overflow, clipped cards, broken grids, navigation issues, and touch targets.

### 28. Visual hierarchy
Reduce unnecessary cards, borders, badges, and duplicated metrics. Prioritize:
1. Search/discovery
2. Primary content
3. Important actions
4. Secondary analytics

### 29. Auth UI
Ensure Login/Register clearly communicate:
- current mode
- validation errors
- loading state
- successful authentication
- logged-in user identity
- logout

### 30. Repository page
Ensure repository pages render real repository information and never crash when GitHub returns nested objects such as `owner`.

---

## Required Verification

After fixing everything:

1. Install dependencies.
2. Run TypeScript checks.
3. Run frontend production build.
4. Run backend production build.
5. Run available tests/linting.
6. Test unauthenticated route protection.
7. Test email login/register.
8. Test GitHub OAuth.
9. Test logout.
10. Test repository search.
11. Test developer search.
12. Test repository details.
13. Test developer profile.
14. Test favorites.
15. Test dashboard.
16. Test mobile navigation.
17. Test API failure/empty/loading states.
18. Search the entire codebase for:
   - TODO
   - FIXME
   - mock
   - fake
   - hardcoded analytics
   - placeholder
   - `any`
   - dead routes
   - unused imports
   - console errors
   - broken API URLs

## Definition of Done

DevHub is not considered complete until:
- No known TypeScript/build errors remain.
- No obvious runtime exceptions remain.
- No fake analytics are presented as real data.
- Auth and OAuth work end-to-end.
- Protected routes are actually protected.
- All navigation parameters are correct.
- GitHub data is real and correctly labeled.
- Favorites persist correctly.
- API failures are visible and recoverable.
- Buttons/tabs/filters either work or are removed.
- Desktop and mobile layouts are stable.
- Existing functionality is preserved unless the audit explicitly requires changing it.
