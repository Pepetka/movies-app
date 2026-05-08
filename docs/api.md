# Документация API

## Базовый URL

- **API:** `/api/v1/...`
- **Swagger:** `/api/docs` (только в non-production)

## Аутентификация

### JWT — схема с двумя токенами

- **Access Token:** короткоживущий (15 мин), хранится в памяти, передаётся через `Authorization: Bearer <token>`
- **Refresh Token:** долгоживущий (7 дней), хранится в httpOnly cookie, ротируется при обновлении

### Поток аутентификации

```
Login → { accessToken, user } + refresh cookie
       ↓
API-запрос с заголовком Authorization
       ↓
401 → Автообновление через POST /auth/refresh (cookie + CSRF)
       ↓
Новый accessToken, повтор исходного запроса
```

### Защита от CSRF

- CSRF-токен обязателен для мутаций
- `GET /csrf/token` — получить токен (публичный endpoint)
- Передавать в заголовке `X-CSRF-Token` для POST/PUT/PATCH/DELETE

## OAuth Flow

### Поддерживаемые провайдеры

| Провайдер | Статус |
| --------- | ------ |
| Google    | ✅     |

### Login flow

1. SPA: `window.location.href = ${API}/auth/oauth/google`
2. API: 302 → Google + `oauth_session` cookie (signed, contains state + code_verifier + intent=login)
3. Google: consent screen
4. Google: 302 → `/auth/oauth/google/callback?code=...&state=...`
5. API: validates state, exchanges code (PKCE), creates/links user, sets `refresh_token` cookie
6. API: 302 → `${WEB_URL}/oauth/success`
7. SPA `/oauth/success`: `POST /auth/refresh` → access token → goto('/')

### Link flow

1. SPA: `POST /auth/oauth/google/link/init` (Auth + CSRF) → `{ authUrl }` + `oauth_session` cookie (intent=link, userId)
2. SPA: `window.location.href = authUrl`
3. Google → callback (тот же `/callback` endpoint)
4. API: видит `intent=link`, проверяет email match, создаёт `oauth_accounts`
5. API: 302 → `${WEB_URL}/oauth/link-success`

### Защита

- **CSRF на OAuth flow:** signed cookie `oauth_session` с `state` (RFC 6749 §10.12).
- **PKCE (S256):** обязателен в OAuth 2.1, защищает от authorization code injection.
- **CSRF на /link/init:** стандартный CSRF token (как другие POST).
- **email_verified check:** провайдер бракует профили без подтверждённого email.
- **email match при link:** OAuth-профиль должен совпадать по email с текущим пользователем.

### Возможные ошибки (redirect на /oauth/error?reason=...)

| reason                               | Что произошло                              |
| ------------------------------------ | ------------------------------------------ |
| `access_denied`                      | Пользователь отказал на стороне провайдера |
| `oauth_email_unverified`             | Провайдер вернул `email_verified: false`   |
| `oauth_code_exchange_failed`         | Token endpoint провайдера упал             |
| `oauth_link_email_mismatch`          | Email профиля != email user (link-flow)    |
| `oauth_account_already_linked`       | OAuth account уже привязан другому user    |
| `invalid_intent` / `invalid_session` | Целостность сессии нарушена                |
| `missing_code`                       | Callback без `code` и без `error`          |
| `invalid_state`                      | State cookie не совпал с query param       |

## Guards (порядок выполнения)

1. **ThrottlerGuard** — Rate limiting (отключён в test)
2. **CsrfGuard** — CSRF-защита (отключён в test)
3. **AuthGuard** — JWT-валидация (обход через `@Public()`)
4. **RolesGuard** — Ролевой доступ (`@Roles('admin')`)
5. **AuthorGuard** — Проверка владельца ресурса (`@Author()`)
6. **GroupMemberGuard** — Проверка членства в группе
7. **GroupModeratorGuard** — Модератор или админ группы
8. **GroupAdminGuard** — Только админ группы

## Роли

### Глобальные роли (таблица users)

| Роль  | Доступ |
| ----- | ------ |
| USER  | Свой профиль, группы, фильмы |
| ADMIN | Все пользователи, все группы, админ-панель |

### Роли в группе (таблица group_members)

| Роль      | Просмотр | Добавление фильмов | Управление участниками | Удаление группы |
| --------- | :------: | :----------------: | :--------------------: | :-------------: |
| member    | ✅       | ❌                 | ❌                     | ❌               |
| moderator | ✅       | ✅                 | добавление/удаление    | ❌               |
| admin     | ✅       | ✅                 | полное                 | ✅               |

## Rate Limiting

| Уровень | Лимит                      | Применение          |
| ------- | -------------------------- | ------------------- |
| short   | 3–10 запросов / 1 секунда  | Критичные endpoints |
| long    | 5–100 запросов / 60 секунд | Общий               |

### Конфигурация по модулям

| Модуль              | short (1с) | long (60с) | Примечание              |
| ------------------- | ---------- | ---------- | ----------------------- |
| auth.critical       | 3          | 5          | register, login         |
| auth.refresh        | 5          | 15         | refresh token           |
| csrf                | 10         | 30         | получение CSRF-токена   |
| invites.info        | 5          | 20         | публичная информация    |
| invites.accept      | 3          | 10         | принятие инвайта        |
| movies.search       | 5          | 30         | поиск через провайдер   |
| movies.admin        | 10         | 100        | CRUD фильмов (Admin)    |

## Endpoints

### Auth (`/auth`)

| Метод | Endpoint                   | Доступ | Описание                                      |
| ----- | -------------------------- | ------ | --------------------------------------------- |
| POST  | /register                  | Public | Создание аккаунта (email + password)          |
| POST  | /login                     | Public | Получение токенов (email + password)          |
| POST  | /refresh                   | Public | Обновление access (cookie)                    |
| POST  | /logout                    | Auth   | Аннулирование сессии                          |
| GET   | /oauth/:provider           | Public | Редирект на OAuth-провайдера (с PKCE + state) |
| GET   | /oauth/:provider/callback  | Public | Callback → 302 на ${WEB_URL}/oauth/success    |
| POST  | /oauth/:provider/link/init | Auth   | Init link-flow, возвращает provider authUrl   |

### Users (`/users`)

| Метод | Endpoint | Доступ        | Описание             |
| ----- | -------- | ------------- | -------------------- |
| GET   | /me      | Auth          | Текущий пользователь |
| GET   | /        | Admin         | Список пользователей |
| POST  | /        | Admin         | Создать пользователя |
| PATCH | /:id     | Owner/Admin   | Обновить пользователя |
| DELETE| /:id     | Owner/Admin   | Удалить пользователя |

### Groups (`/groups`)

| Метод | Endpoint              | Доступ       | Описание                           |
| ----- | --------------------- | ------------ | ---------------------------------- |
| GET   | /                     | Auth         | Мои группы                         |
| GET   | /all                  | Admin        | Все группы                         |
| GET   | /user/:userId         | Admin        | Группы пользователя (по ID)        |
| POST  | /                     | Auth         | Создать группу                     |
| GET   | /:id                  | Member       | Детали группы                      |
| GET   | /:id/invite           | Moderator+   | Получить invite-токен              |
| POST  | /:id/invite           | Moderator+   | Сгенерировать invite-токен         |
| PATCH | /:id                  | Moderator+   | Обновить группу                    |
| DELETE| /:id                  | Group Admin  | Удалить группу                     |

### Invites (`/invites`)

| Метод | Endpoint       | Доступ  | Описание                                |
| ----- | -------------- | ------- | --------------------------------------- |
| GET   | /:token        | Public  | Информация о группе по invite-токену    |
| POST  | /:token/accept | Auth    | Принять инвайт, присоединиться к группе |

### Group Members (`/groups/:id/members`)

| Метод | Endpoint              | Доступ       | Описание                          |
| ----- | --------------------- | ------------ | --------------------------------- |
| GET   | /                     | Member       | Список участников                 |
| GET   | /me                   | Member       | Свой статус в группе              |
| POST  | /                     | Moderator+   | Добавить участника                |
| PATCH | /:userId              | Group Admin  | Изменить роль                     |
| DELETE| /me                   | Member       | Покинуть группу                   |
| DELETE| /:userId              | Moderator+   | Удалить участника                 |

### Group Movies (`/groups/:groupId/movies`)

| Метод | Endpoint              | Доступ       | Описание                          |
| ----- | --------------------- | ------------ | --------------------------------- |
| GET   | /                     | Member       | Список фильмов группы             |
| GET   | /search               | Moderator+   | Поиск (Kinopoisk + группа)        |
| POST  | /                     | Moderator+   | Добавить фильм из провайдера      |
| POST  | /custom               | Moderator+   | Создать кастомный фильм           |
| GET   | /:id                  | Member       | Детали фильма                     |
| PATCH | /:id                  | Moderator+   | Обновить статус/данные            |
| DELETE| /:id                  | Moderator+   | Удалить фильм                     |

### Transfer Ownership (`/groups/:id`)

| Метод | Endpoint              | Доступ      | Описание                     |
| ----- | --------------------- | ----------- | ---------------------------- |
| POST  | /transfer-ownership   | Group Admin | Передать права администратора|

### Movies (`/movies`)

| Метод | Endpoint  | Доступ  | Описание               |
| ----- | --------- | ------- | ---------------------- |
| GET   | /search   | Public  | Поиск в Kinopoisk      |
| GET   | /         | Admin   | Все фильмы из БД       |
| POST  | /         | Admin   | Создать фильм          |
| GET   | /:id      | Auth    | Детали фильма          |
| PATCH | /:id      | Admin   | Обновить фильм         |
| DELETE| /:id      | Admin   | Удалить фильм          |

## Известные ограничения

- `refresh_token` cookie использует `sameSite=strict`. При cross-site развёртывании (SPA на `app.example.com`, API на `api.example.com`) браузер не отправит cookie на `POST /auth/refresh`. Это **pre-existing** баг текущей auth-системы, не специфичен OAuth. При едином origin через reverse-proxy — не актуален.
- Auto-link по email защищён только для провайдеров с гарантированным `email_verified` (Google). При добавлении GitHub/Microsoft — требуется дополнительная верификация.

## Примеры запросов

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Регистрация
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"SecurePass123!"}'

# Логин
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Текущий пользователь
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## Декораторы

| Декоратор      | Описание                                           |
| -------------- | -------------------------------------------------- |
| `@Public()`    | Обходит AuthGuard                                  |
| `@Roles(...)`  | Требуемые роли                                     |
| `@User()`      | Получить текущего пользователя из запроса          |
| `@UserId()`    | Получить ID текущего пользователя                  |
| `@Cookies()`   | Получить cookies                                    |
| `@Author()`    | Установить автора для аудита                       |
| `@GroupMember()` | Получить участника группы из запроса (guards)    |

## Сериализация

Response DTO используют `ClassSerializerInterceptor` с `excludeExtraneousValues: true`. В ответ попадают только поля с `@Expose()`. Каждое поле response DTO обязано иметь `@Expose()`, иначе оно будет молча удалено.
