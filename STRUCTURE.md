# Repository Structure Overview

```
my-app/
├─ .env                 # Environment variables (JWT secret, GitHub token, DB URL, etc.)
├─ .env.example        # Example env file (without secrets)
├─ package.json         # Root workspace package (handles workspaces)
├─ README.md            # Project overview
├─ STRUCTURE.md        # This file – explains the repo layout
├─ apps/
│   ├─ client/         # Front‑end React application
│   │   ├─ public/      # Static assets (favicon, etc.)
│   │   ├─ src/
│   │   │   ├─ components/   # UI components (Avatar, SaveButton, etc.)
│   │   │   ├─ pages/        # Page components (Home, Explore, Dashboard…)
│   │   │   ├─ hooks/        # Custom React hooks (useDevHub, etc.)
│   │   │   ├─ lib/          # Utility helpers
│   │   │   ├─ services/     # API service layer (GitHub, future backend calls)
│   │   │   ├─ store/        # Zustand / custom state stores
│   │   │   ├─ types/        # TypeScript type definitions
│   │   │   ├─ index.css
│   │   │   └─ main.tsx
│   │   ├─ vite.config.ts
│   │   ├─ tsconfig.json
│   │   └─ package.json
│   └─ server/         # Express backend (Node + TS)
│       ├─ src/
│       │   ├─ config/      # DB connection & other config helpers
│       │   ├─ controllers/ # Express route handlers (auth, etc.)
│       │   ├─ middleware/  # Auth, logging, error handling
│       │   ├─ models/      # TypeScript types / ORM models
│       │   ├─ routes/      # API route definitions (api.ts, auth.routes.ts…)
│       │   ├─ services/   # Business logic (GitHub service, data fixtures)
│       │   └─ index.ts     # Server entry point
│       ├─ tsconfig.json
│       ├─ package.json
│       └─ .env (optional for local dev) 
├─ packages/            # Shared libraries (UI, types, config) – can be published
│   ├─ ui/
│   ├─ shared-types/
│   └─ config/
└─ infra/               # Docker / deployment assets
    ├─ docker-compose.yml
    ├─ Dockerfile.client
    ├─ Dockerfile.server
    └─ nginx.conf
```

**Key points**
- All environment‑specific secrets live in the root `.env`.
- The front‑end talks to the backend through the proxy defined in `vite.config.ts` (`/api` → `http://localhost:4000`).
- Backend authentication stubs are placed under `controllers/` and `middleware/` – ready for real JWT logic.
- Shared TypeScript types are kept in `apps/client/src/types` and can be extracted to `packages/shared-types` later.
- Docker files in `infra/` build the client and server images and serve the app through Nginx.

Feel free to add more folders (e.g., `tests/`, `scripts/`) as the project grows.
