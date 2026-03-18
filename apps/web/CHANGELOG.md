# web

## 0.10.0

### Minor Changes

- d06ef76: Group movies management with provider search
  - Created movies module (api, stores, components, types, validation)
  - Group page with movies grid and status filtering (all/tracking/planned/watched)
  - Movies search page with Kinopoisk provider integration
  - MovieCard, MovieGrid, MovieStatusBadge components
  - groupMoviesStore — fetches provider + custom movies with unified type
  - groupMovieStore — mutations for add/create/update/remove operations
  - Query system integration with automatic invalidation

### Patch Changes

- Updated dependencies [d06ef76]
  - @repo/ui@0.7.2

## 0.9.0

### Minor Changes

- 79e7d31: Form architecture refactor with unified validation pattern and mutation simplification
  - Extracted shared form styles to form-base.css for consistent styling across auth and module forms
  - Unified form validation pattern: EMPTY_FORM constants, formToCreateDto/formToUpdateDto transformers, createFormFieldValidator with debounce
  - Simplified AuthStore mutations to return void instead of data — consistent with isSuccess pattern
  - Fixed isSuccess state after mutation reset (\_hasSucceeded now resets correctly)
  - Fixed loading spinner appearing on bfcache restore (pages remain loaded when navigating back/forward)
  - Added comprehensive documentation: form-patterns.md, form-styles.md, updated query-store-pattern.md

### Patch Changes

- Updated dependencies [79e7d31]
  - @repo/ui@0.7.1

## 0.8.0

### Minor Changes

- fe3a2e9: Refactored query system with Query/Mutation classes and split stores architecture
  - Converted createQuery factory to Query class with status, isCurrentKey, revalidate methods
  - Added createMutation factory with automatic cache invalidation via tags and invalidateKeys
  - Split groups store into groups-store (list) and group-store (item + mutations)
  - Added onReset subscription in QueryRegistry for mutation reset on logout
  - Added FetchStatus (idle/loading/fetching/loaded/error) and PostStatus (idle/submitting/success/error) types
  - Added comprehensive query store pattern documentation in docs/query-store-pattern.md
  - Removed dead PostStatus duplicate from groups/types.ts

## 0.7.0

### Minor Changes

- 7c5ee4b: Added group create/edit form with improved validation and state management
  - Implemented unified GroupForm component for creating and editing groups with real-time validation
  - Added debounce utility with pending() method for async operation tracking
  - Fixed race conditions in groups store when fetching single group
  - Added error handling and retry logic for group edit page
  - Fixed form state reset on page unmount to prevent stale data
  - Extracted validation utilities, animation styles, and debounce constants to shared modules
  - Simplified auth and groups stores with single query pattern
  - Extracted shared page state CSS styles for loading/error states

### Patch Changes

- Updated dependencies [7c5ee4b]
  - @repo/ui@0.7.0

## 0.6.0

### Minor Changes

- 9d0903a: Add groups module with list view and integrate TopBar into app layout
  - Groups store and API methods for CRUD operations
  - Routes: /groups, /groups/new, /groups/[id] with PagePlaceholder
  - BaseStore class and topBarStore for cross-component state
  - TopBar integrated into app layout, visibility controlled via store
  - Groups list with skeleton loading and empty state

### Patch Changes

- Updated dependencies [9d0903a]
  - @repo/ui@0.6.0

## 0.5.0

### Minor Changes

- 3a1af9d: Full authentication system implementation
  - Add auth module: store, API functions, zod validation, navigation helpers
  - Login and register pages with premium design
  - Protected routes `(app)` with BottomNav
  - Placeholder pages: groups, profile, settings
  - Redesigned landing page with animated background
  - HttpClient: add timeout for CSRF/refresh requests, set Content-Type only when body exists
  - Add utilities: debounce, routes
  - Add dependencies: `@lucide/svelte`, `zod`

### Patch Changes

- Updated dependencies [3a1af9d]
  - @repo/ui@0.5.0

## 0.4.0

### Minor Changes

- d904192: Added theming system and UI kit integration
  - Implemented theme system (light/dark/system) with FOUC prevention via inline script in app.html
  - Integrated UI kit components: UIProvider, ThemeToggle, StatusIndicator
  - Redesigned layout: fixed header with container, centralized styles via CSS variables
  - Replaced legacy HealthCheck component with StatusIndicator

### Patch Changes

- Updated dependencies [d904192]
  - @repo/ui@0.4.0

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

### Patch Changes

- Updated dependencies [baf3206]
  - @repo/ui@0.3.0

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
