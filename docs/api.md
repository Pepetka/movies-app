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

## Guards (порядок выполнения)

1. **ThrottlerGuard** — Rate limiting (отключён в test)
2. **CsrfGuard** — CSRF-защита (отключён в test)
3. **AuthGuard** — JWT-валидация (обход через `@Public()`)
4. **RolesGuard** — Ролевой доступ (`@Roles('admin')`)
5. **GroupMemberGuard** — Проверка членства в группе
6. **GroupModeratorGuard** — Модератор или админ группы
7. **GroupAdminGuard** — Только админ группы

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

| Метод | Endpoint  | Доступ  | Описание                      |
| ----- | --------- | ------- | ----------------------------- |
| POST  | /register | Public  | Создание аккаунта             |
| POST  | /login    | Public  | Получение токенов             |
| POST  | /refresh  | Public  | Обновление access (cookie)    |
| POST  | /logout   | Auth    | Аннулирование сессии          |

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
| GET   | /search               | Member       | Поиск (Kinopoisk + группа)        |
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
