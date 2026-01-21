# Repository Guidelines

## Project Structure & Module Organization
- `apps/api`: NestJS API service. Entry point `apps/api/src/main.ts`, with modules/controllers/services co-located in `apps/api/src/`.
- `apps/web`: SvelteKit web app. Routes live in `apps/web/src/routes`, shared UI/helpers in `apps/web/src/lib`, and static assets in `apps/web/static`.
- `packages/eslint-config` and `packages/typescript-config`: shared lint and TS configs for workspace packages.
- `packages/ui`: reserved for shared UI components (currently empty).
- Workspace tooling and task graph are defined in `package.json`, `pnpm-workspace.yaml`, and `turbo.json`.

## Build, Test, and Development Commands
Run commands from the repo root with pnpm (workspace is pnpm-managed).
- `pnpm dev`: run all dev tasks via Turborepo.
- `pnpm build`: build all packages/apps.
- `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm check:types`: lint, auto-fix lint, format, and type-check across the workspace.
- Target a single app with filters, e.g. `pnpm --filter web dev` or `pnpm --filter api start:dev`.
- API-specific tests: `pnpm --filter api test`, `pnpm --filter api test:watch`, `pnpm --filter api test:cov`.

## Coding Style & Naming Conventions
- TypeScript is used across the repo.
- Formatting is enforced by Prettier; ESLint is used for linting.
- API formatting (`apps/api/.prettierrc`): single quotes, trailing commas.
- Web formatting (`apps/web/.prettierrc`): tabs, single quotes, print width 100, Svelte plugin.
- Follow framework conventions: NestJS class names like `AppService`, Svelte components in PascalCase when added.

## Testing Guidelines
- API tests use Jest (`apps/api`), with `*.spec.ts` naming (see `apps/api/src/app.controller.spec.ts`).
- End-to-end tests live under `apps/api/test` and use the Jest e2e config.
- The web app currently has no dedicated test runner; use `pnpm --filter web check` for Svelte type checks.

## Commit & Pull Request Guidelines
- Git history only contains an initial bootstrap commit; no formal commit convention is established.
- Use concise, imperative commit summaries; add a scope if it improves clarity (e.g., `api: add movies endpoint`).
- PRs should include a clear description, testing notes (commands + results), and screenshots/gifs for UI changes.

## Configuration & Environment Tips
- Turborepo treats `.env*` files as inputs; prefer local environment files like `.env.local` and avoid committing secrets.
- Keep app-specific config inside each app folder to avoid cross-app coupling.
