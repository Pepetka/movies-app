# api

## 0.6.0

### Minor Changes

- 7656a50: Added currentUserRole to group response for role-based permissions
  - GroupsService.findOne() returns user's role in the group
  - GroupResponseDto includes optional currentUserRole field
  - Updated unit tests to use getGroupWithMember mock

## 0.5.0

### Minor Changes

- 0d494be: Unified provider and custom movies in a single table
  - Merged custom_movies into group_movies with source field (provider/custom)
  - Removed separate custom-movies module
  - Updated repository, service, controller, and DTOs for unified schema
  - Added check constraints for source/movieId validation
  - Added IsNotEmpty validation and optimized exists query
  - Added JSDoc documentation to GroupMoviesService
  - Updated and expanded unit/e2e tests

## 0.4.2

### Patch Changes

- d06ef76: Group movies list now returns full movie details
  - Added findByGroupWithDetails repository method with JOIN to movies table
  - GroupMovieResponseDto now includes title, posterPath, overview, releaseYear, runtime, rating
  - Reduced frontend requests — no need to fetch movie details separately
  - Refactored nullable types across DTOs (MovieResponseDto, GroupResponseDto, CustomMovieResponseDto, ProviderMovieSummary, ProviderMovieDetails)

## 0.4.1

### Patch Changes

- 3a1af9d: Remove password validator from login DTO
  - Remove `@IsPassword()` decorator from AuthLoginDto (password validation not needed for login)

## 0.4.0

### Minor Changes

- 9d45b49: Add groups and movies functionality with role-based access control and Kinopoisk integration
  - Groups module — create groups, manage members, roles (owner/admin/member) and ownership transfer
  - Movies module — search movies via Kinopoisk API integration
  - Custom movies module — user-defined movies with custom data
  - Group movies module — add movies to groups with statuses (watched, planned, etc.)
  - Domain infrastructure — exceptions, guards, decorators, validators for groups and movies
  - Database schemas — new tables: groups, group_members, group_movies, custom_movies
  - Documentation — API plan and architecture

## 0.3.3

### Patch Changes

- 3bd97f4: Configure nginx API port via environment variable

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
