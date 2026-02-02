# Movies App

Веб-приложение для совместного отслеживания просмотренных фильмов — монорепозиторий на Turborepo с SvelteKit фронтендом и NestJS бэкендом.

## Технологии

- **Package Manager:** pnpm 9.0.0
- **Build System:** Turborepo 2.7.5
- **Frontend:** SvelteKit (Svelte 5) + Vite
- **Backend:** NestJS 11 + Fastify + Drizzle ORM
- **Database:** PostgreSQL
- **Language:** TypeScript 5.9

## Требования

- Node.js ≥ 18
- pnpm 9.0.0+
- PostgreSQL (или Docker)

## Быстрый старт

```bash
# Клонировать репозиторий
git clone <repository-url>
cd movies-app

# Установить зависимости
pnpm install

# Создать .env файл
cp .env.example .env
# Отредактировать .env с вашими настройками

# Запустить PostgreSQL (через Docker)
pnpm run db:run

# (Опционально) Создать администратора
cd apps/api
# С дефолтными данными (admin@example.com / SecurePass123!)
pnpm run db:seed
# Или с кастомными данными
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePass123!" pnpm run db:seed

# Запустить все приложения
pnpm run dev
```

Фронтенд будет доступен на http://localhost:5173, API — на http://localhost:8080.

> **Базовый путь API:** Все endpoints доступны по префиксу `/api/v1/...`

Swagger документация: http://localhost:8080/api/docs

## Команды

```bash
# Разработка
pnpm run dev                    # Все приложения
pnpm run dev --filter=web       # Только фронтенд
pnpm run dev --filter=api       # Только бэкенд

# База данных
pnpm run db:run                 # Запустить PostgreSQL
pnpm run db:stop                # Остановить PostgreSQL

# Сборка
pnpm run build                  # Все приложения
pnpm run build --filter=web
pnpm run build --filter=api

# Линтинг и форматирование
pnpm run lint
pnpm run format
pnpm run check:types

# Тесты API
cd apps/api
pnpm run test                   # Unit тесты
pnpm run test:watch             # Watch режим
pnpm run test:cov               # Покрытие
pnpm run test:e2e               # E2E тесты

# Миграции БД
cd apps/api
pnpm run db:generate            # Сгенерировать миграции
pnpm run db:migrate             # Применить миграции
pnpm run db:seed                # Создать администратора
pnpm run db:grant-admin         # Назначить роль админа
```

## Текущее состояние

### Реализовано

- JWT аутентификация с двухтокеновой схемой (access + refresh)
- Ролевая модель (USER, ADMIN)
- Rate limiting с различными tier-ами
- CSRF защита
- Swagger документация API
- Health check endpoints
- Управление пользователями (CRUD)
- Миграции базы данных через Drizzle

### В разработке

- Интеграция с TMDB API для поиска фильмов
- Группы пользователей
- Управление списками фильмов
- Оценки и отзывы

## Release Management

Проект использует [Changesets](https://github.com/changesets/changesets) для управления версиями.

### Создание changeset

При внесении изменений, которые должны войти в релиз:

1. Выполните из корня проекта:

   ```bash
   pnpm changeset:add
   ```

2. Выберите затронутые пакеты и тип версии (major, minor, patch)

3. Опишите изменения понятным языком

4. Закоммитьте `.changeset/*.md` файл вместе с кодом

### Процесс релиза

После мержа changeset в `main`:

1. GitHub Actions создает "Release PR" с:
   - Обновленными версиями пакетов
   - Сгенерированными CHANGELOG записями
   - Сводкой всех изменений

2. После ревью и мержа Release PR:
   - Создается коммит версионирования
   - Создаются git теги для каждого пакета
   - Обновляются версии пакетов
   - После появления тегов автоматически запускается Deploy workflow

### Стратегия версионирования

- **Major (breaking changes):** Удаление/изменение API, крупные рефакторинги
- **Minor (features):** Новые функции, значительные улучшения
- **Patch (fixes):** Исправления багов, мелкие улучшения, документация

Все пакеты `private` и не публикуются в npm.

## Production деплой с Docker

```bash
# 1. Скопировать и настроить переменные окружения
cp .env.example .env
# Отредактировать .env (DOMAIN, CERTBOT_EMAIL, COOKIE_SECRET и др.)

# 2. Получить SSL сертификат
./scripts/init-letsencrypt.sh

# 3. Запустить все сервисы
docker compose up -d
```

Подробное руководство по развёртыванию: [docs/deployment.md](docs/deployment.md)

## Структура проекта

```
apps/
  web/                          # SvelteKit фронтенд
    src/
      routes/                   # File-based роутинг
      lib/                      # Утилиты и компоненты
  api/                          # NestJS бэкенд
    src/
      main.ts                   # Точка входа (Fastify)
      app.module.ts             # Корневой модуль с guards
      auth/                     # JWT аутентификация
        auth.controller.ts      # /auth/register, /auth/login, etc.
        auth.service.ts         # Логика с bcrypt
        guards/                 # AuthGuard, RefreshGuard
        strategies/             # JWT стратегии
      user/                     # Управление пользователями
        user.controller.ts      # CRUD endpoints
        user.service.ts         # Business logic
        user.repository.ts      # Database operations
      health/                   # Health check endpoints
      csrf/                     # CSRF защита
      db/                       # Drizzle ORM
        schemas/                # Схемы БД
        migrate.ts              # Миграции
        seed.ts                 # Seeder
        grant-admin.ts          # Grant admin role
      common/                   # Общие утилиты
        configs/                # Validation, throttle, helmet
        decorators/             # @Public, @Roles, @Author
        guards/                 # AuthGuard, RolesGuard, AuthorGuard, CsrfGuard
        exceptions/             # Custom exceptions
        validators/             # Custom class-validator decorators
packages/
  eslint-config/                # Общие ESLint конфиги
  typescript-config/            # Общие TS конфиги
  ui/                           # UI компоненты (Svelte)
docker/                         # Docker конфигурации
docs/                           # Документация
  product-roadmap.md            # Roadmap проекта
  database-schema.md            # Схема БД
  deployment.md                 # Руководство по деплою
```

## Переменные окружения

### Production (Docker)

| Переменная               | Описание                                     | Используется   |
| ------------------------ | -------------------------------------------- | -------------- |
| `NODE_ENV`               | Окружение (development/production/test)      | API            |
| `PORT`                   | Порт API сервера                             | API            |
| `WEB_URL`                | URL фронтенда (https://yourdomain.com)       | API            |
| `API_URL`                | URL API (https://yourdomain.com/api)         | API            |
| `COOKIE_SECRET`          | Секрет для cookies (мин. 32 символа)         | API            |
| `DATABASE_URL`           | Строка подключения PostgreSQL                | API            |
| `JWT_ACCESS_SECRET`      | Секрет для access токенов                    | API            |
| `JWT_REFRESH_SECRET`     | Секрет для refresh токенов                   | API            |
| `JWT_ACCESS_EXPIRATION`  | Время жизни access токена (15m)              | API            |
| `JWT_REFRESH_EXPIRATION` | Время жизни refresh токена (7d)              | API            |
| `BCRYPT_ROUNDS`          | Раунды bcrypt (12)                           | API            |
| `POSTGRES_*`             | Настройки PostgreSQL                         | Docker         |
| `DOMAIN`                 | Домен без протокола (yourdomain.com)         | nginx, certbot |
| `CERTBOT_EMAIL`          | Email для Let's Encrypt                      | certbot        |
| `GITHUB_REPOSITORY`      | Репозиторий для pull образов (username/repo) | Docker         |

### Development

См. `.env.example` для полного списка переменных.

## API Документация

### Auth Endpoints

```bash
# Регистрация
POST /api/v1/auth/register
Body: { "name": "string", "email": "string", "password": "string" }

# Вход
POST /api/v1/auth/login
Body: { "email": "string", "password": "string" }

# Обновление токена
POST /api/v1/auth/refresh
Cookie: refresh_token

# Выход
POST /api/v1/auth/logout
```

### User Endpoints

```bash
# Получить текущего пользователя
GET /api/v1/users/me
Headers: Authorization: Bearer <access_token>

# Получить пользователя по ID
GET /api/v1/users/:id

# Обновить пользователя
PATCH /api/v1/users/:id

# Удалить пользователя
DELETE /api/v1/users/:id
```

### Health Check

```bash
GET /api/v1/health
```

## Документация

- [Product Roadmap](docs/product-roadmap.md) - План развития приложения
- [Database Schema](docs/database-schema.md) - Схема базы данных
- [Deployment Guide](docs/deployment.md) - Руководство по развёртыванию

## Лицензия

MIT
