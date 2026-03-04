# Code Style

Общие правила и ссылки на специфичные документы.

## Базовые правила

| App | Indent | Quotes | Print Width |
| --- | ------ | ------ | ----------- |
| web | tabs   | single | 100         |
| api | spaces | single | -           |
| ui  | tabs   | single | 100         |

- Приватные поля и методы классов — с префиксом `_`: `private _field`, `private _method()`
- Стрелочные функции предпочтительнее: `const fn = () => {}`. Function declaration только если невозможно использовать стрелочную

## Git

**Коммиты** — Conventional Commits:

```
type(scope): message
```

| Type | Описание |
| ---- | -------- |
| feat | Новая функциональность |
| fix | Исправление бага |
| docs | Документация |
| chore | Рутина, зависимости |
| ci | CI/CD изменения |
| refactor | Рефакторинг без изменения поведения |
| test | Тесты |

Scope — app или package: `web`, `api`, `ui`. Если касается нескольких — опустить.
Сообщение — однострочное, без body/footer.

**Ветки** — `type/short_description`:

```
feat/auth
feat/web_http_client
fix/nginx_api_port
chore/dependabot_and_deps
release/init
```

Описание в snake_case.

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
| [testing.md](testing.md) | Unit tests (Jest), E2E tests (NestJS + supertest) |
| [storybook.md](storybook.md) | Stories: defineMeta, snippets, best practices |
