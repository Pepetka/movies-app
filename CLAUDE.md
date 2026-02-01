# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turborepo monorepo for a movies application with SvelteKit frontend and NestJS backend.

## Tech Stack

- **Package Manager:** pnpm 9.0.0 (Node.js ≥18 required)
- **Build System:** Turbo 2.7.5
- **Frontend:** SvelteKit (Svelte 5) + Vite
- **Backend:** NestJS 11 + Jest
- **Language:** TypeScript 5.9

## Commands

```bash
# Development (all apps)
pnpm run dev

# Development (single app)
pnpm run dev --filter=web     # Frontend on localhost:5173
pnpm run dev --filter=api     # Backend on localhost:3000

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
      main.ts              # Entry point (PORT env or 3000)
      app.module.ts        # Root module
packages/
  eslint-config/           # Shared ESLint configs (nest.js, svelte.js)
  typescript-config/       # Shared TS configs (nest.json, svelte.json)
```

## Code Style

- **Web app:** Tabs, single quotes, 100 char line width
- **API app:** Spaces, single quotes, trailing commas
- Both apps use workspace ESLint and TypeScript configs from packages/
