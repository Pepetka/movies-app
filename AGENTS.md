# Repository Guidelines

## Project Structure & Module Organization

### Backend (`apps/api`)

NestJS API service with Fastify adapter. Entry point `apps/api/src/main.ts`, modular structure in `apps/api/src/`:

**Core Modules:**

- `auth/` - JWT authentication with two-token scheme (access + refresh)
  - `auth.controller.ts` - Register, login, logout, refresh endpoints
  - `auth.service.ts` - Authentication logic with bcrypt password hashing
  - `guards/` - AuthGuard, RefreshGuard
  - `strategies/` - JWT access/refresh strategies
  - `dto/` - AuthRequest, AuthResponse, Login, Register DTOs

- `user/` - User management with role-based access
  - `user.controller.ts` - CRUD operations with role restrictions
  - `user.service.ts` - Business logic layer
  - `user.repository.ts` - Database operations via Drizzle
  - `dto/` - UserCreate, UserUpdate, UserResponse DTOs

- `groups/` - Group management with member roles
  - `groups.controller.ts` - CRUD + member management, ownership transfer
  - `groups.service.ts` - Business logic with role checks
  - `groups.repository.ts` - Database operations via Drizzle
  - `dto/` - GroupCreate, GroupUpdate, GroupMemberAdd, etc.

- `movies/` - Movie management with Kinopoisk integration
  - `movies.controller.ts` - Search (Kinopoisk), CRUD operations
  - `movies.service.ts` - Kinopoisk API integration, deduplication logic
  - `movies.repository.ts` - Database operations via Drizzle
  - `providers/` - Kinopoisk provider implementation
  - `dto/` - MovieCreate, MovieSearch, MovieResponse, etc.

- `health/` - Health check endpoints
- `csrf/` - CSRF token generation and validation

**API Base URL:** All endpoints available at `/api/v1/...`

- **Local:** `http://localhost:8080/api/v1`
- **Swagger:** `http://localhost:8080/api/docs` (non-production)

**Database Layer:**

- `db/schemas/` - Drizzle ORM schema definitions:
  - `users.ts` - User accounts with auth
  - `movies.ts` - Provider movies (Kinopoisk snapshot)
  - `groups.ts` - User groups
  - `group-members.ts` - Group membership with roles
  - `group-movies.ts` - Movies in groups with status
  - `custom-movies.ts` - User-created movies
- `db/migrate.ts` - Migration runner script
- `db/seed.ts` - Admin user seeder
- `db/grant-admin.ts` - Admin role grant utility

**Common Utilities:**

- `common/configs/` - Validation, throttle, helmet configurations
- `common/decorators/` - @Public, @Roles, @Author, @User, @Cookies, @CsrfProtected
- `common/guards/` - AuthGuard, RolesGuard, CsrfGuard, GroupMemberGuard, GroupModeratorGuard, GroupAdminGuard
- `common/exceptions/` - Custom exceptions (EmailAlreadyInUse, NotGroupMember, etc.)
- `common/validators/` - Custom class-validator decorators

### Frontend (`apps/web`)

SvelteKit web app. Routes live in `apps/web/src/routes`, shared UI/helpers in `apps/web/src/lib`, and static assets in `apps/web/static`.

**Current State:**

- Minimal UI with health monitoring component
- Svelte 5 with new runes syntax ($state, $effect)
- API client infrastructure in place
- Uses shared `@repo/ui` package for components

### Packages

- `packages/eslint-config` - Shared ESLint configurations (base, nest.js, svelte.js)
- `packages/typescript-config` - Shared TypeScript configurations
- `packages/ui` - Shared Svelte components (currently has HealthCheck)

### Workspace Configuration

- `package.json` - Root scripts and workspace config
- `pnpm-workspace.yaml` - Package definitions
- `turbo.json` - Build pipeline and task caching

## Build, Test, and Development Commands

Run commands from the repo root with pnpm (workspace is pnpm-managed).

### Development

- `pnpm dev`: run all dev tasks via Turborepo
- `pnpm dev --filter=web`: frontend only (localhost:5173)
- `pnpm dev --filter=api`: backend only (localhost:8080)

### Database

- `pnpm db:run`: start PostgreSQL via Docker Compose
- `pnpm db:stop`: stop PostgreSQL containers

### Build

- `pnpm build`: build all packages/apps
- `pnpm build --filter=web` / `--filter=api`: single app

### Code Quality

- `pnpm lint`: ESLint check only
- `pnpm lint:fix`: ESLint auto-fix only
- `pnpm format`: Prettier format only
- `pnpm check`: ESLint + type-check
- `pnpm fix`: ESLint auto-fix + Prettier format
- `pnpm check:types`: type-check only

### Tests

- `pnpm test`: unit tests (workspace-wide, runs only where tests exist)
- `pnpm test:unit`: unit tests
- `pnpm test:e2e`: E2E tests
- API-specific: `cd apps/api && pnpm test`, `pnpm test:watch`, `pnpm test:cov`

### Database Migrations (API)

```bash
cd apps/api
pnpm run db:generate    # Generate migrations from schema
pnpm run db:migrate     # Run migrations
pnpm run db:seed        # Seed database with admin user
pnpm run db:grant-admin # Grant admin role to user by email
```

## Coding Style & Naming Conventions

- TypeScript is used across the repo
- Formatting enforced by Prettier; ESLint for linting
- API: single quotes, trailing commas, spaces for indentation
- Web: tabs, single quotes, 100 char line width
- Database: snake_case for columns, PascalCase for TS types
- Follow framework conventions: NestJS `AppService`, Svelte PascalCase components

## Authentication & Security

### JWT Two-Token Scheme

- **Access Token**: Short-lived (15m), sent via Authorization header
- **Refresh Token**: Long-lived (7d), httpOnly cookie, rotated on refresh

### Guards (execution order in app.module.ts)

1. **ThrottlerGuard** - Rate limiting (disabled in test environment)
2. **CsrfGuard** - CSRF protection (disabled in test)
3. **AuthGuard** - JWT validation (bypass with @Public())
4. **RolesGuard** - Role-based access (@Roles('admin'))
5. **GroupMemberGuard** - Group membership check
6. **GroupModeratorGuard** - Moderator or admin in group
7. **GroupAdminGuard** - Group admin only

### User Roles

**Global roles (users table):**

- `USER` - Default role for authenticated users
- `ADMIN` - Full administrative privileges

**Group roles (group_members table):**

- `member` - Regular group member
- `moderator` - Can manage movies and members
- `admin` - Full group control, can transfer ownership

### Rate Limiting

- `short`: 3 req/sec (critical auth endpoints)
- `medium`: 20 req/10sec (refresh tokens)
- `long`: 100 req/60sec (general API)

## Testing Guidelines

- API tests use Jest with `*.spec.ts` naming
- E2E tests in `apps/api/test` using Jest e2e config
- Web app: use `pnpm --filter web check` for Svelte type checks
- Tests cover auth flows, user CRUD, health checks

## Commit & Pull Request Guidelines

- Use concise, imperative commit summaries
- Add scope for clarity: `api:`, `web:`, `db:`, etc.
- PRs should include: description, testing notes, screenshots for UI changes
- Use Changesets for versionable changes

## Configuration & Environment Tips

- Turborepo treats `.env*` files as inputs
- Keep secrets in `.env.local` (never commit)
- Required env vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`
- See `.env.example` for full reference
- Keep app-specific config inside each app folder

## Database Notes

- PostgreSQL with Drizzle ORM
- Migrations must be generated locally and committed
- Migrations run automatically in CI/CD before service restart
- Current schema:
  - `users` - User accounts with auth tokens
  - `movies` - Provider movies (Kinopoisk snapshot)
  - `groups` - User groups
  - `group_members` - Group membership with roles
  - `group_movies` - Movies in groups with status
  - `custom_movies` - User-created movies per group
