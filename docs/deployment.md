# Production Deployment

Руководство по развёртыванию Movies App на production сервере.

## Требования

- Docker и Docker Compose
- Домен с настроенными DNS записями (A-запись указывает на IP сервера)
- Открытые порты 80 (HTTP) и 443 (HTTPS)

## Шаги развёртывания

### 1. Подготовка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd movies-app

# Создать файл переменных окружения
cp .env.example .env
```

### 2. Настройка переменных окружения

Отредактируйте `.env` файл:

| Переменная | Описание | Пример |
|------------|----------|--------|
| `NODE_ENV` | Окружение | `production` |
| `PORT` | Порт API сервера | `3000` |
| `WEB_URL` | URL фронтенда | `https://yourdomain.com` |
| `API_URL` | URL API | `https://yourdomain.com/api` |
| `COOKIE_SECRET` | Секрет для cookies (мин. 32 символа) | см. ниже |
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgresql://user:pass@db:5432/movies` |
| `POSTGRES_USER` | Пользователь PostgreSQL | `movies` |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | `<strong-password>` |
| `POSTGRES_DB` | Имя базы данных | `movies` |
| `DOMAIN` | Домен (без протокола) | `yourdomain.com` |
| `CERTBOT_EMAIL` | Email для Let's Encrypt | `admin@yourdomain.com` |
| `GITHUB_REPOSITORY` | Полное имя репозитория (для pull образов) | `username/movies-app` |

Генерация `COOKIE_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Получение SSL сертификата

Используйте скрипт `init-letsencrypt.sh` для автоматического получения сертификата:

```bash
# Для тестирования (staging сертификат, не доверенный браузерами)
./scripts/init-letsencrypt.sh --staging

# Для production (настоящий сертификат)
./scripts/init-letsencrypt.sh
```

Скрипт автоматически:
- Скачивает рекомендуемые TLS параметры
- Создаёт временный сертификат для запуска nginx
- Запрашивает сертификат Let's Encrypt через ACME challenge
- Перезагружает nginx с новым сертификатом

> **Важно:** Сначала запустите с `--staging` для проверки настроек. Let's Encrypt имеет лимиты на количество запросов сертификатов.

### 4. Запуск приложения

```bash
# Запустить все сервисы
docker compose up -d

# Проверить статус
docker compose ps
```

После запуска приложение будет доступно по адресу `https://yourdomain.com`.

### 5. Обслуживание

#### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
```

#### Обновление приложения

```bash
# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker compose up -d --build
```

#### SSL сертификаты

Сертификаты обновляются автоматически — certbot контейнер настроен на периодическую проверку и обновление.

Ручное обновление при необходимости:

```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

## CI/CD с GitHub Actions

Проект настроен для автоматического развёртывания через GitHub Actions.

### Workflows

#### CI Workflow (Pull Requests)

Автоматически запускается при создании PR в `main`:

- **Lint** — проверка стиля кода
- **Type Check** — проверка типов TypeScript
- **Build** — сборка всех приложений
- **Test** — unit и e2e тесты для API

#### Deploy Workflow (Production)

Автоматически запускается при merge в `main`:

1. **Build and Push** — собирает Docker образы и отправляет в GitHub Container Registry
2. **Deploy** — развёртывает на VPS через SSH

### Настройка GitHub Secrets

Для работы CI/CD необходимо настроить следующие secrets в репозитории (Settings → Secrets and variables → Actions):

| Secret | Описание | Как получить |
|--------|----------|--------------|
| `VPS_HOST` | IP адрес или домен VPS | Из настроек VPS провайдера |
| `VPS_USER` | SSH пользователь | Обычно `ubuntu`, `root` или custom |
| `VPS_SSH_KEY` | Приватный SSH ключ | `cat ~/.ssh/id_rsa` (на локальной машине) |
| `GHCR_USERNAME` | GitHub username для GHCR | Ваш GitHub username |
| `GHCR_PAT` | GitHub Personal Access Token | См. инструкцию ниже |

### Генерация GHCR Personal Access Token

Для приватных образов требуется токен с расширенными правами:

1. GitHub.com → Settings → Developer settings → Personal access tokens
2. Fine-grained tokens → Generate new token
3. Token name: `movies-app-ghcr-pull`
4. Expiration: 90 days (или custom)
5. Repository access: Only select repositories → movies-app
6. Permissions:
   - **Contents**: Read (для доступа к приватному репозиторию)
   - **Packages**: Read (для pull образов)
7. Generate token и скопировать значение
8. Добавить два secrets в репозиторий:
   - `GHCR_USERNAME`: ваш GitHub username
   - `GHCR_PAT`: скопированный токен

**Альтернатива (Classic Token):**
```bash
# Если Fine-grained tokens не работают:
# Personal access tokens → Tokens (classic) → Generate new token
# Scopes: read:packages, repo (для приватных репозиториев)
# Expiration: 90 days
```

### SSH Key Setup на VPS

```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-actions@movies-app" -f ~/.ssh/movies-app-deploy

# Скопировать публичный ключ на VPS
ssh-copy-id -i ~/.ssh/movies-app-deploy.pub user@vps-ip

# Приватный ключ добавить в GitHub secrets
cat ~/.ssh/movies-app-deploy
```

### Подготовка VPS для CI/CD

1. Создайте директорию для приложения:
```bash
sudo mkdir -p /opt/movies-app
sudo chown $USER:$USER /opt/movies-app
cd /opt/movies-app
```

2. Скопируйте необходимые файлы:
```bash
# На локальной машине
scp docker-compose.yml user@vps-ip:/opt/movies-app/
scp -r docker/nginx user@vps-ip:/opt/movies-app/docker/
scp .env.example user@vps-ip:/opt/movies-app/.env
```

3. На VPS отредактируйте `.env` с правильными значениями переменных

   **Важно:** Добавьте переменную `GITHUB_REPOSITORY` с полным именем вашего репозитория:
   ```bash
   GITHUB_REPOSITORY=username/movies-app
   ```
   Эта переменная необходима для pull Docker образов из GitHub Container Registry.

4. Убедитесь что порты 80 и 443 открыты

### Процесс Deploy

При merge в `main` автоматически происходит:

1. Сборка Docker образов (API и Web)
2. Push образов в GitHub Container Registry с тегами `latest` и SHA коммита
3. Checkout репозитория для доступа к конфигам
4. **Синхронизация конфигурационных файлов** на VPS:
   - `docker-compose.yml`
   - `docker/nginx/` (nginx.conf и templates)
   - **Note:** `.env` НЕ синхронизируется (обновляется вручную администратором)
5. SSH подключение к VPS
6. Login в GHCR с использованием PAT
7. Pull новых образов
8. Явный запуск PostgreSQL контейнера
9. Ожидание готовности PostgreSQL (настраиваемый timeout через `POSTGRES_READY_TIMEOUT`)
10. **Запуск database миграций** с логированием при ошибках (если миграция fails → деплой прерывается)
11. Перезапуск контейнеров с новыми образами
12. Health checks для проверки работоспособности
13. Очистка старых образов с label `project=movies-app`

### Миграции базы данных

Миграции запускаются автоматически перед перезапуском сервисов:

```bash
docker compose run --rm api node dist/db/migrate.js
```

**Важно:**
- Миграции должны быть сгенерированы локально и закоммичены в git
- В Docker образ попадают только уже существующие миграции из `apps/api/drizzle/`
- При ошибке миграции деплой прерывается, старые контейнеры продолжают работать

**Генерация новых миграций:**
```bash
cd apps/api

# Нужна доступная PostgreSQL БД для генерации
# Можно использовать временную:
docker run -d --name temp-postgres \
  -e POSTGRES_PASSWORD=temppass \
  -e POSTGRES_DB=movies_db \
  -p 5432:5432 postgres:16-alpine

# Сгенерировать миграции
DATABASE_URL="postgres://postgres:temppass@localhost:5432/movies_db" pnpm run db:generate

# Остановить временную БД
docker stop temp-postgres && docker rm temp-postgres

# Закоммитить миграции
git add drizzle/
git commit -m "feat: add new migration"
```

### Health Checks

После деплоя автоматически проверяются:
- API: `http://localhost/api/v1/health`
- Web: `http://localhost/`

Если health check fails, деплой считается неудачным.

### Rollback при ошибке

Если деплой failed, можно откатиться к предыдущей версии:

```bash
# На VPS откатиться к конкретному SHA
cd /opt/movies-app
docker tag ghcr.io/user/movies-app/api:PREVIOUS_SHA ghcr.io/user/movies-app/api:latest
docker tag ghcr.io/user/movies-app/web:PREVIOUS_SHA ghcr.io/user/movies-app/web:latest
docker compose up -d
```

### Ручной Deploy

При необходимости можно запустить deploy вручную:

1. GitHub → Actions → Deploy workflow
2. Run workflow → выбрать ветку main
3. Run workflow

## Устранение проблем

### Сертификат не получен

1. Проверьте DNS записи: `nslookup yourdomain.com`
2. Убедитесь что порты 80/443 открыты
3. Проверьте логи certbot: `docker compose logs certbot`

### Nginx не запускается

```bash
# Проверить конфигурацию
docker compose exec nginx nginx -t

# Посмотреть логи
docker compose logs nginx
```

### База данных недоступна

```bash
# Проверить статус контейнера
docker compose ps db

# Проверить логи
docker compose logs db
```

### CI/CD проблемы

#### "failed to authorize: authentication required"

**Причина:** GHCR_PAT не настроен или истёк

**Решение:**
1. Проверить что `GHCR_PAT` secret добавлен в GitHub
2. Убедиться что токен имеет права `read:packages` и `repo`
3. Проверить срок действия токена
4. Перегенерировать токен если необходимо

#### "Permission denied (publickey)"

**Причина:** SSH ключ не добавлен на VPS или неправильный формат

**Решение:**
1. Проверить что публичный ключ в `~/.ssh/authorized_keys` на VPS
2. Убедиться что приватный ключ в secrets без лишних пробелов/переносов
3. Проверить права на VPS:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

#### "database migration failed"

**Причина:** Несовместимые изменения схемы или DATABASE_URL неправильный

**Решение:**
1. Проверить логи деплоя в GitHub Actions
2. SSH в VPS и проверить логи: `docker compose logs api`
3. Запустить миграции вручную:
   ```bash
   docker compose run --rm api node dist/db/migrate.js
   ```
4. Если ошибка в SQL миграции:
   - Проверить файлы в `apps/api/drizzle/`
   - Исправить схему локально
   - Перегенерировать: `cd apps/api && pnpm run db:generate`
   - Закоммитить исправленные миграции
   - Сделать новый деплой

#### "migrations folder not found"

**Причина:** Директория `apps/api/drizzle/` не существует в репозитории

**Решение:**
1. Локально сгенерировать начальные миграции:
   ```bash
   cd apps/api
   # Поднять временную БД
   docker run -d --name temp-postgres \
     -e POSTGRES_PASSWORD=temppass \
     -e POSTGRES_DB=movies_db \
     -p 5432:5432 postgres:16-alpine

   # Сгенерировать миграции
   DATABASE_URL="postgres://postgres:temppass@localhost:5432/movies_db" \
     pnpm run db:generate

   # Остановить временную БД
   docker stop temp-postgres && docker rm temp-postgres
   ```

2. Закоммитить и запушить миграции:
   ```bash
   git add drizzle/
   git commit -m "feat: add initial database migrations"
   git push origin main
   ```

3. GitHub Actions пересоберёт образы с миграциями

#### "health check failed"

**Причина:** Сервис не успел запуститься или действительно упал

**Решение:**
1. Проверить логи на VPS:
   ```bash
   docker compose logs api web
   ```
2. Проверить переменные окружения в `.env`
3. Увеличить sleep время в deploy workflow (если нужно больше времени на старт)
4. Проверить health endpoints вручную:
   ```bash
   curl http://localhost/api/v1/health
   curl http://localhost/
   ```
