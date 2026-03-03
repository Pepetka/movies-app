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

```
modules/
  health/
    api.ts           # HTTP запросы
    config.ts        # Конфигурация
    store.svelte.ts  # Reactive store (класс)
    types.ts         # TypeScript типы
    index.ts         # Public API (реэкспорт)
```

## API client

```typescript
// api.ts
import { apiClient } from '$lib/api/client';

export async function checkHealth(): Promise<HealthCheckResult> {
  const response = await apiClient.get('/health');
  return response.data;
}
```

## Config

```typescript
// config.ts
export const healthConfig = {
  defaultPollingInterval: 30000,
  maxConsecutiveFailures: 3,
  backoffMultiplier: 2,
  maxBackoffInterval: 300000,
} as const;
```

## Types

```typescript
// types.ts
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
// index.ts
export { healthStore } from './store.svelte';
export type { HealthStatus, HealthCheckResult } from './types';
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
