# DevHub — GitHub Discovery & Analytics Platform

> **Discover developers. Explore repositories. Find what's being built.**

DevHub is a GitHub-powered discovery and analytics platform combining in-depth repository analytics with an interactive, LinkedIn-style project discovery feed.

---

## 📚 Project Documentation & Specifications

All product, technical, and implementation specifications have been thoroughly revised and structured:

| Document | Path | Description |
|---|---|---|
| **Product Requirements Document (PRD)** | [`dock/PRD.md`](file:///c:/Users/8319j/OneDrive/Documents/jana%20project/Devhub/dock/PRD.md) | Full PRD covering product vision, user personas, Phase 1 (Explorer & Analytics) & Phase 2 (Discovery Feed) specifications, user stories, and non-functional requirements. |
| **Technical Requirements Document (TRD)** | [`dock/TRD.md`](file:///c:/Users/8319j/OneDrive/Documents/jana%20project/Devhub/dock/TRD.md) | Technical architecture, React + Node.js + Supabase PostgreSQL stack, DDL schema & Prisma models, REST API specifications, ETag caching, rate-limit shielding, and trending scoring algorithms. |
| **Phase 1 Implementation Plan** | [`agent/implementation_plan_phase1.md`](file:///c:/Users/8319j/OneDrive/Documents/jana%20project/Devhub/agent/implementation_plan_phase1.md) | Step-by-step engineering roadmap for Phase 1: Authentication, GitHub Explorer, Repository Analytics (Charts), Favourites Persistence, and User Dashboard. |
| **Phase 2 Implementation Plan** | [`agent/implementation_plan_phase2.md`](file:///c:/Users/8319j/OneDrive/Documents/jana%20project/Devhub/agent/implementation_plan_phase2.md) | Step-by-step engineering roadmap for Phase 2: Home Page Discovery Feed, Trending & Scoring Engine, Category Filtering, Developer Spotlight, and Personalization. |

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Vite, React Router v6, Tailwind CSS, TanStack Query v5, Recharts, Lucide Icons.
* **Backend:** Node.js, Express, TypeScript, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `helmet`, `node-cache`, `axios` / `@octokit/rest`.
* **Database:** Supabase PostgreSQL with Prisma ORM / SQL Migrations.
* **External Integration:** GitHub REST API v3 with caching and rate-limit mitigation.

---

## 🗺️ Roadmap Overview

```
Phase 1: GitHub Explorer (MVP)
├── Secure JWT Authentication & Registration
├── GitHub User & Repository Search
├── Developer Profile Page (/developers/:username)
├── Repository Details & Analytics Charts (/repositories/:owner/:repo)
├── Persistent Favourites (Database Collections)
└── Authenticated User Dashboard

Phase 2: GitHub Discovery Feed (Next-Gen)
├── LinkedIn-Style Home Discovery Feed (/)
├── Featured Repository Hero Banner
├── Dynamic Trending Engine (Daily, Weekly, Monthly + Technology filters)
├── 8 Curated Category Discovery Chips (AI/ML, Web, DevTools, etc.)
├── Developer Spotlight Cards
├── Personalized Recommendations (Matching user interests & saved tags)
└── Safe Mode Rate-Limit Fallback & Infinite Scroll
```
