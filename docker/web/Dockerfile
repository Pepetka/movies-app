# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

RUN pnpm run build --filter=@repo/ui && pnpm run build --filter=web

RUN pnpm deploy --filter=web --prod /app/deploy

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

LABEL project="movies-app"

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 sveltekit && \
    adduser --system --uid 1001 sveltekit

COPY --from=builder --chown=sveltekit:sveltekit /app/deploy/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:sveltekit /app/apps/web/build ./build
COPY --from=builder --chown=sveltekit:sveltekit /app/apps/web/package.json ./package.json

USER sveltekit

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000 || exit 1

CMD ["node", "build"]
