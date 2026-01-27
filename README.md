# Movies App

Веб-приложение для работы с фильмами — монорепозиторий на Turborepo с SvelteKit фронтендом и NestJS бэкендом.

## Технологии

- **Package Manager:** pnpm 9.0.0
- **Build System:** Turborepo 2.7.5
- **Frontend:** SvelteKit (Svelte 5) + Vite
- **Backend:** NestJS 11 + Drizzle ORM
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
docker compose -f docker-compose.dev.yml up -d postgres

# Запустить все приложения
pnpm run dev
```

Фронтенд будет доступен на http://localhost:5173, API — на http://localhost:3000.

## Команды

```bash
# Разработка
pnpm run dev                    # Все приложения
pnpm run dev --filter=web       # Только фронтенд
pnpm run dev --filter=api       # Только бэкенд

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
```

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

### Стратегия версионирования

- **Major (breaking changes):** Удаление/изменение API, крупные рефакторинги
- **Minor (features):** Новые функции, значительные улучшения
- **Patch (fixes):** Исправления багов, мелкие улучшения, документация

Все пакеты `private` и не публикуются в npm.
```

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
      main.ts                   # Точка входа
      app.module.ts             # Корневой модуль
      db/                       # Drizzle схемы и модуль БД
      common/                   # Общие конфиги и утилиты
packages/
  eslint-config/                # Общие ESLint конфиги
  typescript-config/            # Общие TS конфиги
  ui/                           # UI компоненты (Svelte)
docker/                         # Docker конфигурации
```

## Переменные окружения

### Production (Docker)

| Переменная | Описание | Используется |
|------------|----------|--------------|
| `NODE_ENV` | Окружение (development/production/test) | API, Web |
| `PORT` | Порт API сервера | API |
| `WEB_URL` | URL фронтенда (https://yourdomain.com) | API |
| `API_URL` | URL API (https://yourdomain.com/api) | API |
| `COOKIE_SECRET` | Секрет для cookies (мин. 32 символа) | API |
| `DATABASE_URL` | Строка подключения PostgreSQL | API |
| `POSTGRES_*` | Настройки PostgreSQL | Docker |
| `DOMAIN` | Домен без протокола (yourdomain.com) | nginx, certbot |
| `CERTBOT_EMAIL` | Email для Let's Encrypt | certbot |
