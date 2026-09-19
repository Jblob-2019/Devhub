export const meta = {
  name: 'devhub-implementation',
  description: 'Orchestrates full implementation of DevHub (frontend, backend, auth, GitHub integration, UI, DB, tests, CI/CD) based on the PRD and TRD.',
  phases: [
    { title: 'Scaffold' },
    { title: 'Authentication' },
    { title: 'GitHub Integration' },
    { title: 'UI Components' },
    { title: 'Database Design' },
    { title: 'Testing Strategy' },
    { title: 'CI/CD Pipeline' },
  ],
};

/* ---------- JSON Schemas ---------- */
const SCAFFOLD_SCHEMA = {
  type: 'object',
  properties: {
    directories: { type: 'array', items: { type: 'string' } },
    files: { type: 'array', items: { type: 'string' } },
  },
  required: ['directories', 'files'],
};

const AUTH_SCHEMA = {
  type: 'object',
  properties: {
    routes: { type: 'array', items: { type: 'string' } },
    models: { type: 'array', items: { type: 'string' } },
    tests: { type: 'array', items: { type: 'string' } },
  },
  required: ['routes', 'models', 'tests'],
};

const GITHUB_INTEGRATION_SCHEMA = {
  type: 'object',
  properties: {
    endpoints: { type: 'array', items: { type: 'string' } },
    envVars: { type: 'array', items: { type: 'string' } },
    tests: { type: 'array', items: { type: 'string' } },
  },
  required: ['endpoints', 'envVars', 'tests'],
};

const UI_COMPONENTS_SCHEMA = {
  type: 'object',
  properties: {
    pages: { type: 'array', items: { type: 'string' } },
    components: { type: 'array', items: { type: 'string' } },
    tests: { type: 'array', items: { type: 'string' } },
  },
  required: ['pages', 'components', 'tests'],
};

const DB_SCHEMA = {
  type: 'object',
  properties: {
    tables: { type: 'array', items: { type: 'string' } },
    migrations: { type: 'array', items: { type: 'string' } },
    seedData: { type: 'array', items: { type: 'string' } },
  },
  required: ['tables', 'migrations'],
};

const TEST_SCHEMA = {
  type: 'object',
  properties: {
    unitTests: { type: 'array', items: { type: 'string' } },
    integrationTests: { type: 'array', items: { type: 'string' } },
    coverage: { type: 'number' },
  },
  required: ['unitTests', 'integrationTests', 'coverage'],
};

const CI_CD_SCHEMA = {
  type: 'object',
  properties: {
    workflows: { type: 'array', items: { type: 'string' } },
    scripts: { type: 'array', items: { type: 'string' } },
    env: { type: 'array', items: { type: 'string' } },
  },
  required: ['workflows', 'scripts'],
};

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['passed'],
};

/* ---------- Phase 1: Project Scaffolding ---------- */
phase('Scaffold');
log('🔧 Phase 1 – Project scaffolding: setting up monorepo, TypeScript, basic tooling.');

const scaffold = await parallel([
  () => agent(
    `Create a new monorepo using Yarn workspaces for a React frontend (create‑react‑app with TypeScript)
     and a Node.js backend (Express) also typed with TypeScript.
     Include top‑level tsconfig.json, eslint, prettier, .gitignore, and a README describing the project layout.
     Return JSON matching ${JSON.stringify(SCAFFOLD_SCHEMA)}.`,
    { schema: SCAFFOLD_SCHEMA, label: 'Create monorepo structure' }
  ),
  () => agent(
    `Initialize a Git repository, add an initial commit with all scaffolded files, set up a pre‑commit hook for linting.
     Return JSON with created files and hook details matching ${JSON.stringify(SCAFFOLD_SCHEMA)}.`,
    { schema: SCAFFOLD_SCHEMA, label: 'Git init & hooks' }
  ),
]);

log('🕵️ Verify scaffolding completeness and buildability.');
const scaffoldVerify = await parallel([
  () => agent(
    `Check that the monorepo structure follows best practices (workspaces, shared scripts, consistent linting).
     List any missing or mis‑named directories/files. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Scaffold best‑practice check' }
  ),
  () => agent(
    `Attempt to run "yarn workspace frontend build" and "yarn workspace backend build".
     Report whether each succeeded. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Build verification' }
  ),
]);

log(`🟢 Scaffold result: ${JSON.stringify(scaffold)}; verification: ${JSON.stringify(scaffoldVerify)}`);

/* ---------- Phase 2: Authentication System ---------- */
phase('Authentication');
log('🔐 Phase 2 – Authentication: registration, login, session management.');

const auth = await parallel([
  () => agent(
    `Implement user registration endpoint (POST /api/auth/register) with validation (email format, password strength),
     password hashing (bcrypt), duplicate email check, and DB insertion.
     Return list of route files and model files created (JSON matching ${JSON.stringify(AUTH_SCHEMA)}).`,
    { schema: AUTH_SCHEMA, label: 'Registration' }
  ),
  () => agent(
    `Implement login endpoint (POST /api/auth/login) that validates credentials, issues JWT, and sets HTTP‑only cookie.
     Return created files.`,
    { schema: AUTH_SCHEMA, label: 'Login' }
  ),
  () => agent(
    `Add session middleware in Express to verify JWT on protected routes, handle expiration, and logout endpoint.
     Return middleware filenames.`,
    { schema: AUTH_SCHEMA, label: 'Session management' }
  ),
]);

log('🕵️ Verify authentication flow and security.');
const authVerify = await parallel([
  () => agent(
    `Attempt to register a user with a weak password and an invalid email.
     Ensure the API rejects with appropriate status codes. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Auth validation check' }
  ),
  () => agent(
    `Simulate login with correct and incorrect credentials. Verify JWT is set correctly and that protected endpoints reject missing/invalid tokens. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Auth token check' }
  ),
  () => agent(
    `Run a static security scan (e.g., npm audit) on the backend packages. List any high‑severity issues. Return ${JSON.stringify(VERIFY_SCHEMA)} with issues array.`,
    { schema: VERIFY_SCHEMA, label: 'Security audit' }
  ),
]);

log(`🟢 Auth implementation: ${JSON.stringify(auth)}; verification: ${JSON.stringify(authVerify)}`);

/* ---------- Phase 3: GitHub API Integration ---------- */
phase('GitHub Integration');
log('🌐 Phase 3 – GitHub API integration: searching developers, repositories, analytics.');

const github = await parallel([
  () => agent(
    `Create a service layer (Node.js) that wraps GitHub REST API calls for:
       • Search developers by username/name,
       • Search repositories (name, keywords, language, topics),
       • Fetch repository analytics (stars, forks, issues, contributors, languages, commit activity).
     Include rate‑limit handling and caching strategy. Return list of service files (JSON matching ${JSON.stringify(GITHUB_INTEGRATION_SCHEMA)}).`,
    { schema: GITHUB_INTEGRATION_SCHEMA, label: 'GitHub service layer' }
  ),
  () => agent(
    `Add environment variable configuration (GITHUB_TOKEN) with secure loading via dotenv.
     Provide fallback error handling for missing token. Return config file list.`,
    { schema: GITHUB_INTEGRATION_SCHEMA, label: 'Env config' }
  ),
  () => agent(
    `Write integration tests (using Jest + supertest) that mock GitHub responses for each endpoint and verify correct parsing and error handling. Return test file list.`,
    { schema: GITHUB_INTEGRATION_SCHEMA, label: 'GitHub integration tests' }
  ),
]);

log('🕵️ Verify GitHub integration reliability.');
const githubVerify = await parallel([
  () => agent(
    `Run the integration test suite with mocked 500 and rate‑limit responses. Confirm that the service retries or fails gracefully. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'GitHub error handling test' }
  ),
  () => agent(
    `Perform a real call (using a sandbox token) to search public repositories and ensure response schema matches expected fields. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Live API sanity check' }
  ),
]);

log(`🟢 GitHub integration: ${JSON.stringify(github)}; verification: ${JSON.stringify(githubVerify)}`);

/* ---------- Phase 4: Core UI Components ---------- */
phase('UI Components');
log('🖥️ Phase 4 – UI components: home feed, explorer, profile pages, saved collections.');

const ui = await parallel([
  () => agent(
    `Design and implement the Home Discovery Feed page (React) that displays featured, trending, AI, and recent repositories using cards. Include pagination and infinite scroll. Return list of page and component files (JSON matching ${JSON.stringify(UI_COMPONENTS_SCHEMA)}).`,
    { schema: UI_COMPONENTS_SCHEMA, label: 'Home feed' }
  ),
  () => agent(
    `Create Explorer pages:
       • /explore/developers – searchable grid with avatar, stats, follow button,
       • /explore/repositories – searchable list with filters (language, topics, stars).
     Return component files.`,
    { schema: UI_COMPONENTS_SCHEMA, label: 'Explorer' }
  ),
  () => agent(
    `Implement Developer Profile page (/developers/:username) showing avatar, bio, stats, recent repos, and a “Save developer” action. Return page/component files.`,
    { schema: UI_COMPONENTS_SCHEMA, label: 'Developer profile' }
  ),
  () => agent(
    `Implement Repository Details page (/repositories/:owner/:repo) with header, metadata, analytics widgets, and “Save repository” action. Return page/component files.`,
    { schema: UI_COMPONENTS_SCHEMA, label: 'Repo details' }
  ),
  () => agent(
    `Create Saved Collections UI (Saved developers, Saved repositories) with remove & organize functionality. Return UI files.`,
    { schema: UI_COMPONENTS_SCHEMA, label: 'Saved collections UI' }
  ),
  () => agent(
    `Add responsive styling (Tailwind CSS) and accessibility checks (ARIA labels, focus order). Return style files.`,
    { schema: UI_COMPONENTS_SCHEMA, label: 'Styling & accessibility' }
  ),
]);

log('🕵️ Verify UI component behavior and accessibility.');
const uiVerify = await parallel([
  () => agent(
    `Run automated component tests (React Testing Library) to ensure each page renders with mock data, navigation works, and save actions update local state. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Component rendering tests' }
  ),
  () => agent(
    `Execute an axe accessibility audit on each major page and return any violations. Return ${JSON.stringify(VERIFY_SCHEMA)} with issues list.`,
    { schema: VERIFY_SCHEMA, label: 'Accessibility audit' }
  ),
  () => agent(
    `Perform visual regression testing (Chromatic or similar) on the Home feed and Explorer pages. Return pass status.`,
    { schema: VERIFY_SCHEMA, label: 'Visual regression' }
  ),
]);

log(`🟢 UI components: ${JSON.stringify(ui)}; verification: ${JSON.stringify(uiVerify)}`);

/* ---------- Phase 5: Database Schema Design ---------- */
phase('Database Design');
log('💾 Phase 5 – Database schema: users, favourites, collections.');

const db = await parallel([
  () => agent(
    `Design PostgreSQL schema:
       • users (id, name, email, password_hash, created_at),
       • favourites (id, user_id, type ENUM('developer','repository'), target_id, created_at),
       • collections (id, user_id, name, description, created_at).
     Provide SQL CREATE statements and migration scripts (using Prisma or Knex). Return list of migration files (JSON matching ${JSON.stringify(DB_SCHEMA)}).`,
    { schema: DB_SCHEMA, label: 'SQL schema' }
  ),
  () => agent(
    `Set up Prisma (or TypeORM) models that map to the above tables with appropriate relations and indexes. Return model files.`,
    { schema: DB_SCHEMA, label: 'ORM models' }
  ),
  () => agent(
    `Write seed scripts to create demo users and sample favourite entries. Return seed script files.`,
    { schema: DB_SCHEMA, label: 'Seed data' }
  ),
]);

log('🕵️ Verify database integrity and constraints.');
const dbVerify = await parallel([
  () => agent(
    `Run migration and seed scripts against a fresh test database. Ensure all tables are created, constraints enforced, and no migration errors occur. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Migration test' }
  ),
  () => agent(
    `Attempt to insert duplicate favourite entries for the same user and target. Verify that a unique constraint prevents duplication. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Duplication constraint check' }
  ),
  () => agent(
    `Query performance test: fetch a user's saved collections with pagination and ensure query runs under 200 ms on a dataset of 10k favourites. Return ${JSON.stringify(VERIFY_SCHEMA)} with timing info.`,
    { schema: VERIFY_SCHEMA, label: 'Performance check' }
  ),
]);

log(`🟢 DB design: ${JSON.stringify(db)}; verification: ${JSON.stringify(dbVerify)}`);

/* ---------- Phase 6: Testing Strategy ---------- */
phase('Testing Strategy');
log('🧪 Phase 6 – Testing: unit, integration, end‑to‑end.');

const testing = await parallel([
  () => agent(
    `Set up Jest with TypeScript support for unit tests across backend services and React components. Provide example test for auth registration. Return test config files list.`,
    { schema: TEST_SCHEMA, label: 'Jest setup' }
  ),
  () => agent(
    `Configure supertest for API integration tests covering auth flows, GitHub service layer, and DB interactions. Return integration test files.`,
    { schema: TEST_SCHEMA, label: 'API integration tests' }
  ),
  () => agent(
    `Add Cypress (or Playwright) end‑to‑end tests that simulate user registration, login, searching developers, saving a repo, and viewing saved collections. Return E2E test files.`,
    { schema: TEST_SCHEMA, label: 'E2E tests' }
  ),
  () => agent(
    `Integrate code coverage collection (nyc for backend, jest‑coverage for frontend) and enforce a minimum 80 % coverage threshold. Return configuration files.`,
    { schema: TEST_SCHEMA, label: 'Coverage setup' }
  ),
]);

log('🕵️ Verify test suite completeness and reliability.');
const testingVerify = await parallel([
  () => agent(
    `Run the full test suite in CI mode. Ensure all tests pass and coverage meets thresholds. Return ${JSON.stringify(VERIFY_SCHEMA)} with coverage numbers.`,
    { schema: VERIFY_SCHEMA, label: 'Full suite run' }
  ),
  () => agent(
    `Introduce a deliberate bug (e.g., missing password hash) and confirm that tests fail, demonstrating test effectiveness. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Negative test' }
  ),
  () => agent(
    `Check that flaky test detection (using jest‑flaky‑tests) reports no flaky tests after stabilization. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Flaky test check' }
  ),
]);

log(`🟢 Testing strategy: ${JSON.stringify(testing)}; verification: ${JSON.stringify(testingVerify)}`);

/* ---------- Phase 7: Deployment Pipeline (CI/CD) ---------- */
phase('CI/CD Pipeline');
log('🚀 Phase 7 – CI/CD: automated build, test, and deployment.');

const cicd = await parallel([
  () => agent(
    `Create GitHub Actions workflow:
       • On push to main, run lint, type‑check, unit/integration tests,
       • Build Docker images for frontend and backend,
       • Push images to Docker Hub,
       • Deploy to a staging environment (e.g., Fly.io or Render).
     Return the .github/workflows/*.yml file list (JSON matching ${JSON.stringify(CI_CD_SCHEMA)}).`,
    { schema: CI_CD_SCHEMA, label: 'GitHub Actions CI' }
  ),
  () => agent(
    `Add environment variable management (GitHub Secrets) for DATABASE_URL, GITHUB_TOKEN, JWT_SECRET, etc. Provide a README section documenting required secrets. Return config documentation files.`,
    { schema: CI_CD_SCHEMA, label: 'Env secrets doc' }
  ),
  () => agent(
    `Implement a rollback strategy: tag releases, keep previous Docker images, and provide a manual “revert” workflow. Return scripts or workflow steps.`,
    { schema: CI_CD_SCHEMA, label: 'Rollback strategy' }
  ),
]);

log('🕵️ Verify CI/CD pipeline functionality.');
const cicdVerify = await parallel([
  () => agent(
    `Trigger the CI workflow on a test branch, ensure all steps succeed, and that a staging deployment becomes reachable. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'CI run verification' }
  ),
  () => agent(
    `Simulate a failed deployment (e.g., missing env var) and confirm that the pipeline aborts and notifies appropriately. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Failure handling' }
  ),
  () => agent(
    `Run the rollback workflow on the staging environment and verify the previous version is redeployed successfully. Return ${JSON.stringify(VERIFY_SCHEMA)}.`,
    { schema: VERIFY_SCHEMA, label: 'Rollback test' }
  ),
]);

log(`🟢 CI/CD pipeline: ${JSON.stringify(cicd)}; verification: ${JSON.stringify(cicdVerify)}`);

/* ---------- Summary ---------- */
log('✅ All phases completed. Review the logs above for each phase\'s deliverables and verification results. If any verification failed, iterate on the corresponding sub‑tasks before proceeding to production release.');
