# Movies App - Схема базы данных

Документ описывает все таблицы, их поля и связи между ними. Разделено по этапам — какие таблицы появляются на каком этапе разработки.

> Типы данных указаны приближённо к PostgreSQL. Все таблицы имеют поля `created_at` и `updated_at` (timestamp, default now()).

---

## Текущая реализация (feat/auth)

На текущий момент реализована базовая схема для аутентификации и управления пользователями.

## Диаграмма связей (текущее состояние)

```
users ──┬── (future: group_members > groups > group_movies > movies)
        │
        ├── (future: reviews)
        │
        ├── (future: oauth_accounts)
        │
        └── (future: totp_secrets)

movies (placeholder)
```

---

## Реализованные таблицы

### users

Пользователи приложения с встроенным refresh-токеном.

| Поле               | Тип                                             | Описание                                                    |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| **id**             | serial, PK                                      |                                                             |
| name               | varchar(256), NOT NULL                          | Отображаемое имя                                            |
| email              | varchar(256), NOT NULL, UNIQUE                  | Email для входа                                             |
| password_hash      | varchar(256), NOT NULL                          | Хеш пароля (bcrypt, 12 rounds)                              |
| role               | enum('USER', 'ADMIN'), NOT NULL, default 'USER' | Роль пользователя                                           |
| refresh_token_hash | varchar(256), UNIQUE                            | Хеш текущего refresh-токена (null если нет активной сессии) |
| created_at         | timestamp, NOT NULL, default now()              | Дата создания                                               |
| updated_at         | timestamp, NOT NULL, default now()              | Дата обновления                                             |

**Индексы:**

- `UNIQUE INDEX` на `email`
- `UNIQUE INDEX` на `refresh_token_hash`

**Примечания:**

- Refresh-токен хранится непосредственно в таблице users (один активный токен на пользователя)
- При logout или refresh токен перезаписывается (rotation)

---

### movies

Заглушка для будущей функциональности фильмов.

| Поле        | Тип                                | Описание                        |
| ----------- | ---------------------------------- | ------------------------------- |
| **id**      | serial, PK                         |                                 |
| external_id | varchar(255), NOT NULL, UNIQUE     | ID фильма во внешнем API (TMDB) |
| title       | varchar(255), NOT NULL             | Название фильма                 |
| created_at  | timestamp, NOT NULL, default now() |                                 |
| updated_at  | timestamp, NOT NULL, default now() |                                 |

**Индексы:**

- `UNIQUE INDEX` на `external_id`

---

## Планируемые таблицы (согласно product-roadmap.md)

### groups

Группы пользователей для совместного просмотра фильмов.

| Поле        | Тип                                | Описание             |
| ----------- | ---------------------------------- | -------------------- |
| **id**      | serial, PK                         |                      |
| name        | varchar(256), NOT NULL             | Название группы      |
| description | text                               | Описание             |
| avatar_url  | varchar(512)                       | URL аватара группы   |
| owner_id    | int, FK → users.id, NOT NULL       | Создатель / владелец |
| created_at  | timestamp, NOT NULL, default now() |                      |
| updated_at  | timestamp, NOT NULL, default now() |                      |

---

### group_members

Связь пользователей с группами (many-to-many) с ролями.

| Поле       | Тип                                                              | Описание      |
| ---------- | ---------------------------------------------------------------- | ------------- |
| **id**     | serial, PK                                                       |               |
| group_id   | int, FK → groups.id, NOT NULL                                    |               |
| user_id    | int, FK → users.id, NOT NULL                                     |               |
| role       | enum('admin', 'moderator', 'member'), NOT NULL, default 'member' | Роль в группе |
| created_at | timestamp, NOT NULL, default now()                               |               |
| updated_at | timestamp, NOT NULL, default now()                               |               |

**Ограничения:**

- `UNIQUE (group_id, user_id)`

---

### group_movies

Связь фильмов с группами, статусы и даты просмотра.

| Поле         | Тип                                                                  | Описание                        |
| ------------ | -------------------------------------------------------------------- | ------------------------------- |
| **id**       | serial, PK                                                           |                                 |
| group_id     | int, FK → groups.id, NOT NULL                                        |                                 |
| movie_id     | int, FK → movies.id, NOT NULL                                        |                                 |
| added_by     | int, FK → users.id, NOT NULL                                         | Кто добавил фильм               |
| status       | enum('tracking', 'planned', 'watched'), NOT NULL, default 'tracking' | Статус фильма                   |
| planned_date | timestamp                                                            | Дата запланированного просмотра |
| watched_date | timestamp                                                            | Дата фактического просмотра     |
| created_at   | timestamp, NOT NULL, default now()                                   |                                 |
| updated_at   | timestamp, NOT NULL, default now()                                   |                                 |

**Ограничения:**

- `UNIQUE (group_id, movie_id)`

---

### invitations

Пригласительные ссылки в группу (Этап 2).

| Поле       | Тип                                | Описание                              |
| ---------- | ---------------------------------- | ------------------------------------- |
| **id**     | uuid, PK                           |                                       |
| group_id   | int, FK → groups.id, NOT NULL      |                                       |
| created_by | int, FK → users.id, NOT NULL       | Кто создал ссылку                     |
| code       | varchar(64), NOT NULL, UNIQUE      | Уникальный код                        |
| max_uses   | int                                | Макс. использований (NULL = безлимит) |
| use_count  | int, NOT NULL, default 0           | Сколько использована                  |
| expires_at | timestamp                          | Когда истекает (NULL = бессрочно)     |
| is_active  | boolean, NOT NULL, default true    | Активна ли                            |
| created_at | timestamp, NOT NULL, default now() |                                       |
| updated_at | timestamp, NOT NULL, default now() |                                       |

---

### reviews

Оценки и отзывы (Этап 4).

| Поле           | Тип                                 | Описание     |
| -------------- | ----------------------------------- | ------------ |
| **id**         | serial, PK                          |              |
| group_movie_id | int, FK → group_movies.id, NOT NULL |              |
| user_id        | int, FK → users.id, NOT NULL        | Автор        |
| rating         | smallint, NOT NULL                  | Оценка 1-10  |
| comment        | text                                | Текст отзыва |
| created_at     | timestamp, NOT NULL, default now()  |              |
| updated_at     | timestamp, NOT NULL, default now()  |              |

**Ограничения:**

- `UNIQUE (group_movie_id, user_id)`
- `CHECK (rating >= 1 AND rating <= 10)`

---

### telegram_bindings

Привязка Telegram бота к группам (Этап 5).

| Поле             | Тип                                | Описание             |
| ---------------- | ---------------------------------- | -------------------- |
| **id**           | serial, PK                         |                      |
| group_id         | int, FK → groups.id, NOT NULL      |                      |
| telegram_chat_id | bigint, NOT NULL                   | ID чата в Telegram   |
| bound_by         | int, FK → users.id, NOT NULL       | Кто привязал         |
| bind_code        | varchar(64), UNIQUE                | Код привязки         |
| notify_enabled   | boolean, NOT NULL, default true    | Напоминания включены |
| notify_time      | time, default '10:00'              | Время напоминаний    |
| created_at       | timestamp, NOT NULL, default now() |                      |
| updated_at       | timestamp, NOT NULL, default now() |                      |

**Ограничения:**

- `UNIQUE (group_id, telegram_chat_id)`

---

### oauth_accounts

OAuth провайдеры (Этап 6).

| Поле                | Тип                                | Описание             |
| ------------------- | ---------------------------------- | -------------------- |
| **id**              | serial, PK                         |                      |
| user_id             | int, FK → users.id, NOT NULL       |                      |
| provider            | varchar(32), NOT NULL              | google, github, etc. |
| provider_account_id | varchar(256), NOT NULL             | ID у провайдера      |
| email               | varchar(256)                       | Email от провайдера  |
| created_at          | timestamp, NOT NULL, default now() |                      |
| updated_at          | timestamp, NOT NULL, default now() |                      |

**Ограничения:**

- `UNIQUE (provider, provider_account_id)`
- `UNIQUE (user_id, provider)`

---

### totp_secrets

Двухфакторная аутентификация (Этап 6).

| Поле           | Тип                                  | Описание              |
| -------------- | ------------------------------------ | --------------------- |
| **id**         | serial, PK                           |                       |
| user_id        | int, FK → users.id, NOT NULL, UNIQUE |                       |
| secret         | varchar(256), NOT NULL               | Зашифрованный секрет  |
| is_enabled     | boolean, NOT NULL, default false     | Активирован ли        |
| recovery_codes | text                                 | Резервные коды (JSON) |
| verified_at    | timestamp                            | Когда подтверждён     |
| created_at     | timestamp, NOT NULL, default now()   |                       |
| updated_at     | timestamp, NOT NULL, default now()   |                       |

---

## Сводка по этапам

| Этап             | Новые таблицы                       | Изменения в существующих                     |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| **Реализовано**  | users, movies                       | —                                            |
| **Этап 1 (MVP)** | groups, group_members, group_movies | —                                            |
| **Этап 2**       | invitations                         | —                                            |
| **Этап 3**       | —                                   | — (роли уже в group_members)                 |
| **Этап 4**       | reviews                             | —                                            |
| **Этап 5**       | telegram_bindings                   | —                                            |
| **Этап 6**       | oauth_accounts, totp_secrets        | users: password_hash nullable для OAuth-only |

---

## Примечания по текущей реализации

1. **Refresh Tokens**: Хранятся в таблице users как refresh_token_hash, не отдельная таблица
2. **Роли**: Глобальная роль в users (USER/ADMIN) отличается от ролей в group_members
3. **Movies**: Текущая таблица — placeholder, будет расширена при интеграции с TMDB API
4. **Миграции**: Генерируются через Drizzle Kit, хранятся в `apps/api/drizzle/`
