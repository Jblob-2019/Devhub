# DevHub – GitHub‑Powered Developer Platform

> **DevHub** aggregates public and private GitHub data into a single, secure web app.  Browse repositories, discover developers, and view a personalized dashboard after authenticating with email/password or GitHub OAuth.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Getting Started (Local Development)](#getting-started-local-development)
7. [Environment Variables](#environment-variables)
8. [Database Migrations](#database-migrations)
9. [Build & Run Scripts](#build--run-scripts)
10. [Deployment](#deployment)
11. [API Reference (Backend)](#api-reference-backend)
12. [Contributing](#contributing)
13. [License](#license)

---

## Overview

DevHub is a **full‑stack monorepo** that provides a modern UI for exploring GitHub repositories and developers, plus a private dashboard for the authenticated user.  All GitHub requests are proxied through the backend, keeping OAuth tokens and JWT secrets server‑side.

The app is production‑ready:

- **Secure authentication** – JWT in httpOnly, SameSite‑strict cookies; optional GitHub OAuth with encrypted access tokens stored in PostgreSQL.
- **Typed API layer** – TypeScript on both client and server.
- **Responsive UI** – Tailwind‑CSS, React 18, and a mobile‑first layout that mirrors the desktop experience.
- **Scalable data store** – PostgreSQL (Supabase) with migrations for favorites and OAuth token storage.

---

## Features

| Feature | Description |
|--------|-------------|
| **GitHub OAuth & Email/Password login** | Users can sign‑in via GitHub (OAuth 2.0) or a traditional email + password flow. |
| **Personal Dashboard** | Shows stars, forks, contributions, language breakdown, recent activity, gists, starred repos, and organizations for the logged‑in user. |
| **Developer Profile** | Public view of any GitHub user with repos, contributions heatmap, activity timeline, and “save developer” capability. |
| **Explore** | Search repositories & developers with filters (language, stars, license, etc.) and view results in infinite‑scroll style. |
| **Repository Details** | Full repo view with description, topics, language breakdown, recent commits, contributors, and fork/star actions. |
| **Saved Bookmarks** | Users can star repositories, follow developers, and organise collections. |
| **Rate‑limit Shield** | UI banner warns when the backend is operating in “GitHub API Safe Mode”. |
| **Tailwind UI components** | Re‑usable components (`Avatar`, `MetricCard`, `LanguageBar`, etc.) with dark‑mode styling. |
| **Error handling / loading states** | Skeleton UI placeholders, retry buttons, and clear error messages for API failures. |
| **Testing hooks** | All API routes return proper HTTP status codes and JSON error payloads. |

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Front‑end** | React 18, TypeScript, Vite 5, Tailwind CSS, TanStack React‑Query |
| **Back‑end** | Express 4, TypeScript, Node 18+, `pg` (PostgreSQL client) |
| **Auth** | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), httpOnly SameSite cookies |
| **Database** | PostgreSQL (Supabase) – migrations in `db/migrations/` |
| **CI / Deploy** | Render (server) + Vercel (client) – environment variables injected via platform UI |
| **Package Management** | npm workspaces (`apps/*`, `packages/*`) |
| **Version Control** | Git (monorepo) – `master` and `main` branches (see `gitStatus` summary) |

---

## Project Structure

```
my-app/
├─ apps/
│  ├─ client/                # React SPA
│  │  ├─ src/
│  │  │  ├─ components/      # UI primitives (Avatar, MetricCard, etc.)
│  │  │  ├─ context/        # AuthProvider + useAuth hook
│  │  │  ├─ hooks/          # useAuth, useDevHub, etc.
│  │  │  ├─ pages/          # Home, Explore, Dashboard, DeveloperProfile, RepositoryDetails, SavedItems, Auth
│  │  │  ├─ services/       # API wrappers (githubApi.ts, authService.ts, favoritesApi.ts)
│  │  │  ├─ store/          # Zustand store (`useDevHubStore`)
│  │  │  ├─ types/          # TypeScript interfaces (DashboardData, Repository, Developer, …)
│  │  │  ├─ lib/            # `apiBase.ts`, `utils.ts`
│  │  │  └─ App.tsx, main.tsx, vite.config.ts
│  │  └─ package.json
│  └─ server/                # Express API
│     ├─ src/
│     │  ├─ config/        # env.ts, db.ts
│     │  ├─ middleware/    # auth.ts (JWT validation, user load)
│     │  ├─ models/        # user.ts (User schema + CRUD helpers)
│     │  ├─ services/      # auth.ts (password hashing, JWT), github.service.ts (GitHub proxy)
│     │  ├─ routes/        # auth.ts, github.ts, favorites.ts
│     │  └─ index.ts        # Express app bootstrap, CORS, cookie parser
│     └─ package.json
├─ db/
│  └─ migrations/
│     ├─ 20240920_create_favorites.sql
│     └─ 20240925_add_github_access_token.sql
├─ package.json               # root workspace scripts
└─ .env.example               # template for required env vars
```

---

## Prerequisites

| Tool | Minimum version |
|------|-----------------|
| Node.js | 18.x |
| npm | 9.x |
| PostgreSQL | 13 (compatible with Supabase) |
| Git | any modern version |
| (Optional) Render CLI / Vercel CLI – for deployment |

---

## Getting Started (Local Development)

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-org/devhub.git
   cd devhub/my-app
   ```

2. **Create a `.env` file** at the repo root (see [Environment Variables](#environment-variables) for required keys).  A template is provided in `.env.example`.

3. **Install dependencies** (root workspace installs all apps):

   ```bash
   npm install
   ```

4. **Run the PostgreSQL database** (local or Supabase).  For a quick local Docker container:

   ```bash
   docker run --name devhub-pg -e POSTGRES_PASSWORD=devhub -e POSTGRES_DB=devhub -p 5432:5432 -d postgres:15
   ```

5. **Apply database migrations**

   ```bash
   # From the repo root
   npm run db:migrate   # or manually with psql:
   # psql $DATABASE_URL -f db/migrations/20240920_create_favorites.sql
   # psql $DATABASE_URL -f db/migrations/20240925_add_github_access_token.sql
   ```

6. **Start both client and server**

   ```bash
   # Terminal 1 – server
   npm run server-dev

   # Terminal 2 – client
   npm run client-dev
   ```

   The client runs on `http://localhost:3000` and proxies `/api` calls to the server on `http://localhost:4000` (as defined in `vite.config.ts`).

7. **Open the app**

   Visit `http://localhost:3000` → you’ll be redirected to the login page. Use the **GitHub** button or create an email account with the **Register** flow.

---

## Environment Variables

| Variable | Scope | Description | Example |
|----------|-------|-------------|--------|
| `DATABASE_URL` | Server | PostgreSQL connection string (`postgres://user:pass@host:5432/db`) | `postgres://devhub:devhub@localhost:5432/devhub` |
| `JWT_SECRET` | Server | Secret for signing JWTs (minimum 32‑byte Base64) | `mySuperSecretKey1234567890abcdef` |
| `GITHUB_CLIENT_ID` | Server | GitHub OAuth app client ID | `Iv1.1234567890abcdef` |
| `GITHUB_CLIENT_SECRET` | Server | GitHub OAuth app client secret | `abcd1234efgh5678ijkl9012mnop3456qrst7890` |
| `GITHUB_CALLBACK_URL` | Server | Full callback URL registered in GitHub OAuth app (must match) | `https://devhub-j7g6.onrender.com/api/auth/github/callback` |
| `GITHUB_TOKEN` | Server | Personal access token (optional) for unauthenticated public GitHub requests | `ghp_XXXXXXXXXXXXXXXXXXXX` |
| `FRONTEND_URL` | Server | URL where the client is hosted (used for redirects after OAuth) | `https://client-jet-two-14.vercel.app` |
| `VITE_API_URL` | Client | Base URL for the backend API (client‑side) | `http://localhost:4000` |
| `NODE_ENV` | Both | `production` enables secure cookies (`secure: true`). Use `development` locally. | `development` |
| `PORT` (optional) | Server | Port on which the Express server listens (defaults to `4000`). | `4000` |

All variables are loaded by `apps/server/src/config/env.ts`.  Missing variables cause a runtime error with a clear message, preventing accidental insecure defaults.

---

## Database Migrations

Migrations are raw SQL files stored in `db/migrations/`.

| Migration | Purpose |
|-----------|---------|
| `20240920_create_favorites.sql` | Creates `favorites` table (`id`, `user_id`, `type`, `target`, timestamps). |
| `20240925_add_github_access_token.sql` | Adds `github_access_token` column to `users` (stores encrypted OAuth token). |

Run migrations with any PostgreSQL client (`psql`, `pgAdmin`, Supabase UI) or automate with a migration tool of your choice.  The server expects the column to exist; otherwise OAuth token updates will fail.

---

## Build & Run Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `client-dev` | `npm run dev --workspace apps/client` | Starts Vite dev server (client) on port 3000. |
| `server-dev` | `npm run dev --workspace apps/server` | Starts Express dev server (TSX) on port 4000. |
| `dev` | `concurrently "npm run dev --workspace apps/client" "npm run dev --workspace apps/server"` | Run both front‑ and back‑end simultaneously. |
| `client-build` | `npm run build --workspace apps/client` | Produces production static assets in `apps/client/dist`. |
| `server-build` | `npm run build --workspace apps/server` | Compiles TypeScript to `apps/server/dist`. |
| `build` | `concurrently "npm run build --workspace apps/client" "npm run build --workspace apps/server"` | Full monorepo build. |
| `render-build` | `npm install && npm run server-build` | Helper used by Render platform to install deps and build the server. |
| `render-start` | `npm run start --workspace apps/server` | Entry point for Render deployments. |
| `start` | `npm run start --workspace apps/server` | Starts the compiled server (`node apps/server/dist/index.js`). |

---

## Deployment

### Server (Render)

1. **Create a Render Web Service** (Dockerless). 
2. Set the **Build Command** to `npm run render-build`. 
3. Set the **Start Command** to `npm run render-start`. 
4. Add all required environment variables (`DATABASE_URL`, `JWT_SECRET`, `GITHUB_*`, `FRONTEND_URL`, `NODE_ENV=production`). 
5. Render automatically installs the repo and runs the build script.

**CORS** is configured to allow the front‑end origin (`FRONTEND_URL`) plus localhost for development.

### Client (Vercel)

1. Connect the GitHub repository to Vercel. 
2. Set **Project Settings → Build & Development Settings**:
   * **Framework Preset**: `Vite` (auto‑detected). 
   * **Build Command**: `npm run client-build`. 
   * **Output Directory**: `apps/client/dist`. 
3. Add the env var `VITE_API_URL` pointing to the deployed Render service (e.g., `https://devhub-j7g6.onrender.com`).

Vite’s `proxy` configuration (dev only) forwards `/api` to the local server; in production the client talks directly to the Render endpoint.

---

## API Reference (Backend)

All endpoints are under `/api`.  They require `credentials: include` on the client side to send cookies.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **POST** | `/api/auth/register` | ❌ | Register a new user (email + password). Returns JWT cookie. |
| **POST** | `/api/auth/login` | ❌ | Email/password login. Returns JWT cookie. |
| **POST** | `/api/auth/logout` | ✅ | Clears session cookie. |
| **GET** | `/api/auth/me` | ✅ | Returns current user profile (incl. `github_username` if linked). |
| **GET** | `/api/auth/github` | ❌ | Starts GitHub OAuth flow (redirects to GitHub). |
| **GET** | `/api/auth/github/callback` | ❌ | Handles OAuth callback, exchanges code for token, creates/links user, sets JWT cookie, redirects to front‑end. |
| **GET** | `/api/github/search/repositories?q=…` | ❌ | Public repository search via GitHub REST `search/repositories`. |
| **GET** | `/api/github/search/users?q=…` | ❌ | Public user search. |
| **GET** | `/api/github/repos/:owner/:repo` | ❌ | Full repository information (repo, languages, contributors, commits). |
| **GET** | `/api/github/users/:username` | ❌ | Public profile data (basic user info). |
| **GET** | `/api/github/users/:username/profile` | ❌ | Enriched developer profile (stats, languages, contributions, activity, top repos). |
| **GET** | `/api/github/me/dashboard` | ✅ | Authenticated dashboard for the logged‑in user (private repos, token‑protected data). |
| **GET** | `/api/github/recommendations` | ✅ | Personalized repo recommendations based on user’s language usage. |
| **GET** | `/api/favorites` | ✅ | List all saved items for the current user. |
| **POST** | `/api/favorites` | ✅ | Add a favorite (`type` = `repository|developer`, `target` = `owner/repo` or username). |
| **DELETE** | `/api/favorites/:type/:target` | ✅ | Remove a favorite. (`target` must be URL‑encoded.) |
| **GET** | `/api/github/rate_limit` | ❌ | Returns current GitHub API rate‑limit status (used for the UI shield). |

All JSON responses follow a consistent `{ data?, error? }` pattern where appropriate. Errors include HTTP status codes and human‑readable messages.

---

## Contributing

1. Fork the repository and create a feature branch. 
2. Follow existing code style (Prettier + Tailwind conventions). 
3. Run the linter / type‑check before committing:

   ```bash
   npm run lint   # (if configured) 
   npm run type-check   # tsc --noEmit
   ```

4. Add or update migrations in `db/migrations/` when modifying the schema. 
5. Write unit / integration tests in `apps/*/src/**/__tests__` (if a test suite exists) and ensure they pass:

   ```bash
   npm test
   ```

6. Submit a pull request targeted at the `main` branch.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for full terms.

---

