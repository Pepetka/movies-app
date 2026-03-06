# CLAUDE.md

Movies App — Turborepo monorepo для отслеживания групповых просмотров фильмов.

## Tech Stack

pnpm · Turborepo · SvelteKit (web) · NestJS + Fastify (api) · PostgreSQL + Drizzle

## Commands

```bash
pnpm run dev                  # Все apps
pnpm run dev --filter=web     # Frontend :5173
pnpm run dev --filter=api     # Backend :8080

pnpm run build / check / test / fix

# Database
pnpm run db:run / db:stop     # Docker PostgreSQL
cd apps/api && pnpm run db:generate / db:migrate / db:seed
```

## Key Rules

- Guards order: Throttler → CSRF → Auth → Roles → Group*
- `@Public()` bypasses AuthGuard
- Global roles: USER, ADMIN
- Group roles: member, moderator, admin
- API base: `/api/v1/...`
- Swagger: `/api/docs` (non-prod)

## ast-index Skill

Использовать `/ast-index` для быстрого поиска по AST в TypeScript/JavaScript коде:

**Когда использовать:**
- Найти класс, интерфейс, функцию, переменную
- Найти использования (usages) символа
- Найти реализации интерфейса/класса
- Иерархия классов, наследование
- Найти callers (кто вызывает функцию)
- Зависимости модулей, неиспользуемые зависимости
- Структура проекта, conventions
- Найти React/Svelte компонент

**Примеры запросов:**
- "find class UserService"
- "find usages of getUserById"
- "find implementations of AuthGuard"
- "who calls createGroup"
- "find TypeScript interface User"

## Documentation Map

| Topic | File |
| ----- | ---- |
| **Code Style** | [docs/code-style/](docs/code-style/index.md) — patterns, conventions (atomic docs) |
| **API** | [docs/api.md](docs/api.md) — endpoints, auth, guards, decorators |
| **Database** | [docs/database-schema.md](docs/database-schema.md) — tables, relations |
| **Movies Module** | [docs/movies-architecture.md](docs/movies-architecture.md) — provider vs custom |
| **Frontend Pages** | [docs/app-pages.md](docs/app-pages.md) — routes, navigation, UI patterns |
| **Web Architecture** | [docs/web-architecture.md](docs/web-architecture.md) — modules, TODO |
| **Deployment** | [docs/deployment.md](docs/deployment.md) — CI/CD, SSL, VPS setup |
| **Roadmap** | [docs/product-roadmap.md](docs/product-roadmap.md) — status, plans |
| **Future** | [docs/future-improvements.md](docs/future-improvements.md) — TODOs, ideas |

Читай связанные файлы из Documentation Map по мере необходимости для получения контекста.

## Architecture Overview

```
apps/
  web/                 # SvelteKit frontend
    src/lib/modules/   # auth, movies, groups, profile
    src/routes/        # (app) protected, (auth) public
  api/                 # NestJS backend
    src/auth/          # JWT, guards, strategies
    src/user/          # CRUD
    src/groups/        # Groups + members + movies
    src/movies/        # Kinopoisk integration
    src/db/schemas/    # Drizzle schemas
packages/
  ui/                  # Shared Svelte components
  eslint-config/       # Shared ESLint
  typescript-config/   # Shared TS configs
```

## Environment

See `.env.example` for full list. Key variables:

- `DATABASE_URL` — PostgreSQL connection
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — min 32 chars
- `COOKIE_SECRET` — min 32 chars
- `KINOPOISK_API_KEY` / `KINOPOISK_BASE_URL` — movie provider
