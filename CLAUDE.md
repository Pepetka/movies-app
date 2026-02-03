# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turborepo monorepo for a movies application with SvelteKit frontend and NestJS backend.

## Tech Stack

- **Package Manager:** pnpm 9.0.0 (Node.js ≥18 required)
- **Build System:** Turbo 2.7.5
- **Frontend:** SvelteKit (Svelte 5) + Vite
- **Backend:** NestJS 11 + Fastify + Drizzle ORM + Jest
- **Database:** PostgreSQL
- **Language:** TypeScript 5.9

## Commands

```bash
# Development (all apps)
pnpm run dev

# Development (single app)
pnpm run dev --filter=web     # Frontend on localhost:5173
pnpm run dev --filter=api     # Backend on localhost:8080

# Database (development)
pnpm run db:run               # Start PostgreSQL via Docker
pnpm run db:stop              # Stop PostgreSQL

# Build
pnpm run build
pnpm run build --filter=web
pnpm run build --filter=api

# Code quality
pnpm run lint                # ESLint check only
pnpm run lint:fix            # ESLint auto-fix only
pnpm run format              # Prettier format only
pnpm run check               # ESLint + type-check
pnpm run fix                 # ESLint auto-fix + Prettier format
pnpm run check:types         # Type-check only

# Tests (workspace-wide, runs only where tests exist)
pnpm run test                # Unit tests
pnpm run test:unit           # Unit tests
pnpm run test:e2e            # E2E tests

# API-specific tests (cd to apps/api first)
pnpm run test                # Unit tests
pnpm run test:watch          # Watch mode
pnpm run test:cov            # Coverage
pnpm run test:e2e            # E2E tests

# Database migrations (API)
cd apps/api
pnpm run db:generate         # Generate migrations from schema
pnpm run db:migrate          # Run migrations
pnpm run db:seed             # Seed database with admin user
pnpm run db:grant-admin      # Grant admin role to user by email
```

## Architecture

```
apps/
  web/                     # SvelteKit frontend
    src/
      routes/              # SvelteKit file-based routing
      lib/                 # Shared utilities and components
  api/                     # NestJS backend
    src/
      main.ts              # Entry point (PORT env or 8080)
      app.module.ts        # Root module with global guards
      auth/                # JWT authentication module
        auth.controller.ts # Register, login, logout, refresh endpoints
        auth.service.ts    # Auth logic with bcrypt
        guards/            # AuthGuard, RefreshGuard
        strategies/        # JWT strategies for access/refresh tokens
        dto/               # AuthRequest/AuthResponse DTOs
      user/                # User management module
        user.controller.ts # CRUD operations
        user.service.ts    # Business logic
        user.repository.ts # Database operations
      health/              # Health check endpoints
      csrf/                # CSRF protection module
      db/                  # Database configuration
        schemas/           # Drizzle ORM schema definitions
        migrate.ts         # Migration runner
        seed.ts            # Database seeder
        grant-admin.ts     # Admin role grant script
      common/              # Shared utilities
        configs/           # Validation, throttle, helmet configs
        decorators/        # @Public, @Roles, @Author, @Cookies
        guards/            # AuthGuard, RolesGuard, AuthorGuard, CsrfGuard
        exceptions/        # Custom exceptions
        validators/        # Custom class-validator decorators
packages/
  eslint-config/           # Shared ESLint configs (nest.js, svelte.js)
  typescript-config/       # Shared TS configs (nest.json, svelte.json)
  ui/                      # Shared Svelte components
```

## Code Style

- **Web app:** Tabs, single quotes, 100 char line width
- **API app:** Spaces, single quotes, trailing commas
- Both apps use workspace ESLint and TypeScript configs from packages/

## Authentication & Authorization

### JWT Two-Token Scheme

- **Access Token:** Short-lived (15m default), stored in memory, sent via Authorization header
- **Refresh Token:** Long-lived (7d default), stored in httpOnly cookie, rotated on refresh

### Guards (execution order)

1. **ThrottlerGuard** - Rate limiting (disabled in test)
2. **CsrfGuard** - CSRF protection (disabled in test)
3. **AuthGuard** - JWT validation (use @Public() to bypass)
4. **RolesGuard** - Role-based access (@Roles('admin'))
5. **AuthorGuard** - Resource ownership validation (@Author())

### User Roles

- **USER** - Default role for authenticated users
- **ADMIN** - Administrative privileges

### Rate Limiting Tiers

- **short:** 3 requests / 1 second (critical endpoints)
- **medium:** 20 requests / 10 seconds (refresh tokens)
- **long:** 100 requests / 60 seconds (general)

## API Documentation

### Base URL

All API endpoints are available at: `/api/v1/...`

- **Base:** `http://localhost:8080/api/v1`
- **Swagger:** `http://localhost:8080/api/docs` (non-production environments only)

### Example Requests

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Get current user (with token)
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## Database

- **ORM:** Drizzle with PostgreSQL dialect
- **Naming:** snake_case for columns, PascalCase for TypeScript types
- **Migrations:** Manual generation, automatic execution in CI/CD

### Current Schema

- **users** - id, name, email, passwordHash, role, refreshTokenHash, timestamps
- **movies** - id, externalId (TMDB), title, timestamps

## Environment Variables

Key variables (see .env.example for full list):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Access token signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token signing secret (min 32 chars)
- `JWT_ACCESS_EXPIRATION` - Default: 15m
- `JWT_REFRESH_EXPIRATION` - Default: 7d
- `COOKIE_SECRET` - Cookie signing secret (min 32 chars)
- `BCRYPT_ROUNDS` - Default: 12
- `WEB_URL` - Frontend URL for CORS
- `PORT` - API server port (default: 8080)
