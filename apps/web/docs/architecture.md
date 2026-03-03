# Модульная архитектура web-приложения

## Структура директорий

```
apps/web/src/lib/
├── modules/                    # Доменные модули
│   ├── auth/
│   │   ├── api.ts              # login, register, refresh, logout
│   │   ├── store.svelte.ts     # AuthStore с $state (Svelte 5 runes)
│   │   ├── types.ts            # Локальные типы (User, Tokens, AuthRequest)
│   │   ├── AuthForm.svelte
│   │   ├── AuthGuard.svelte
│   │   └── index.ts
│   │
│   ├── movies/
│   │   ├── api.ts              # search, CRUD
│   │   ├── store.svelte.ts
│   │   ├── types.ts
│   │   ├── MovieCard.svelte
│   │   ├── MovieList.svelte
│   │   └── index.ts
│   │
│   ├── groups/
│   │   ├── api.ts              # groups, members, movies
│   │   ├── store.svelte.ts
│   │   ├── types.ts
│   │   ├── GroupCard.svelte
│   │   └── index.ts
│   │
│   ├── profile/
│   │   ├── api.ts
│   │   ├── store.svelte.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── health/
│       ├── api.ts
│       ├── store.svelte.ts
│       ├── types.ts
│       ├── config.ts
│       └── index.ts
│
├── compositions/               # Операции между модулями
│   ├── group-movies.ts         # addMovieToGroup, removeMovieFromGroup
│   └── index.ts
│
├── api/                        # Общий API слой
│   ├── client.ts               # HttpClient с retry/timeout/auth refresh
│   ├── errors.ts               # HttpError, AuthError, NetworkError, RetryError
│   ├── types.ts                # HttpClientConfig, RequestOptions
│   ├── mutator.ts              # Интеграция orval с HttpClient
│   ├── generated/              # Автогенерация orval (API функции и DTO)
│   └── index.ts
│
├── ui/                         # Общие UI компоненты приложения
│   ├── Layout.svelte
│   ├── Header.svelte
│   ├── Navigation.svelte
│   └── index.ts
│
├── utils/                      # Общие утилиты
│   ├── logger.ts
│   ├── format.ts
│   └── index.ts
│
├── types/                      # Общие типы (если понадобятся)
│   └── index.ts
│
└── index.ts                    # Главный реэкспорт
```

## Структура routes

```
apps/web/src/routes/
├── (app)/                      # Защищенные роуты
│   ├── +layout.svelte          # AuthGuard + Header + Navigation
│   ├── movies/
│   │   ├── +page.svelte
│   │   └── [id]/+page.svelte
│   ├── groups/
│   │   ├── +page.svelte
│   │   └── [id]/+page.svelte
│   └── profile/+page.svelte
│
├── (auth)/                     # Auth роуты (без защиты)
│   ├── login/+page.svelte
│   └── register/+page.svelte
│
├── +layout.svelte              # Корневой layout (UIProvider)
├── +page.svelte                # Landing / редирект
└── +error.svelte
```

## Правила зависимостей

```
routes/         → modules/*, ui/*, compositions/*
compositions/   → modules/*, api/*, utils/*
modules/*       → api/*, utils/*, @repo/ui
api/utils/types → только друг друга
```

**Запрещено:**

- Модулям импортировать другие модули напрямую (только через compositions)
- Модулям импортировать compositions

## Паттерн index.ts модуля

```typescript
// lib/modules/movies/index.ts

// 1. Types (локальные, не из generated)
export type { MovieFilters, MovieListState } from './types';

// 2. API
export { getMovies, searchMovies, getMovieById } from './api';

// 3. Store
export { moviesStore } from './store.svelte';

// 4. Components
export { default as MovieCard } from './MovieCard.svelte';
export { default as MovieList } from './MovieList.svelte';
```

## Compositions vs Service Layer

### Compositions

Используются для координации между модулями:

- Простые операции, затрагивающие 2-3 модуля
- Оркестрация вызовов API разных модулей
- Пример: `addMovieToGroup` использует `movies.api` и `groups.api`

### Service Layer (внутри модуля)

Добавляется когда:

- Логика слишком сложная для store
- Нужна переиспользуемость в разных местах модуля
- Требуется изолированное тестирование

```typescript
// modules/movies/movie.service.ts
export class MovieService {
	async addToGroup(movieId: string, groupId: string) {
		// Валидация, проверки, уведомления
	}
}
```

**Правило:** Пока compositions справляются — не усложнять. Service layer добавляется по необходимости.

---

## Слои компонентов

| Слой             | Содержимое                                                        |
| ---------------- | ----------------------------------------------------------------- |
| `@repo/ui`       | Button, Input, Modal - универсальные компоненты без бизнес-логики |
| `lib/ui`         | Header, Layout, Navigation - компоненты приложения                |
| `modules/*/`     | MovieCard, AuthForm - компоненты с бизнес-логикой домена          |
| `compositions/`  | Операции между модулями (addMovieToGroup)                         |
| `api/generated/` | DTO типы и API функции сгенерированные orval                      |

## Доступные API типы (generated)

**Auth:** `AuthLoginDto`, `AuthRegisterDto`, `AuthResponseDto`, `CsrfResponseDto`

**Users:** `UserCreateDto`, `UserResponseDto`, `UserUpdateDto`

**Movies:** `MovieCreateDto`, `MovieResponseDto`, `MovieUpdateDto`, `ProviderMovieSummary`, `ProviderSearchResult`, `AddMovieDto`

**Groups:** `GroupCreateDto`, `GroupResponseDto`, `GroupUpdateDto`, `GroupMemberAddDto`, `GroupMemberResponseDto`, `GroupMemberRoleUpdateDto`, `GroupMovieResponseDto`, `EditGroupMovieDto`, `TransferOwnershipDto`

**Custom Movies:** `CreateCustomMovieDto`, `CustomMovieResponseDto`, `UpdateCustomMovieDto`
