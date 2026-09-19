# DevHub — Phase 1 Implementation Plan: GitHub Explorer & Analytics

**Target Milestone:** Phase 1 MVP  
**Location:** `agent/implementation_plan_phase1.md`  
**Focus:** Full-Stack Foundation, Secure Authentication, GitHub Developer & Repository Explorer, Analytics Dashboard, and Personal Collections.  
**Tech Stack:** React (TypeScript + Vite) + Node.js (Express + TypeScript) + Supabase PostgreSQL + GitHub REST API  

---

## 1. Phase 1 Objectives & Deliverables
1. Establish monorepo structure with typed frontend (`frontend/`) and backend (`backend/`).
2. Implement secure authentication (Register, Login, JWT auth middleware, session persistence).
3. Connect Supabase PostgreSQL database with migrations for `users`, `favorite_developers`, and `favorite_repositories`.
4. Build GitHub API service layer with rate-limit tracking and memory caching.
5. Create Explorer search interfaces for both Developers and Repositories with multi-facet filters.
6. Develop Developer Profile view (`/developers/:username`) with top & recent repositories.
7. Develop Repository Details view (`/repositories/:owner/:repo`) with rich charts (Language distribution, Commits, Contributors).
8. Implement persistent Bookmarks/Favourites management for Repositories and Developers.
9. Deliver an authenticated User Dashboard summarizing saved collections and quick search.

---

## 2. Step-by-Step Task Breakdown

### Stage 1: Monorepo & Project Scaffolding
- [ ] **Task 1.1: Root Monorepo Setup**
  - Initialize root `package.json` with workspaces (`frontend`, `backend`) and concurrent dev scripts.
  - Setup `.gitignore`, `.env.example`, and ESLint/Prettier configs.
- [ ] **Task 1.2: Backend Initialization**
  - Scaffold `backend/` with `package.json`, `tsconfig.json`, `src/server.ts`, `src/app.ts`.
  - Install dependencies: `express`, `cors`, `helmet`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `axios`, `zod`, `pg` / `@prisma/client`.
  - Install devDependencies: `typescript`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcryptjs`, `ts-node-dev`, `jest`, `supertest`.
- [ ] **Task 1.3: Frontend Initialization**
  - Scaffold `frontend/` using Vite with React + TypeScript template.
  - Install dependencies: `react-router-dom`, `@tanstack/react-query`, `lucide-react`, `recharts`, `clsx`, `tailwind-merge`, `date-fns`, `axios`.
  - Configure Tailwind CSS with dark slate theme, typography, and custom scrollbars.

---

### Stage 2: Database Schema & Supabase Configuration
- [ ] **Task 2.1: Supabase Connection**
  - Setup PostgreSQL connection pool in `backend/src/config/db.ts`.
  - Verify database connectivity using environment variable `DATABASE_URL`.
- [ ] **Task 2.2: Schema Migrations (DDL)**
  - Execute migration for `users`:
    - `id` (UUID PK), `name`, `email` (UNIQUE), `password_hash`, `avatar_url`, `created_at`.
  - Execute migration for `favorite_developers`:
    - `id` (UUID PK), `user_id` (FK), `github_id`, `username`, `name`, `avatar_url`, `profile_url`, `public_repos`, `followers`.
    - Unique constraint on `(user_id, github_id)`.
  - Execute migration for `favorite_repositories`:
    - `id` (UUID PK), `user_id` (FK), `github_id`, `owner_login`, `repository_name`, `full_name`, `description`, `stars`, `forks`, `open_issues`, `language`, `repository_url`.
    - Unique constraint on `(user_id, github_id)`.
- [ ] **Task 2.3: Database Models / Repositories**
  - Create database access helpers (`user.repository.ts`, `favorites.repository.ts`).

---

### Stage 3: Authentication & Authorization (Backend + Frontend)
- [ ] **Task 3.1: Backend Auth Controller & Service**
  - Implement `POST /api/auth/register`:
    - Validate email format and password strength (min 8 chars, 1 uppercase, 1 number).
    - Check duplicate email.
    - Hash password using `bcryptjs` (salt 10).
    - Issue JWT signed with `JWT_SECRET` (7d expiration).
  - Implement `POST /api/auth/login`:
    - Compare password hash, return user payload and JWT token.
  - Implement `GET /api/auth/me`:
    - Return current authenticated user profile and stats.
  - Create `auth.middleware.ts` to protect private endpoints via `Bearer <token>`.
- [ ] **Task 3.2: Frontend Auth State & Guard**
  - Create `AuthContext.tsx` handling token storage (`localStorage`), user state, and login/logout functions.
  - Build `<ProtectedRoute />` component redirecting guests to `/login`.
  - Build `Login.tsx` and `Register.tsx` pages with responsive glassmorphic cards, live validation, and error alerts.

---

### Stage 4: GitHub API Service & Caching Gateway
- [ ] **Task 4.1: GitHub Service Layer**
  - Implement `backend/src/services/github.service.ts`:
    - Authenticated requests using `GITHUB_TOKEN`.
    - Intercept rate-limit headers (`x-ratelimit-remaining`, `x-ratelimit-reset`).
    - In-memory cache layer (`node-cache`) with 15–30 min TTLs for searches and profiles.
- [ ] **Task 4.2: GitHub Gateway Endpoints**
  - `GET /api/github/users/search?q={query}&page={page}`: User search.
  - `GET /api/github/repos/search?q={query}&language={lang}&sort={sort}&page={page}`: Repository search.
  - `GET /api/github/users/:username`: Full user profile and metadata.
  - `GET /api/github/users/:username/repos`: Repositories owned by user.
  - `GET /api/github/repos/:owner/:repo`: Repository details.
  - `GET /api/github/repos/:owner/:repo/languages`: Exact byte breakdown per language.
  - `GET /api/github/repos/:owner/:repo/contributors`: Top contributors.
  - `GET /api/github/repos/:owner/:repo/commits`: Recent commit history.

---

### Stage 5: Explorer & Search Interfaces (Frontend)
- [ ] **Task 5.1: Navigation & Layout**
  - Build `Navbar.tsx` with DevHub logo, Search bar, Explore link, Saved link, and User Avatar menu.
  - Build `Footer.tsx` with links, GitHub link, and tech stack tags.
- [ ] **Task 5.2: Explore Page (`/explore`)**
  - Tabs: **Repositories** | **Developers**.
  - Repositories Search:
    - Search input with debounced query (300ms).
    - Filters: Language selector (JS, TS, Python, Rust, Go, Java, C++), Sort selector (Stars, Forks, Updated).
    - Repository cards displaying stars, forks, language dot, owner avatar, and direct link to Analytics.
  - Developers Search:
    - Search input with debounced query.
    - Developer cards with avatar, handle, follower count, bio snippet, and "View Profile" button.
  - Skeletons for loading state and graceful empty state message.

---

### Stage 6: Developer Profile Page (`/developers/:username`)
- [ ] **Task 6.1: Profile Header Component**
  - Hero card displaying avatar, full name, GitHub handle, bio, company, location, website link, followers, following, and external GitHub button.
  - Include "Save Developer" toggle button.
- [ ] **Task 6.2: Repository Lists**
  - Section 1: "Top Repositories" (sorted by stars).
  - Section 2: "Recent Repositories" (sorted by updated date).
  - Quick action to open repository analytics directly from the profile.

---

### Stage 7: Repository Details & Analytics Suite (`/repositories/:owner/:repo`)
- [ ] **Task 7.1: Repository Header Card**
  - Repository full name, description, topic tags, license, star count, fork count, open issues count, external link, and "Save Repository" toggle button.
- [ ] **Task 7.2: Visual Language Distribution Chart**
  - Interactive Recharts Donut / Pie Chart displaying percentage of each language.
  - Color-coded legend matching official GitHub language colors.
- [ ] **Task 7.3: Contributor Leaderboard**
  - Grid of top contributors with avatar, username, and commit contribution count.
- [ ] **Task 7.4: Commit Activity Timeline**
  - Activity area/bar chart displaying commit trends and recency over the latest weeks.

---

### Stage 8: Collections / Favourites System
- [ ] **Task 8.1: Backend Favourites API**
  - `GET /api/favorites/repositories`: Returns user's saved repositories.
  - `POST /api/favorites/repositories`: Inserts repository bookmark (handles duplicate gracefully).
  - `DELETE /api/favorites/repositories/:githubId`: Removes repository bookmark.
  - `GET /api/favorites/developers`, `POST /api/favorites/developers`, `DELETE /api/favorites/developers/:githubId`.
- [ ] **Task 8.2: Frontend Saved Collections Page (`/saved`)**
  - Tabs: `Saved Repositories` | `Saved Developers`.
  - Grid of saved cards with instant "Remove" action.
  - Optimistic UI updates with undo notification.
  - Empty state guiding users to the Explore page.

---

### Stage 9: Authenticated User Dashboard (`/dashboard`)
- [ ] **Task 9.1: Metric Cards**
  - Total Saved Repositories, Total Saved Developers, Quick Search trigger.
- [ ] **Task 9.2: Recent Collections Showcase**
  - Latest 4 saved repositories and latest 4 saved developers with quick access links.
- [ ] **Task 9.3: Quick Explorer Launcher**
  - Jump to trending topics (`react`, `rust`, `machine-learning`, `nextjs`).

---

## 3. Verification & Testing Plan

### 3.1 Automated Tests
* **Auth Unit & Integration Tests:** Run Jest + Supertest testing registration validation, password hashing, valid login, token generation, and duplicate rejection.
* **GitHub Gateway Tests:** Mock GitHub API responses and verify correct transformation of user profiles, repo metrics, and language byte percentages.
* **Database Constraint Tests:** Verify that duplicate entries in `favorite_repositories` and `favorite_developers` are blocked by unique constraints.

### 3.2 Manual QA Checklist
1. **Registration & Login Flow:**
   - Register a new account `test@devhub.io`. Verify redirect to dashboard.
   - Log out, log back in with wrong password (expect error), then correct password (expect success).
2. **Explorer Search:**
   - Search repos for `langchain`. Verify star counts, language, and topics match GitHub data.
   - Search developers for `torvalds`. Verify Linus Torvalds profile appears with avatar and follower count.
3. **Repository Analytics:**
   - Navigate to `/repositories/facebook/react`.
   - Verify Language chart renders with JavaScript/TypeScript breakdown.
   - Verify contributors and commit timeline render.
4. **Save / Unsave Workflow:**
   - Click "Save Repository" on `facebook/react`.
   - Open `/saved`. Confirm `facebook/react` is listed.
   - Click "Remove". Confirm it disappears and database record is deleted.

---

## 4. Phase 1 Definition of Done (DoD)
* [ ] All Phase 1 user stories (US-001 through US-010) pass acceptance criteria.
* [ ] TypeScript compiles with 0 errors across frontend and backend.
* [ ] Dark developer UI is consistent and responsive on desktop and mobile.
* [ ] Rate-limit errors and network failures display user-friendly fallback states.
* [ ] Code is documented and ready for Phase 2 Discovery Feed integration.
