# web

## 0.2.2

### Patch Changes

- 5b62110: - fixed web envs

## 0.2.1

### Patch Changes

- c7adf40: - Fixed web envs

## 0.2.0

### Minor Changes

- 50c9de1: - Fixed environment configuration
  - Added health check functionality

### Patch Changes

- Updated dependencies [50c9de1]
  - @repo/ui@0.2.0

## 0.1.0

### Minor Changes

- 8bc700f: - Настроены приложения и базовая инфраструктура (API, Web, общие пакеты).
  - Добавлены Docker/Compose конфиги, nginx + Let's Encrypt, пример `.env`, инструкции по прод-развёртыванию.
  - Подключены миграции БД и образы из GHCR; улучшена надёжность деплоя.
  - Полностью настроены CI/CD в GitHub Actions: CI для PR, deploy на VPS, Changesets для версионирования.
  - Улучшены release/deploy workflows: защита от дублей тегов, связка релиза и деплоя, проверка тегов, поддержка кастомного SSH порта.
  - Документация актуализирована под новые процессы.

### Patch Changes

- Updated dependencies [8bc700f]
  - @repo/ui@0.1.0
