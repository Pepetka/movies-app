# Movies App API

NestJS backend для Movies App с Fastify адаптером, JWT аутентификацией и Drizzle ORM.

## Стек технологий

- **Framework:** NestJS 11
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
    ├── decorators/         # @Public, @Roles, @Author, @Cookies
    ├── guards/             # AuthGuard, RolesGuard, AuthorGuard, CsrfGuard
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

### Health

```bash
GET /api/v1/health           # Health check (public)
```

### CSRF

```bash
GET /api/v1/csrf/token       # CSRF токен (public)
```

## Guards

Guuards выполняются в порядке (определено в app.module.ts):

1. **ThrottlerGuard** - Rate limiting (disabled in test)
2. **CsrfGuard** - CSRF protection (disabled in test)
3. **AuthGuard** - JWT validation (bypass with @Public())
4. **RolesGuard** - Role-based access (@Roles('admin'))
5. **AuthorGuard** - Resource ownership (@Author())

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
