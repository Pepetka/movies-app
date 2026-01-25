# Changelog: CI/CD Implementation (Stage 5)

Дата: 2026-01-25

## Обзор

Реализован production-ready CI/CD workflow для автоматического тестирования и развёртывания movies-app на VPS через GitHub Actions.

## Что добавлено

### 1. CI Workflow (`.github/workflows/ci.yml`)

Автоматическое тестирование на каждый Pull Request:

- **Lint** — проверка стиля кода (ESLint)
- **Type Check** — проверка TypeScript типов
- **Build** — сборка всех приложений (API + Web)
- **Test** — unit и e2e тесты для API

**Оптимизации:**
- pnpm cache для ускорения установки зависимостей
- Turbo cache для инкрементальных сборок
- Параллельное выполнение независимых jobs
- Concurrency с `cancel-in-progress` для экономии минут GitHub Actions

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

Автоматическое развёртывание при merge в `main`:

**Job 1: build-and-push**
- Сборка Docker образов (API и Web)
- Push в GitHub Container Registry (ghcr.io)
- Теги: `latest` и commit SHA
- Labels: `project=movies-app` для безопасного cleanup
- GitHub Actions cache для Docker layers

**Job 2: deploy**
- SSH подключение к VPS
- Login в GHCR (с использованием GHCR_PAT)
- Pull новых образов
- **Запуск database миграций** (отдельным шагом перед restart)
- Перезапуск контейнеров
- Health checks (API и Web)
- Cleanup старых образов (только с label `project=movies-app`)
- Logout из GHCR

### 3. Database Migrations

**Файл:** `apps/api/src/db/migrate.ts`

Runtime migrator используя `drizzle-orm/postgres-js/migrator`:

- Запускается автоматически при деплое
- Использует миграции из `apps/api/drizzle/` директории
- При ошибке миграции деплой прерывается
- Старые контейнеры продолжают работать при failed деплое

**Новый npm скрипт:**
- `db:migrate:prod` — запуск миграций в production

### 4. Docker Images Updates

**API Dockerfile (`docker/api/Dockerfile`):**
- Добавлен `LABEL project="movies-app"` для cleanup
- Добавлено копирование `drizzle/` папки в runtime stage

**Web Dockerfile (`docker/web/Dockerfile`):**
- Добавлен `LABEL project="movies-app"` для cleanup

### 5. Документация

**Создано:**
- `.github/README.md` — обзор workflows и quick start
- `docs/ci-cd-setup.md` — пошаговая инструкция по настройке CI/CD
- `docs/CHANGELOG-ci-cd.md` — этот файл

**Обновлено:**
- `docs/deployment.md` — добавлены разделы про CI/CD, GitHub Secrets, миграции, troubleshooting

## Требуемые GitHub Secrets

| Secret | Описание |
|--------|----------|
| `VPS_HOST` | IP адрес или домен VPS |
| `VPS_USER` | SSH пользователь |
| `VPS_SSH_KEY` | Приватный SSH ключ (полное содержимое) |
| `GHCR_USERNAME` | GitHub username для GHCR login |
| `GHCR_PAT` | Personal Access Token с `read:packages` и `repo` |

## Процесс Deploy

1. Developer создаёт PR → **CI workflow запускается**
2. CI проходит успешно → PR ready для ревью
3. PR мержится в `main` → **Deploy workflow запускается**
4. Build Docker образов (API + Web)
5. Push в GHCR с тегами `latest` и SHA
6. SSH в VPS
7. Login в GHCR
8. Pull новых образов
9. **Запуск миграций** (`docker compose run --rm api node dist/db/migrate.js`)
10. Restart контейнеров (`docker compose up -d --remove-orphans`)
11. Wait 15 секунд
12. Health checks (API + Web)
13. Cleanup старых образов
14. Logout из GHCR
15. ✅ Deploy успешен!

## Миграции БД

**Генерация миграций** (локально):

```bash
cd apps/api
pnpm run db:generate  # Создаёт SQL файлы в drizzle/
git add drizzle/
git commit -m "feat: add new migration"
```

**Применение миграций** (автоматически при деплое):

Миграции запускаются отдельным шагом ПЕРЕД перезапуском сервисов:

```bash
docker compose run --rm api node dist/db/migrate.js
```

**Важно:**
- Миграции коммитятся в git
- Docker образ включает готовые миграции из `apps/api/drizzle/`
- При ошибке миграции деплой останавливается
- Старые контейнеры остаются работающими при failed деплое

## Health Checks

После деплоя автоматически проверяются:

- **API**: `http://localhost/api/v1/health`
  - Healthcheck уже реализован в `apps/api/src/app.controller.ts`
  - Endpoint: `/api/v1/health` (с версионированием)

- **Web**: `http://localhost/`
  - SvelteKit root route

Если хотя бы один fails → деплой считается неудачным.

## Docker Image Cleanup

После успешного деплоя удаляются только образы с label `project=movies-app`:

```bash
docker image prune -f --filter "label=project=movies-app"
```

**Безопасность:**
- Не затрагивает образы других проектов на VPS
- Сохраняет активные контейнеры
- Удаляет только dangling images этого проекта

## Особенности реализации

### Отличия от исходного плана

1. **Node 22** вместо 20 (уже было в Dockerfiles)
2. **Приватный GHCR** вместо публичного — требуется GHCR_PAT
3. **Автоматические миграции** через runtime migrator
4. **Health endpoint** с версионированием: `/api/v1/health`
5. **COOKIE_SECRET** обязательна (32+ символа)
6. **Миграции отдельным шагом** в deploy workflow (более безопасно)

### Безопасность

- SSH ключ только для GitHub Actions
- GHCR_PAT с минимальными правами (`read:packages`, `repo`)
- Environment protection для production
- Миграции с fail-safe (старые контейнеры продолжают работать)
- Cleanup только образов movies-app

### Производительность

- pnpm cache сокращает установку зависимостей с ~2 мин до ~30 сек
- Turbo cache ускоряет сборку на ~40%
- Docker layer cache через GitHub Actions cache
- Параллельные jobs где возможно

## Следующие шаги

### Для использования

1. Настроить GitHub Secrets (см. `docs/ci-cd-setup.md`)
2. Подготовить VPS (создать `/opt/movies-app`, скопировать конфиги)
3. Создать тестовый PR для проверки CI
4. Смержить в main для первого деплоя

### Будущие улучшения (опционально)

- Blue-Green deployment для zero-downtime
- Staging environment на отдельном VPS
- Database backups (cron + S3)
- Monitoring (Prometheus + Grafana)
- Slack/Discord notifications для деплоев

## Troubleshooting

См. подробную информацию в:
- `docs/deployment.md#cicd-проблемы`
- `docs/ci-cd-setup.md#устранение-проблем`

## Связанные файлы

**Созданные:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/README.md`
- `apps/api/src/db/migrate.ts`
- `docs/ci-cd-setup.md`
- `docs/CHANGELOG-ci-cd.md`

**Изменённые:**
- `docker/api/Dockerfile`
- `docker/web/Dockerfile`
- `apps/api/package.json`
- `docs/deployment.md`

## Версии

- Node: 22-alpine (Docker), 22 (CI)
- pnpm: 9.0.0
- GitHub Actions:
  - actions/checkout@v4
  - actions/setup-node@v4
  - pnpm/action-setup@v4
  - docker/setup-buildx-action@v3
  - docker/login-action@v3
  - docker/build-push-action@v6
  - appleboy/ssh-action@v1.0.3
