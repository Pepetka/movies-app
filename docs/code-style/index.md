# Code Style

Общие правила и ссылки на специфичные документы.

## Базовые правила

| App | Indent | Quotes | Print Width |
| --- | ------ | ------ | ----------- |
| web | tabs   | single | 100         |
| api | spaces | single | -           |
| ui  | tabs   | single | 100         |

## Guards order

```
Throttler → CSRF → Auth → Roles → Group*
```

- `@Public()` обходит AuthGuard
- Global roles: `USER`, `ADMIN`
- Group roles: `member`, `moderator`, `admin`

## Документы

| Файл | Содержание |
| ---- | ---------- |
| [api.md](api.md) | NestJS: service, controller, repository, DTO, guards, exceptions, schemas |
| [ui.md](ui.md) | Svelte компоненты: структура, props, types |
| [svelte-runes.md](svelte-runes.md) | Svelte 5 runes: $state, $derived, $effect, $props, $bindable |
| [css.md](css.md) | CSS conventions: BEM-нейминг, переменные, состояния |
| [web.md](web.md) | SvelteKit: stores, modules, API clients |
| [testing.md](testing.md) | Unit tests (Vitest), E2E tests (Playwright) |
| [storybook.md](storybook.md) | Stories: defineMeta, snippets, best practices |
