# Movies App API

NestJS backend для Movies App с Fastify адаптером, JWT аутентификацией и Drizzle ORM.

## Стек технологий

- **Framework:** NestJS
- **Adapter:** Fastify
- **Database:** PostgreSQL + Drizzle ORM
- **Authentication:** JWT (access + refresh tokens)
- **Validation:** class-validator + class-transformer
- **Testing:** Jest

## Локальная разработка

```bash
# Установить зависимости
pnpm install

# Запустить PostgreSQL (через Docker из корня проекта)
pnpm run db:run

# Настроить переменные окружения
cp .env.example .env
# Отредактировать .env

# Применить миграции
pnpm run db:migrate

# Создать администратора
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePass123!" pnpm run db:seed

# Development режим
pnpm run start:dev

# Production режим
pnpm run build
pnpm run start:prod
```

API будет доступен на http://localhost:8080

Swagger документация: http://localhost:8080/api/docs

## Команды

```bash
# Разработка
pnpm run start              # Запуск
pnpm run start:dev          # Watch режим
pnpm run start:debug        # Debug режим

# Сборка
pnpm run build              # Собрать проект
pnpm run start:prod         # Запустить production сборку

# Тесты
pnpm run test               # Unit тесты
pnpm run test:watch         # Watch режим
pnpm run test:cov           # Покрытие
pnpm run test:e2e           # E2E тесты

# База данных
pnpm run db:generate        # Сгенерировать миграции
pnpm run db:migrate         # Применить миграции
pnpm run db:seed            # Создать администратора
pnpm run db:grant-admin     # Назначить роль админа

# Линтинг
pnpm run lint               # Проверить код
pnpm run lint:fix           # Исправить автоматически
```

## Архитектура

### Модули

```
src/
├── main.ts                 # Bootstrap приложения
├── app.module.ts           # Корневой модуль
│
├── auth/                   # Аутентификация
│   ├── auth.controller.ts  # Endpoints: register, login, logout, refresh
│   ├── auth.service.ts     # Business logic
│   ├── auth.constants.ts   # Константы
│   ├── guards/             # AuthGuard, RefreshGuard
│   ├── strategies/         # JWT стратегии
│   ├── dto/                # DTOs для запросов/ответов
│   └── types/              # TypeScript типы
│
├── user/                   # Пользователи
│   ├── user.controller.ts  # CRUD endpoints
│   ├── user.service.ts     # Business logic
│   ├── user.repository.ts  # Database operations
│   └── dto/                # User DTOs
│
├── groups/                 # Группы пользователей
│   ├── groups.controller.ts    # CRUD + управление участниками
│   ├── groups.service.ts       # Business logic
│   ├── groups.repository.ts    # Database operations
│   └── dto/                    # Groups DTOs
│
├── movies/                 # Провайдерские фильмы (Kinopoisk)
│   ├── movies.controller.ts    # Поиск, глобальный CRUD
│   ├── movies.service.ts       # Business logic
│   ├── movies.repository.ts    # Database operations
│   ├── kinopoisk.service.ts    # Kinopoisk API интеграция
│   ├── movie-providers.service.ts  # Провайдеры фильмов
│   └── dto/                    # Movies DTOs
│
├── group-movies/           # Фильмы в группах
│   ├── group-movies.controller.ts  # Статусы, связь группа-фильм
│   ├── group-movies.service.ts     # Business logic
│   ├── group-movies.repository.ts  # Database operations
│   └── dto/                        # GroupMovies DTOs
│
├── custom-movies/          # Кастомные фильмы
│   ├── custom-movies.controller.ts # CRUD в группах
│   ├── custom-movies.service.ts    # Business logic
│   ├── custom-movies.repository.ts # Database operations
│   └── dto/                        # CustomMovies DTOs
│
├── health/                 # Health check
│   ├── health.controller.ts
│   ├── health.service.ts
│   └── dto/
│
├── csrf/                   # CSRF защита
│   ├── csrf.controller.ts
│   └── dto/
│
├── db/                     # Database
│   ├── db.module.ts
│   ├── schemas/            # Drizzle схемы
│   ├── migrate.ts          # Миграции
│   ├── seed.ts             # Seeder
│   └── grant-admin.ts      # Grant admin utility
│
└── common/                 # Общие утилиты
    ├── configs/            # Validation, throttle, helmet
    ├── decorators/         # @Public, @Roles, @Author, @Cookies, @User
    ├── guards/             # AuthGuard, RolesGuard, AuthorGuard, CsrfGuard,
    │                       # GroupMemberGuard, GroupModeratorGuard, GroupAdminGuard
    ├── exceptions/         # Custom exceptions
    └── validators/         # Custom validators
```

## API Endpoints

### Auth

```bash
POST /api/v1/auth/register   # Регистрация (public)
POST /api/v1/auth/login      # Вход (public, throttled)
POST /api/v1/auth/logout     # Выход (authenticated)
POST /api/v1/auth/refresh    # Обновить токен (public, throttled)
```

### Users

```bash
GET    /api/v1/users         # Список пользователей (admin only)
GET    /api/v1/users/me      # Текущий пользователь (authenticated)
GET    /api/v1/users/:id     # Пользователь по ID
PATCH  /api/v1/users/:id     # Обновить (owner or admin)
DELETE /api/v1/users/:id     # Удалить (owner or admin)
```

### Groups

```bash
GET    /api/v1/groups                    # Список групп пользователя (authenticated)
POST   /api/v1/groups                    # Создать группу (authenticated)
GET    /api/v1/groups/:id                # Детали группы (members)
PATCH  /api/v1/groups/:id                # Обновить группу (group admin)
DELETE /api/v1/groups/:id                # Удалить группу (group admin)

# Участники группы
GET    /api/v1/groups/:id/members        # Список участников (members)
POST   /api/v1/groups/:id/members        # Добавить участника (moderator)
PATCH  /api/v1/groups/:id/members/:uid   # Изменить роль (group admin)
DELETE /api/v1/groups/:id/members/:uid   # Удалить участника (group admin)
```

### Movies (глобальные)

```bash
GET    /api/v1/movies                    # Список провайдерских фильмов (admin)
GET    /api/v1/movies/search             # Поиск через Kinopoisk (authenticated)
GET    /api/v1/movies/:id                # Детали фильма (authenticated)
PATCH  /api/v1/movies/:id                # Обновить фильм (admin)
DELETE /api/v1/movies/:id                # Удалить фильм (admin)
```

### Group Movies (фильмы в группах)

```bash
GET    /api/v1/groups/:id/movies         # Список фильмов группы (members)
POST   /api/v1/groups/:id/movies         # Добавить фильм из Kinopoisk (moderator)
GET    /api/v1/groups/:id/movies/search  # Поиск: Kinopoisk + local (members)
GET    /api/v1/groups/:id/movies/:mid    # Детали фильма в группе (members)
PATCH  /api/v1/groups/:id/movies/:mid    # Изменить статус/дату (moderator)
DELETE /api/v1/groups/:id/movies/:mid    # Удалить из группы (moderator)
```

### Custom Movies (кастомные фильмы)

```bash
GET    /api/v1/groups/:id/custom-movies      # Список кастомных фильмов (members)
POST   /api/v1/groups/:id/custom-movies      # Создать кастомный фильм (moderator)
GET    /api/v1/groups/:id/custom-movies/:cid # Детали (members)
PATCH  /api/v1/groups/:id/custom-movies/:cid # Редактировать (moderator)
DELETE /api/v1/groups/:id/custom-movies/:cid # Удалить (moderator)
```

### Health

```bash
GET /api/v1/health           # Health check (public)
```

### CSRF

```bash
GET /api/v1/csrf/token       # CSRF токен (public)
```

## Guards

Guards выполняются в порядке (определено в app.module.ts):

1. **ThrottlerGuard** - Rate limiting (disabled in test)
2. **CsrfGuard** - CSRF protection (disabled in test)
3. **AuthGuard** - JWT validation (bypass with @Public())
4. **RolesGuard** - Role-based access (@Roles('admin'))
5. **AuthorGuard** - Resource ownership (@Author())

### Guards для групп

- **GroupMemberGuard** - Проверяет членство пользователя в группе
- **GroupModeratorGuard** - Требует роль moderator или admin в группе
- **GroupAdminGuard** - Требует роль admin в группе (владелец или назначенный админ)

### Статусы фильмов в группах

| Статус     | Описание                              | Дата          |
| ---------- | ------------------------------------- | ------------- |
| `tracking` | Отслеживается (дефолт при добавлении) | -             |
| `planned`  | Запланирован к просмотру              | `plannedDate` |
| `watched`  | Просмотрен                            | `watchedDate` |

### Rate Limiting

- **short:** 3 requests / 1 second (auth endpoints)
- **medium:** 20 requests / 10 seconds (refresh tokens)
- **long:** 100 requests / 60 seconds (general API)

## Переменные окружения

| Переменная               | Описание                            | Default     |
| ------------------------ | ----------------------------------- | ----------- |
| `NODE_ENV`               | development, production, test       | development |
| `PORT`                   | Порт API                            | 8080        |
| `DATABASE_URL`           | PostgreSQL connection string        | -           |
| `WEB_URL`                | Frontend URL для CORS               | -           |
| `API_URL`                | API URL                             | -           |
| `COOKIE_SECRET`          | Cookie signing (min 32 chars)       | -           |
| `JWT_ACCESS_SECRET`      | Access token secret (min 32 chars)  | -           |
| `JWT_REFRESH_SECRET`     | Refresh token secret (min 32 chars) | -           |
| `JWT_ACCESS_EXPIRATION`  | Access token TTL                    | 15m         |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL                   | 7d          |
| `BCRYPT_ROUNDS`          | Bcrypt rounds                       | 12          |
| `KINOPOISK_BASE_URL`     | Kinopoisk API URL                   | -           |
| `KINOPOISK_API_KEY`      | Kinopoisk API key                   | -           |

## Тестирование

```bash
# Unit тесты
pnpm run test

# E2E тесты
pnpm run test:e2e

# Покрытие
pnpm run test:cov
```

## Миграции базы данных

### Генерация миграций

```bash
# Нужна доступная PostgreSQL БД
DATABASE_URL="postgres://user:pass@localhost:5432/db" pnpm run db:generate
```

### Применение миграций

```bash
pnpm run db:migrate
```

## Административные скрипты

### Создать администратора

```bash
# С кастомными данными
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePass123!" pnpm run db:seed

# С дефолтными данными (admin@example.com / SecurePass123!)
pnpm run db:seed
```

> **Важно:** Скрипт создаёт пользователя только если он не существует. Без указания `ADMIN_EMAIL` и `ADMIN_PASSWORD` используются дефолтные значения.

### Назначить роль админа существующему пользователю

```bash
ADMIN_EMAIL="user@example.com" pnpm run db:grant-admin
```

## Лицензия

MIT
