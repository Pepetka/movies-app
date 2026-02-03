# api

## 0.3.2

### Patch Changes

- a5d1744: Fixed API port forwarding in nginx

## 0.3.1

### Patch Changes

- b67a603: Fix production dependency resolution

## 0.3.0

### Minor Changes

- baf3206: Feat: JWT Authentication with User Management
  - JWT authentication with access & refresh tokens
  - User CRUD module (create, read, update, delete)
  - Role-based access control (ADMIN, MEMBER)
  - CSRF protection
  - Password validation & hashing (bcrypt)
  - Comprehensive test coverage (unit + e2e)
  - Developer tooling: husky, lint-staged
  - Database migrations for auth tables

## 0.2.0

### Minor Changes

- 50c9de1: - Fixed environment configuration
  - Added health check functionality

## 0.1.0

### Minor Changes

- 8bc700f: - Настроены приложения и базовая инфраструктура (API, Web, общие пакеты).
  - Добавлены Docker/Compose конфиги, nginx + Let's Encrypt, пример `.env`, инструкции по прод-развёртыванию.
  - Подключены миграции БД и образы из GHCR; улучшена надёжность деплоя.
  - Полностью настроены CI/CD в GitHub Actions: CI для PR, deploy на VPS, Changesets для версионирования.
  - Улучшены release/deploy workflows: защита от дублей тегов, связка релиза и деплоя, проверка тегов, поддержка кастомного SSH порта.
  - Документация актуализирована под новые процессы.
