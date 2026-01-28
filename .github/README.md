# GitHub Actions CI/CD

## Workflows

### CI Workflow (`ci.yml`)

Запускается автоматически при создании Pull Request в `main`.

**Jobs:**
- **Lint** — проверка стиля кода
- **Type Check** — проверка типов TypeScript
- **Build** — сборка приложений с Turbo cache
- **Test** — unit и e2e тесты для API

**Оптимизации:**
- pnpm cache через `actions/setup-node`
- Turbo cache для инкрементальных сборок
- Параллельное выполнение независимых jobs
- Concurrency с `cancel-in-progress` для экономии минут

### Release Workflow (`release.yml`)

Запускается при push в `main` и управляет версиями через Changesets:
- Если есть changeset-файлы — создаёт Release PR
- Если versions уже обновлены — пушит git-теги для пакетов

### Deploy Workflow (`deploy.yml`)

Запускается автоматически после **успешного** Release workflow в `main` и только если на коммите есть теги,
или вручную через `workflow_dispatch`.

**Jobs:**

0. **check-tags**
   - Проверяет наличие git-тегов на коммите
   - Останавливает деплой, если тегов нет (для автозапуска)

1. **build-and-push**
   - Собирает Docker образы для API и Web
   - Push в GitHub Container Registry (ghcr.io)
   - Теги: `latest` и `${{ github.sha }}`
   - Labels: `project=movies-app` (для cleanup)
   - GitHub Actions cache для ускорения сборки

2. **deploy**
   - SSH подключение к VPS
   - Login в GHCR
   - Pull новых образов
   - **Запуск database миграций**
   - Перезапуск контейнеров
   - Health checks (API + Web)
   - Cleanup старых образов
   - Logout из GHCR

## Требуемые Secrets

Настройте в Settings → Secrets and variables → Actions:

| Secret | Описание |
|--------|----------|
| `VPS_HOST` | IP адрес или домен VPS |
| `VPS_USER` | SSH пользователь (ubuntu/root) |
| `VPS_PORT` | SSH порт VPS (если нестандартный) |
| `VPS_SSH_KEY` | Приватный SSH ключ (полное содержимое) |
| `GHCR_USERNAME` | Ваш GitHub username |
| `GHCR_PAT` | Personal Access Token с правами `read:packages` и `repo` |

### Генерация GHCR_PAT

```bash
# GitHub.com → Settings → Developer settings
# → Personal access tokens → Fine-grained tokens
# → Generate new token

# Permissions:
# - Contents: Read
# - Packages: Read

# Expiration: 90 days
```

### Генерация SSH Key

```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-actions@movies-app" -f ~/.ssh/movies-app-deploy

# Скопировать на VPS
ssh-copy-id -i ~/.ssh/movies-app-deploy.pub user@vps-ip

# Приватный ключ → GitHub secret VPS_SSH_KEY
cat ~/.ssh/movies-app-deploy
```

## Подготовка VPS

```bash
# Создать директорию
sudo mkdir -p /opt/movies-app
sudo chown $USER:$USER /opt/movies-app

# Скопировать конфигурацию
cd /opt/movies-app
# Добавить docker-compose.yml, .env, nginx конфиги
```

## Database Migrations

Миграции запускаются автоматически при каждом деплое:

```bash
docker compose run --rm api node dist/db/migrate.js
```

**Важно:**
- Миграции генерируются локально и коммитятся в git
- При ошибке миграции деплой прерывается
- Старые контейнеры продолжают работать при failed деплое

**Генерация новой миграции:**

```bash
cd apps/api
pnpm run db:generate
git add drizzle/
git commit -m "feat: add new migration"
```

## Health Checks

После деплоя проверяются:

- API: `http://localhost/api/v1/health`
- Web: `http://localhost/`

Если health check fails → деплой считается неудачным.

## Ручной Deploy

1. GitHub → Actions → Deploy workflow
2. Run workflow → выбрать `main`
3. Run workflow

Ручной запуск не требует наличия тегов на коммите.

## Troubleshooting

См. [docs/deployment.md](../docs/deployment.md#cicd-проблемы) для подробной информации по устранению проблем.
