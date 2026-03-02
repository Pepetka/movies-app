# План: HTTP клиент с авто-рефрешем и ретраями

## Контекст

Нужен типизированный HTTP клиент для web приложения, который:

- Работает с API, использующим JWT two-token схему (access + refresh)
- Автоматически обновляет access token при 401
- Поддерживает ретраи при сетевых ошибках
- Интегрируется с Orval для генерации типизированного API

## API дизайн

### Ошибки

```typescript
// Базовая HTTP ошибка
class HttpError extends Error {
	status: number;
	statusText: string;
	body?: unknown;
}

// 401 после неудачного refresh
class AuthError extends HttpError {}

// Сетевые ошибки, timeout
class NetworkError extends Error {}

// Все ретраи исчерпаны
class RetryError extends Error {
	attempts: number;
	lastError: Error;
}
```

### Конфигурация

```typescript
interface RequestOptions {
	signal?: AbortSignal; // для отмены запроса
	headers?: Record<string, string>;
	params?: Record<string, unknown>;
}

interface HttpClientConfig {
	baseURL: string;
	timeout?: number; // default: 30000
	debug?: boolean; // логирование запросов/ответов

	auth: {
		refreshEndpoint: string; // '/api/v1/auth/refresh'
		csrfEndpoint: string; // '/api/v1/csrf/token' (public, 401 impossible)
	};

	retry?: {
		count: number; // default: 3
		delay: number; // default: 1000 (TODO: exponential backoff later)
		retryOn: number[]; // default: [408, 429, 500, 502, 503, 504]
	};
}
```

### Класс HttpClient

```typescript
class HttpClient {
	constructor(config: HttpClientConfig);

	// Callable (для Orval mutator)
	async request<T>(
		url: string,
		options?: RequestOptions & { method?: string; body?: unknown }
	): Promise<T>;

	// Методы
	get<T>(url: string, options?: RequestOptions): Promise<T>;
	post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;
	put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;
	patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;
	delete<T>(url: string, options?: RequestOptions): Promise<T>;

	// Управление токенами
	setAccessToken(token: string): void;
	clearTokens(): void;
}
```

### Приватное состояние

- `#accessToken: string | null` — access token в памяти
- `#csrfToken: string | null` — CSRF токен в памяти
- `#isRefreshing: boolean` — флаг идущего refresh
- `#refreshPromise: Promise<string> | null` — для избежания race conditions

## Auth flow при 401

```
Request → 401
  → Если уже refreshing → ждать завершения
  → Получить CSRF (если нет) → GET /api/v1/csrf/token
  → Refresh → POST /api/v1/auth/refresh (CSRF header, refresh cookie auto)
  → Сохранить новый access token
  → Повторить оригинальный запрос с новым токеном
  → Если refresh failed → throw AuthError
```

## Retry логика

Ретраить:

- Network errors (fetch failed)
- Timeout
- Статусы: 408, 429, 500, 502, 503, 504

Не ретраить:

- 4xx (кроме 408, 429) — ошибки клиента
- AuthError — после неудачного refresh

> **TODO (later):** Exponential backoff, авто-ожидание при 429 по Retry-After заголовку, авторефреш токена по таймеру

## Интеграция с Orval

Mutator для Orval:

```typescript
// src/lib/api/mutator.ts
import { httpClient } from './client';

export const customInstance = async <T>(
	url: string,
	options: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
		params?: Record<string, unknown>;
		body?: unknown;
	}
): Promise<T> => {
	return httpClient.request<T>(url, options);
};
```

Конфиг Orval:

```typescript
// orval.config.ts
export default defineConfig({
	api: {
		input: { target: './openapi.json' },
		output: {
			mode: 'split',
			target: './src/lib/api/generated/api.ts',
			schemas: './src/lib/api/generated',
			prettier: true,
			override: {
				mutator: {
					path: './src/lib/api/mutator.ts',
					name: 'customInstance'
				}
			}
		}
	}
});
```

## Файлы

| Действие | Файл                                                        |
| -------- | ----------------------------------------------------------- |
| Создать  | `src/lib/api/errors.ts` — классы ошибок                     |
| Создать  | `src/lib/api/types.ts` — типы конфигурации и RequestOptions |
| Создать  | `src/lib/api/client.ts` — класс HttpClient                  |
| Создать  | `src/lib/api/mutator.ts` — адаптер для Orval                |
| Создать  | `src/lib/api/index.ts` — barrel export                      |
| Изменить | `orval.config.ts` — добавить mutator                        |
| Изменить | `package.json` — обновить скрипты генерации                 |

## Структура после реализации

```
src/lib/api/
├── index.ts           # Barrel export
├── errors.ts          # HttpError, AuthError, NetworkError, RetryError
├── types.ts           # HttpClientConfig, RequestOptions
├── client.ts          # HttpClient class
├── mutator.ts         # Адаптер для Orval
└── generated/         # Сгенерированный Orval
    ├── api.ts         # Типизированные функции API
    ├── index.ts
    └── *.ts           # DTO типы
```

## Верификация

1. Создать инстанс клиента с конфигом
2. Вызвать `client.get('/api/v1/health')` — должен вернуть данные
3. Установить токен через `setAccessToken()`
4. Вызвать защищённый endpoint — должен пройти с Authorization header
5. Симулировать 401 — должен автоматически refresh и повторить запрос
6. Проверить что `AuthError` выбрасывается при неудачном refresh
7. Запустить `pnpm run types:generate` — Orval должен сгенерировать типизированный API
8. Импортировать сгенерированную функцию и вызвать — должна использовать наш клиент
