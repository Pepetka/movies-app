# Movies App Web

SvelteKit фронтенд для Movies App с Svelte 5.

## Стек технологий

- **Framework:** SvelteKit
- **UI:** Svelte 5 (runes syntax)
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

## Локальная разработка

```bash
# Установить зависимости
pnpm install

# Development режим
pnpm run dev

# Build
pnpm run build

# Preview production build
pnpm run preview
```

Приложение будет доступно на http://localhost:5173

## Команды

```bash
# Разработка
pnpm run dev                 # Запустить dev сервер
pnpm run dev -- --open       # Открыть в браузере
pnpm run build               # Собрать для production
pnpm run preview             # Preview production build

# Проверка
pnpm run check               # Проверить типы
pnpm run check:ts            # Только TypeScript
pnpm run lint                # ESLint
pnpm run lint:fix            # ESLint auto-fix
pnpm run format              # Prettier format
```

## Текущее состояние

Фронтенд находится на начальной стадии разработки.

### Реализовано

- Базовая структура SvelteKit приложения
- Компонент HealthCheck для мониторинга API
- Инфраструктура для API запросов

### В разработке

- UI для аутентификации (register, login, logout)
- Страницы пользователей
- UI для управления фильмами
- Группы и приглашения

## Структура проекта

```
src/
├── routes/                  # SvelteKit file-based routing
│   ├── +layout.svelte       # Root layout
│   ├── +layout.ts           # Root layout server logic
│   └── +page.svelte         # Home page
│
└── lib/                     # Shared utilities
    ├── components/          # Svelte компоненты
    │   └── health/          # Health check components
    ├── stores/              # Svelte stores
    │   └── health.ts        # Health check store
    └── utils/               # Utility functions
        └── api-fetch.ts     # API client
```

## Компоненты

### HealthCheck

Компонент для отображения статуса API в реальном времени.

```svelte
<script lang="ts">
	import { HealthCheck } from '$lib/components';
</script>

<HealthCheck />
```

## Stores

### health store

Реактивное хранилище для статуса API с автоматическим опросом.

```typescript
import { health } from '$lib/stores/health';

// Подписка на изменения
health.subscribe((status) => {
	console.log(status.isOnline, status.latency);
});
```

## Styling

Приложение использует Tailwind CSS.

Конфигурация: `tailwind.config.js`

## Лицензия

MIT
