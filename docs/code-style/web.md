# Web (SvelteKit)

## Store (классовый подход)

```typescript
class HealthStore {
  // Публичное реактивное состояние
  status = $state<HealthStatus>('loading');
  lastChecked = $state<Date | undefined>();
  error = $state<string | undefined>();

  // Приватные поля с _префиксом
  private _intervalId: ReturnType<typeof setTimeout> | null = null;
  private _abortController: AbortController | null = null;
  private _consecutiveFailures: number = 0;

  constructor() {
    // Инициализация
  }

  // Публичные методы
  async check() {
    return this._executeHealthCheck();
  }

  startPolling() { }
  stopPolling() { }

  // Cleanup - всегда реализуем
  destroy(): void {
    this._clearScheduledCheck();

    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }

  // Приватные методы
  private async _executeHealthCheck(): Promise<HealthCheckResult> { }
  private _scheduleNextCheck(): void { }
  private _clearScheduledCheck(): void { }

  // Логирование
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    meta?: Record<string, unknown>
  ): void {
    logger[level]('HealthStore', message, meta);
  }
}

// Singleton export
export const healthStore = new HealthStore();
```

## Module structure

Модули организованы в подпапки по ответственности:

```
modules/
  {name}/
    api/
      {name}.api.ts       # HTTP запросы
      index.ts            # Реэкспорт
    stores/
      {entity}.store.svelte.ts  # Reactive store (класс)
      index.ts            # Реэкспорт
    components/           # Svelte компоненты (опционально)
      Component.svelte
      Component.types.ts
      index.ts
    types/
      {name}.types.ts     # TypeScript типы
      index.ts
    validation/           # Валидация форм (опционально)
      {name}.validation.svelte.ts
      index.ts
    config/               # Конфигурация (опционально)
      {name}.config.ts
      index.ts
    index.ts              # Public API модуля
```

### Назначение подпапок

| Папка | Содержимое |
|-------|------------|
| `api/` | HTTP-запросы к бэкенду |
| `stores/` | Реактивные сторы с `$state`, query/mutation |
| `components/` | Svelte-компоненты модуля |
| `types/` | TypeScript типы (не из generated) |
| `validation/` | Zod-схемы, мапперы форм |
| `config/` | Константы и настройки |

### Правила импортов

```typescript
// ❌ ИЗВНЕ — запрещено
import { store } from '$lib/modules/auth/stores/auth.store.svelte';

// ✅ ИЗВНЕ — только через index модуля
import { authStore } from '$lib/modules/auth';

// ✅ ВНУТРИ модуля — прямой импорт
import { login } from '../api/auth.api';
```

## API layer

```typescript
// api/auth.api.ts
import { apiClient } from '$lib/api/client';

export async function login(data: AuthLoginDto): Promise<void> {
  await apiClient.post('/auth/login', data);
}
```

## Config

```typescript
// config/health.config.ts
export const healthConfig = {
  defaultPollingInterval: 30000,
  maxConsecutiveFailures: 3,
  backoffMultiplier: 2,
  maxBackoffInterval: 300000,
} as const;
```

## Types

```typescript
// types/health.types.ts
export type HealthStatus = 'loading' | 'online' | 'offline' | 'degraded';

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  latency?: number;
  error?: string;
}
```

## Index (реэкспорт)

```typescript
// index.ts — публичный API модуля
export { healthStore } from './stores';
export { checkHealth } from './api';
export type { HealthStatus, HealthCheckResult } from './types';
export { healthConfig } from './config';
```

## Использование в компонентах

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { healthStore } from '$lib/modules/health';

  onMount(() => {
    healthStore.startPolling();
    return () => healthStore.destroy();
  });
</script>

{#if healthStore.status === 'online'}
  <span class="status online">Online</span>
{:else if healthStore.status === 'offline'}
  <span class="status offline">Offline</span>
{/if}
```
