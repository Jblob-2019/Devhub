# DevHub — Phase 2 Implementation Plan: GitHub Discovery Feed

**Target Milestone:** Phase 2 Production Release  
**Location:** `agent/implementation_plan_phase2.md`  
**Focus:** LinkedIn-style Home Discovery Feed, Trending & Scoring Engine, Category Filtering, Developer Spotlight, and Personalized Recommendations.  
**Prerequisites:** Phase 1 Core Platform (Auth, GitHub Service, Favourites DB) Completed.  

---

## 1. Phase 2 Objectives & Deliverables
1. Transform DevHub home page into an interactive, LinkedIn/social-style repository discovery feed.
2. Implement the `feed_items` and `user_interests` database tables and synchronization services.
3. Build the automated GitHub Collector & Data Normalizer service.
4. Implement the dynamic Popularity & Momentum Scoring Engine ($S = 0.35P + 0.30A + 0.25G + 0.10R$).
5. Create Featured Repositories Hero banner.
6. Create Trending Repositories section with time horizons (`daily`, `weekly`, `monthly`) and language filters.
7. Implement 8 category discovery chips (AI/ML, Web Dev, DevTools, Mobile, Data Science, Cybersecurity, Game Dev, Creative Coding).
8. Build interactive Feed Cards with direct inline save actions, external links, analytics links, and quick-share.
9. Inject Developer Spotlight cards into the feed stream.
10. Build the Personalized Recommendation Engine matching user interests and saved collections.
11. Implement infinite scroll / cursor pagination with resilient rate-limit caching and skeleton loaders.

---

## 2. Step-by-Step Task Breakdown

### Stage 1: Database Extensions & Migrations
- [ ] **Task 1.1: Migration for `user_interests`**
  - Columns: `id` (UUID PK), `user_id` (FK to `users.id` CASCADE), `interest_type` (VARCHAR 50), `interest_value` (VARCHAR 255), `created_at`.
  - Unique index: `(user_id, interest_type, interest_value)`.
- [ ] **Task 1.2: Migration for `feed_items`**
  - Columns: `id` (UUID PK), `item_type` ('repository' | 'developer'), `github_id` (BIGINT), `owner_login`, `repository_name`, `title`, `description`, `language`, `topics` (TEXT[]), `stars`, `forks`, `open_issues`, `score` (NUMERIC 10,4), `category`, `source` ('trending' | 'curated' | 'github_search' | 'recommended'), `is_featured` (BOOLEAN), `published_at`, `expires_at`, `metadata` (JSONB).
  - Indexes on `category`, `score DESC`, `is_featured`.
- [ ] **Task 1.3: Prisma Schema Update**
  - Update `backend/prisma/schema.prisma` with `UserInterest` and `FeedItem` models and run `prisma generate`.

---

### Stage 2: Feed Collector & Scoring Engine (Backend)
- [ ] **Task 2.1: GitHub Repository Collector (`feed-collector.service.ts`)**
  - Periodic / on-demand collector querying GitHub search endpoints:
    - AI: `topic:machine-learning OR topic:llm stars:>500`
    - Web: `topic:react OR topic:nextjs OR topic:vue stars:>1000`
    - DevTools: `topic:developer-tools OR topic:cli stars:>500`
    - Mobile, GameDev, Cyber, etc.
  - Extract repository metadata, owner avatar, topics, license, push dates.
- [ ] **Task 2.2: Data Normalization Service**
  - Transform heterogeneous GitHub API responses into a clean unified `FeedItem` shape.
- [ ] **Task 2.3: Popularity & Momentum Scoring Engine (`scoring.ts`)**
  - Implement mathematical formula:
    $$S = 0.35 \cdot P + 0.30 \cdot A + 0.25 \cdot G + 0.10 \cdot R$$
  - Calculate:
    - $P$: Log10 normalized star count.
    - $A$: Exponential recency decay based on days since last commit.
    - $G$: Star growth velocity per day of age.
    - $R$: Topic relevance to selected category.
  - Store calculated score in `feed_items.score` for fast indexed retrieval.

---

### Stage 3: Discovery Feed API Endpoints (`backend/src/routes/feed.routes.ts`)
- [ ] **Task 3.1: Home Discovery Feed Endpoint**
  - `GET /api/feed?page=1&limit=20&category={cat}&language={lang}&sort={sort}`:
    - Fetches top featured item.
    - Fetches paginated scored feed items.
    - Annotates `is_saved` flag for the logged-in user by cross-referencing `favorite_repositories`.
    - Returns pagination metadata (`has_next`, `total_pages`).
- [ ] **Task 3.2: Trending Repositories Endpoint**
  - `GET /api/feed/trending?period=day|week|month&language={lang}`:
    - Queries dynamic trending projects based on star growth velocity over the selected time horizon.
- [ ] **Task 3.3: Featured Repositories Endpoint**
  - `GET /api/feed/featured`:
    - Retrieves current editorially curated or highest-scoring spotlight repository.
- [ ] **Task 3.4: Personalized Recommendations Endpoint**
  - `GET /api/feed/recommended` (Authenticated):
    - Retrieves user interests from `user_interests` and language/topic tags from `favorite_repositories`.
    - Returns matching repositories that the user has not yet saved.
    - Falls back to top-trending projects for new users with no saved items.
- [ ] **Task 3.5: User Interests Management**
  - `GET /api/user/interests`: List user's selected interests.
  - `POST /api/user/interests`: Add new interests (e.g. languages: `TypeScript`, `Rust`; topics: `ai`, `devtools`).
  - `DELETE /api/user/interests/:id`: Remove an interest.

---

### Stage 4: Home Page Discovery UI (Frontend)
- [ ] **Task 4.1: Hero Section & Search CTA**
  - Visual headline: *"Discover developers. Explore repositories. Find what's being built."*
  - Fast search input with jump-to-explore triggers.
  - Live metric counters: Total explored repos, active developers.
- [ ] **Task 4.2: Category Discovery Chips Component (`CategoryChips.tsx`)**
  - Horizontal scrollable chip bar with modern icons:
    - 🤖 AI & ML | 🌐 Web Dev | 🛠️ Dev Tools | 📱 Mobile | 📊 Data Science | 🔒 Security | 🎮 Game Dev | 🎨 Creative
  - Active state highlighting with instant client-side filtering.
  - Sync active category to URL query parameter (`/?category=ai`).
- [ ] **Task 4.3: Featured Repository Hero Card (`FeaturedHero.tsx`)**
  - Premium banner showcasing the project of the week.
  - Large thumbnail / avatar, title, description, star/fork counters, language badge, and "Inspect Analytics" button.
- [ ] **Task 4.4: Trending Repositories Section (`TrendingSection.tsx`)**
  - Tab selector: *Trending Today* | *Trending This Week* | *Trending This Month*.
  - Language filter dropdown.
  - Compact horizontal cards highlighting momentum and star velocity badges.

---

### Stage 5: Feed Card & Interaction Components
- [ ] **Task 5.1: LinkedIn-Style Repository Card (`FeedCard.tsx`)**
  - Header: Owner avatar, repository full name, relative pushed time ("Updated 3 hours ago").
  - Content: Title, formatted description, topic pills (clicking a pill filters feed).
  - Metrics row: Stars count (e.g. `14.2k`), Forks count, Primary language with color dot, License.
  - Action footer:
    - ⭐ **Save / Saved** toggle button (synced with user's favourites in DB).
    - 📊 **View Analytics** link to `/repositories/:owner/:repo`.
    - 🔗 **GitHub Link** external button.
    - ↗️ **Share** button (copies URL to clipboard with confirmation toast).
- [ ] **Task 5.2: Developer Spotlight Card (`DeveloperSpotlightCard.tsx`)**
  - Distinct border/glow accent highlighting open-source creators.
  - Developer avatar, full name, GitHub handle, bio, follower count.
  - Top 3 repositories with mini star badges.
  - "Save Developer" and "View Profile" quick buttons.

---

### Stage 6: Infinite Scrolling & Cache Resilience
- [ ] **Task 6.1: Infinite Scroll Hook (`useFeed.ts`)**
  - Integrated with TanStack Query's `useInfiniteQuery`.
  - Intersection Observer triggering automatic next-page load when user scrolls near the bottom.
  - Manual "Load More Repositories" fallback button.
- [ ] **Task 6.2: Shimmer Skeletons (`FeedSkeleton.tsx`)**
  - Perfectly matched placeholders for repository cards, category pills, and spotlight items.
- [ ] **Task 6.3: Rate-Limit Shielding & Safe Mode Banner**
  - Global notification toast or alert banner if GitHub rate limit is running low.
  - Automatic fallback serving cached `feed_items` from PostgreSQL with an indicator: *"Showing cached projects (GitHub Safe Mode)"*.
  - Manual "Refresh Feed" button to re-fetch latest data.

---

### Stage 7: Onboarding & User Interest Modal
- [ ] **Task 7.1: User Interests Selector Modal**
  - Modal presented to new users or accessible via profile:
    - Select favorite languages (JavaScript, TypeScript, Python, Rust, Go, etc.).
    - Select favorite topics (AI/LLMs, Cloud/DevOps, Frontend, Mobile, Systems).
  - Saves selections to `user_interests` and immediately re-ranks the home feed.

---

## 3. Verification & Testing Plan

### 3.1 Automated Tests
* **Scoring Engine Unit Tests:** Verify that high-star recent projects score higher than older inactive projects with identical stars.
* **Feed API Integration Tests:** Verify pagination headers, category query filtering, and that authenticated calls include correct `is_saved: true/false` status.
* **Recommendation Engine Tests:** Verify that user interest tags boost relevant repository rankings in `/api/feed/recommended`.

### 3.2 Manual QA Checklist
1. **Home Feed Rendering:**
   - Open `/`. Confirm Featured repository appears at the top.
   - Confirm repository cards render with real stars, forks, and language tags.
   - Scroll down: confirm next page of feed items loads smoothly via infinite scroll.
2. **Category Filtering:**
   - Click "AI & ML". Verify all feed items are AI-related repositories.
   - Click "Web Dev". Verify feed updates instantly to React/Next.js/Vue projects.
3. **Direct Feed Save Action:**
   - Click "Save" on a feed card. Verify star icon fills and toast confirms bookmark.
   - Navigate to `/saved`. Verify the repository appears in saved collections.
   - Return to feed: verify the card displays "Saved" state.
4. **Developer Spotlight:**
   - Confirm developer spotlight cards appear periodically in the stream.
   - Click "Save Developer". Verify developer is saved to user collections.
5. **Rate-Limit Resilience:**
   - Simulate high traffic or disconnect GITHUB_TOKEN. Verify feed gracefully renders cached database items without crashing.

---

## 4. Phase 2 Definition of Done (DoD)
* [ ] Home page functions as a full-featured LinkedIn-style repository discovery feed.
* [ ] Featured hero repository and dynamic trending sections work across all time horizons.
* [ ] Category filtering and topic pills trigger immediate, responsive feed updates.
* [ ] Direct saving from feed cards persists to database and synchronizes across views.
* [ ] Developer spotlight cards showcase top maintainers.
* [ ] Personalized recommendations adapt to saved repositories and user interests.
* [ ] Infinite scroll performs smoothly with zero layout shift.
* [ ] Fallback cache protects against GitHub API rate limits.
* [ ] Application is fully responsive and verified on mobile and desktop viewports.
