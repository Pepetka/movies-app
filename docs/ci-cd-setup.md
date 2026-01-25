# CI/CD Setup Guide

Пошаговое руководство по настройке автоматического развёртывания для movies-app.

## Предварительные требования

- VPS сервер (Ubuntu/Debian)
- Домен с настроенными DNS записями
- Docker и Docker Compose установлены на VPS
- GitHub репозиторий (публичный или приватный)

## Шаг 1: Генерация SSH ключа для GitHub Actions

На вашей локальной машине:

```bash
# Генерируем новый SSH ключ
ssh-keygen -t ed25519 -C "github-actions@movies-app" -f ~/.ssh/movies-app-deploy

# Копируем публичный ключ на VPS
ssh-copy-id -i ~/.ssh/movies-app-deploy.pub your-user@your-vps-ip

# Тестируем подключение
ssh -i ~/.ssh/movies-app-deploy your-user@your-vps-ip

# Копируем приватный ключ (понадобится для GitHub secret)
cat ~/.ssh/movies-app-deploy
# Скопировать ВЕСЬ вывод включая BEGIN и END строки
```

## Шаг 2: Генерация GitHub Personal Access Token

1. Перейдите на GitHub.com → Settings → Developer settings
2. Personal access tokens → Fine-grained tokens → **Generate new token**

**Настройки токена:**
- **Token name:** `movies-app-ghcr-pull`
- **Expiration:** 90 days (рекомендуется, можно больше)
- **Repository access:** Only select repositories → выберите ваш movies-app репозиторий
- **Permissions:**
  - **Contents:** Read
  - **Packages:** Read

3. Нажмите **Generate token**
4. **ВАЖНО:** Скопируйте токен сразу — он больше не будет показан

**Альтернатива (Classic Token):**

Если Fine-grained tokens не работают:
1. Personal access tokens → Tokens (classic) → Generate new token
2. Scopes:
   - `read:packages`
   - `repo` (для приватных репозиториев)
3. Expiration: 90 days

## Шаг 3: Настройка GitHub Secrets

В вашем репозитории на GitHub:

1. Settings → Secrets and variables → Actions
2. Нажмите **New repository secret** для каждого:

| Secret Name | Значение |
|-------------|----------|
| `VPS_HOST` | IP адрес вашего VPS (например: `123.45.67.89`) или домен |
| `VPS_USER` | SSH пользователь (обычно `ubuntu`, `root`, или ваш user) |
| `VPS_SSH_KEY` | Полное содержимое приватного ключа из `~/.ssh/movies-app-deploy` |
| `GHCR_USERNAME` | Ваш GitHub username (например: `vlvkuznetsov`) |
| `GHCR_PAT` | Токен из Шага 2 |

**Проверка VPS_SSH_KEY:**
- Должен начинаться с `-----BEGIN OPENSSH PRIVATE KEY-----`
- Должен заканчиваться `-----END OPENSSH PRIVATE KEY-----`
- Включать все строки между ними
- Никаких лишних пробелов или символов

## Шаг 4: Подготовка VPS

SSH в ваш VPS:

```bash
ssh your-user@your-vps-ip
```

### 4.1 Создайте директорию приложения

```bash
sudo mkdir -p /opt/movies-app
sudo chown $USER:$USER /opt/movies-app
cd /opt/movies-app
```

### 4.2 Скопируйте конфигурационные файлы

**На локальной машине** (в новом терминале):

```bash
cd /path/to/movies-app

# Копируем docker-compose.yml
scp docker-compose.yml your-user@your-vps-ip:/opt/movies-app/

# Копируем nginx конфигурацию
scp -r docker/nginx your-user@your-vps-ip:/opt/movies-app/docker/

# Создаём .env файл
scp .env.example your-user@your-vps-ip:/opt/movies-app/.env
```

### 4.3 Настройте переменные окружения

**На VPS:**

```bash
cd /opt/movies-app
nano .env
```

Обязательные переменные:

```bash
NODE_ENV=production
PORT=3000

# GitHub Container Registry
GITHUB_REPOSITORY=username/movies-app  # Ваш GitHub username/repo

# Database
POSTGRES_USER=movies
POSTGRES_PASSWORD=<СИЛЬНЫЙ_ПАРОЛЬ>  # Сгенерируйте безопасный пароль
POSTGRES_DB=movies_db
DATABASE_URL=postgres://movies:<СИЛЬНЫЙ_ПАРОЛЬ>@postgres:5432/movies_db

# URLs
DOMAIN=yourdomain.com  # Ваш домен БЕЗ https://
WEB_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

# Security
COOKIE_SECRET=<32+ случайных символа>  # Генерируется ниже

# SSL
CERTBOT_EMAIL=admin@yourdomain.com  # Ваш email
```

**Генерация COOKIE_SECRET:**

```bash
openssl rand -base64 32
```

Скопируйте вывод в `COOKIE_SECRET`.

### 4.4 Настройте SSL сертификат

**Важно:** Сначала тестируем с staging сертификатом.

```bash
# Скопируйте скрипт init-letsencrypt.sh на VPS
# На локальной машине:
scp scripts/init-letsencrypt.sh your-user@your-vps-ip:/opt/movies-app/

# На VPS:
chmod +x init-letsencrypt.sh

# ТЕСТОВЫЙ запуск (staging сертификат)
./init-letsencrypt.sh --staging

# Проверьте что nginx запустился
docker compose ps

# Если всё работает, получите настоящий сертификат
./init-letsencrypt.sh
```

### 4.5 Проверьте firewall

Убедитесь что порты открыты:

```bash
# Для UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# Или проверьте через iptables
sudo iptables -L -n | grep -E '(80|443)'
```

## Шаг 5: Тестирование CI

### 5.1 Создайте тестовый PR

```bash
# На локальной машине
git checkout -b test-ci
echo "# CI Test" >> README.md
git add README.md
git commit -m "test: verify CI workflow"
git push origin test-ci
```

### 5.2 Создайте Pull Request на GitHub

1. GitHub → Pull requests → New pull request
2. base: `main` ← compare: `test-ci`
3. Create pull request

### 5.3 Проверьте CI workflow

1. В PR перейдите на вкладку **Checks**
2. Должны запуститься jobs:
   - ✅ Lint
   - ✅ Type Check
   - ✅ Build
   - ✅ Test

Если все jobs зелёные — CI настроен правильно!

## Шаг 6: Первый Deploy

### 6.1 Merge PR

Если CI прошёл успешно, смержите PR в `main`.

### 6.2 Следите за Deploy Workflow

1. GitHub → Actions → Deploy workflow
2. Должен автоматически запуститься после merge
3. Отслеживайте прогресс:
   - **build-and-push** — сборка Docker образов (~5-10 мин)
   - **deploy** — развёртывание на VPS (~2-3 мин)

### 6.3 Проверка деплоя на VPS

**SSH в VPS:**

```bash
ssh your-user@your-vps-ip
cd /opt/movies-app

# Проверьте запущенные контейнеры
docker compose ps

# Все должны быть Up (healthy):
# movies-postgres   Up (healthy)
# movies-api        Up (healthy)
# movies-web        Up (healthy)
# movies-nginx      Up
# movies-certbot    Up

# Проверьте логи
docker compose logs --tail=50 api
docker compose logs --tail=50 web

# Проверьте health endpoints
curl http://localhost/api/v1/health
# Должен вернуть 200 OK

curl http://localhost/
# Должен вернуть HTML страницу
```

### 6.4 Проверка через браузер

Откройте ваш домен в браузере:

- `https://yourdomain.com` — должен открыться SvelteKit app
- `https://yourdomain.com/api/v1/health` — должен вернуть health статус

✅ **Поздравляю! CI/CD настроен и работает!**

## Ежедневное использование

### Разработка с автоматическим деплоем

1. Создайте feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Разработка и коммиты:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

3. Создайте PR на GitHub — CI автоматически запустится

4. После ревью смержите в `main` — автоматический деплой на production

### Database Migrations

При изменении схемы БД:

```bash
cd apps/api

# Отредактируйте схемы в src/db/schemas/

# Для генерации миграций нужна PostgreSQL БД
# Можно использовать временную:
docker run -d --name temp-postgres \
  -e POSTGRES_PASSWORD=temppass \
  -e POSTGRES_DB=movies_db \
  -p 5432:5432 postgres:16-alpine

# Сгенерируйте миграцию
DATABASE_URL="postgres://postgres:temppass@localhost:5432/movies_db" \
  pnpm run db:generate

# Остановите временную БД
docker stop temp-postgres && docker rm temp-postgres

# Проверьте созданные SQL файлы в drizzle/
ls -la drizzle/

# Закоммитьте миграции
git add drizzle/
git commit -m "feat: add users table migration"
```

Миграции запустятся автоматически при деплое.

## Устранение проблем

### Deploy fails с "authentication required"

**Проблема:** GHCR_PAT неправильный или истёк.

**Решение:**
1. Проверьте срок действия токена на GitHub
2. Перегенерируйте токен если необходимо
3. Обновите secret `GHCR_PAT`

### Deploy fails с "Permission denied (publickey)"

**Проблема:** SSH ключ не настроен правильно.

**Решение:**
1. Проверьте что публичный ключ добавлен на VPS:
   ```bash
   cat ~/.ssh/authorized_keys
   ```
2. Проверьте права:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```
3. Убедитесь что VPS_SSH_KEY содержит ВЕСЬ приватный ключ

### Migration fails

**Проблема:** Ошибка в SQL миграции.

**Решение:**
1. Проверьте логи в GitHub Actions
2. SSH в VPS и проверьте:
   ```bash
   docker compose logs api
   ```
3. Исправьте схему локально и перегенерируйте миграции
4. Сделайте новый PR с исправлениями

### "migrations folder not found"

**Проблема:** Директория `apps/api/drizzle/` отсутствует в репозитории.

**Решение:**
1. Локально сгенерируйте начальные миграции (см. раздел "Database Migrations" выше)
2. Закоммитьте и запушьте:
   ```bash
   git add apps/api/drizzle/
   git commit -m "feat: add initial database migrations"
   git push origin main
   ```
3. GitHub Actions автоматически пересоберёт образы с миграциями

### Health check fails

**Проблема:** Сервис не запустился.

**Решение:**
1. Проверьте логи на VPS:
   ```bash
   docker compose logs api web nginx
   ```
2. Проверьте переменные окружения в `.env`
3. Убедитесь что все переменные заполнены правильно

## Дополнительная информация

- [Полная документация по deployment](./deployment.md)
- [GitHub Actions workflows](./.github/README.md)
- Помощь: создайте issue в репозитории
