# `@repo/eslint-config`

Коллекция конфигураций ESLint для Movies App монорепозитория.

## Конфигурации

### `base`

Базовая конфигурация TypeScript.

```javascript
// eslint.config.js
import base from "@repo/eslint-config/base";

export default [
  ...base,
  // Ваши дополнительные правила
];
```

### `nest.js`

Конфигурация для NestJS приложений с правилами для TypeScript и оптимизирована для использования с Prettier.

```javascript
// eslint.config.js
import nest from "@repo/eslint-config/nest.js";

export default [
  ...nest,
  // Ваши дополнительные правила
];
```

### `svelte.js`

Конфигурация для SvelteKit приложений с поддержкой Svelte файлов.

```javascript
// eslint.config.js
import svelte from "@repo/eslint-config/svelte.js";

export default [
  ...svelte,
  // Ваши дополнительные правила
];
```

## Использование

### Установка

```bash
pnpm add -D @repo/eslint-config
```

### Настройка

В корне вашего приложения создайте `eslint.config.js`:

```javascript
import config from "@repo/eslint-config/<variant>";

export default [
  ...config,
  {
    ignores: [".svelte-kit/", "build/"],
  },
];
```

## Правила

### Общие для всех

- TypeScript ESLint для проверки типов
- Prettier интеграция
- Поддержка import/export

### NestJS специфика

- Правила для декораторов NestJS
- Валидация имен классов и методов

### Svelte специфика

- Поддержка `.svelte` файлов
- Svelte специфические правила

## Лицензия

MIT
