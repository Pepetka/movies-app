# План настройки Production-Ready инфраструктуры для movies-app

## Обзор

Настройка полноценной инфраструктуры для монорепозитория:
- **CI/CD**: GitHub Actions (lint, test, build, deploy)
- **Docker**: Multi-stage builds для api и web
- **Nginx**: Reverse proxy с SSL
- **PostgreSQL**: С Drizzle ORM
- **Авторелизы**: Changesets

---

## Структура новых файлов

```
movies-app/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI на PR
│       ├── deploy.yml          # Deploy на main
│       └── release.yml         # Changesets release
├── docker/
│   ├── api/
│   │   └── Dockerfile
│   ├── web/
│   │   └── Dockerfile
│   └── nginx/
│       ├── nginx.conf
│       └── conf.d/
│           └── default.conf
├── docker-compose.yml
├── docker-compose.dev.yml      # Для локальной разработки
├── .changeset/
│   └── config.json
├── .env.example
└── docs/
    └── infrastructure.md       # Документация по инфраструктуре
```

---

## Этап 1: Подготовка SvelteKit

### 1.1 Установить adapter-node
**Файл:** `apps/web/package.json` — добавить:
```json
"devDependencies": {
  "@sveltejs/adapter-node": "^5.2.0"
}
```

### 1.2 Обновить svelte.config.js
**Файл:** `apps/web/svelte.config.js`
```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
      envPrefix: 'PUBLIC_'
    })
  }
};

export default config;
```

### 1.3 Обновить turbo.json
**Файл:** `turbo.json` — добавить `build/**` в outputs:
```json
"outputs": [".svelte-kit/**", ".vercel/**", "dist/**", "build/**"]
```

---

## Этап 2: Настройка Drizzle ORM в API

### 2.1 Установить зависимости
**Файл:** `apps/api/package.json` — добавить:
```json
"dependencies": {
  "@nestjs/config": "^4.0.0",
  "drizzle-orm": "^0.38.0",
  "postgres": "^3.4.0"
},
"devDependencies": {
  "drizzle-kit": "^0.30.0"
}
```

### 2.2 Создать конфигурацию Drizzle
**Файл:** `apps/api/drizzle.config.ts`
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 2.3 Создать схему БД
**Файл:** `apps/api/src/db/schema.ts`
```typescript
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const movies = pgTable('movies', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2.4 Создать модуль БД
**Файл:** `apps/api/src/db/db.module.ts`
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = Symbol('drizzle-connection');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = postgres(config.get('DATABASE_URL')!);
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
```

### 2.5 Обновить AppModule
**Файл:** `apps/api/src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 2.6 Добавить скрипты для миграций
**Файл:** `apps/api/package.json` — добавить scripts:
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

---

## Этап 3: Docker Configuration

### 3.1 Dockerfile для API
**Файл:** `docker/api/Dockerfile`
```dockerfile
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
RUN pnpm install --frozen-lockfile --filter=api...

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app
COPY --from=deps /app ./
COPY . .
RUN pnpm turbo run build --filter=api

FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
# pnpm: нельзя копировать только apps/api/node_modules (там симлинки на /.pnpm)
# Вариант 1: использовать `pnpm deploy --filter=api --prod /app` в builder и копировать /app
# Вариант 2: выполнить `pnpm install --prod --filter=api...` в runner при наличии lockfile/workspace
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./
USER nestjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main"]
```

### 3.2 Dockerfile для Web
**Файл:** `docker/web/Dockerfile`
```dockerfile
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
RUN pnpm install --frozen-lockfile --filter=web...

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app
COPY --from=deps /app ./
COPY . .
RUN pnpm turbo run build --filter=web

FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 sveltekit
WORKDIR /app
COPY --from=builder --chown=sveltekit:nodejs /app/apps/web/build ./build
# pnpm: нужен корректный production node_modules (см. примечание в Dockerfile для API)
COPY --from=builder --chown=sveltekit:nodejs /app/apps/web/package.json ./
USER sveltekit
EXPOSE 3000
ENV NODE_ENV=production
ENV ORIGIN=http://localhost:3000
CMD ["node", "build"]
```

### 3.3 Docker Compose Production
**Файл:** `docker-compose.yml`
```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-movies}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-movies_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-movies}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - movies-network

  api:
    image: ghcr.io/your-org/movies-app/api:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-movies}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-movies_db}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - movies-network

  web:
    image: ghcr.io/your-org/movies-app/web:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      ORIGIN: ${ORIGIN:-http://localhost}
      PUBLIC_API_URL: /api
    depends_on:
      - api
    networks:
      - movies-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - api
      - web
    networks:
      - movies-network

volumes:
  postgres_data:

networks:
  movies-network:
```
Примечание: раз используем образы из GHCR, на VPS не требуется полный репозиторий, достаточно `docker-compose.yml` и конфигов Nginx.
Примечание: рекомендуется добавить healthcheck для `api`/`web`, иначе `nginx` может стартовать раньше готовности сервисов.

---

## Этап 4: Nginx Configuration

### 4.1 Главный конфиг
**Файл:** `docker/nginx/nginx.conf`
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    access_log /var/log/nginx/access.log main;
    sendfile on;
    keepalive_timeout 65;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    include /etc/nginx/conf.d/*.conf;
}
```

### 4.2 Reverse proxy конфиг
**Файл:** `docker/nginx/conf.d/default.conf`
```nginx
upstream api_upstream {
    server api:3000;
}

upstream web_upstream {
    server web:3000;
}

server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name _;

    # SSL (раскомментировать после получения сертификата)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://web_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Примечание: для автоматического выпуска/продления TLS сертификатов нужен сервис `certbot` или внешний механизм
(сейчас указаны только тома и nginx конфиг).

---

## Этап 5: CI/CD (GitHub Actions)

### 5.1 CI Workflow
**Файл:** `.github/workflows/ci.yml`
```yaml
name: CI

on:
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9.0.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm check:types

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9.0.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter=api test
      - run: pnpm --filter=api test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9.0.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### 5.2 Deploy Workflow
**Файл:** `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/api/Dockerfile
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:latest,${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/web/Dockerfile
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/web:latest,${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/web:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Copy files to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "docker-compose.yml,docker/nginx"
          target: "/opt/movies-app"

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/movies-app
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -af
```
Примечание: для pull приватных образов на VPS чаще нужен PAT с `read:packages`
(например `GHCR_PAT`), так как `GITHUB_TOKEN` на сервере может не иметь доступа.

---

## Этап 6: Changesets

### 6.1 Установить Changesets
**Файл:** `package.json` — добавить:
```json
"scripts": {
  "changeset": "changeset",
  "version-packages": "changeset version"
},
"devDependencies": {
  "@changesets/cli": "^2.27.0"
}
```

### 6.2 Конфигурация
**Файл:** `.changeset/config.json`
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "privatePackages": {
    "version": true,
    "tag": true
  }
}
```

### 6.3 Release Workflow
**Файл:** `.github/workflows/release.yml`
```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9.0.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      - uses: changesets/action@v1
        with:
          title: 'chore: version packages'
          commit: 'chore: version packages'
          version: pnpm changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Этап 7: Environment Variables

### 7.1 Корневой .env.example
**Файл:** `.env.example`
```bash
# Database
POSTGRES_USER=movies
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=movies_db

# Web
ORIGIN=https://yourdomain.com

# Domain (для SSL)
DOMAIN=yourdomain.com
```
Примечание: `PUBLIC_API_URL` сейчас не используется в коде web. Если будете читать его через `$env/static/public`,
нужно задавать переменную на этапе build (в Dockerfile builder), иначе использовать `$env/dynamic/public`.

### 7.2 API .env.example
**Файл:** `apps/api/.env.example`
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://movies:movies_secret@localhost:5432/movies_db
```

---

## GitHub Secrets (настроить в репозитории)

| Secret | Описание |
|--------|----------|
| `VPS_HOST` | IP адрес VPS |
| `VPS_USER` | SSH пользователь |
| `VPS_SSH_KEY` | Приватный SSH ключ |

---

## Порядок реализации

1. Установить adapter-node для SvelteKit
2. Обновить turbo.json
3. Настроить Drizzle ORM в API
4. Создать Dockerfiles
5. Создать docker-compose.yml
6. Создать nginx конфигурацию
7. Создать .env.example файлы
8. Создать CI workflow
9. Создать Deploy workflow
10. Настроить Changesets
11. Создать Release workflow
12. Настроить GitHub Secrets
13. Создать документацию в docs/

---

## Верификация

После реализации проверить:

1. **Локальная сборка Docker:**
   ```bash
   docker compose build
   docker compose up -d
   ```

2. **CI на PR:** Создать тестовый PR и убедиться что lint/test/build проходят

3. **Deploy:** После мержа в main проверить что образы пушатся в GHCR и деплоятся на VPS

4. **Changesets:** Запустить `pnpm changeset` и создать тестовый changeset
