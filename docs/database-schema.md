# Movies App - Схема базы данных

Документ описывает все таблицы, их поля и связи между ними. Разделено по этапам — какие таблицы появляются на каком этапе разработки.

> Типы данных указаны приближённо к PostgreSQL. Все таблицы имеют поля `created_at` и `updated_at` (timestamp, default now()).

---

## Диаграмма связей

```
users ──┬── refresh_tokens
        │
        ├──< group_members >──── groups ──┬── group_movies ──── movies
        │                                 │
        │                                 ├── invitations
        │                                 │
        │                                 └── telegram_bindings
        │
        ├── reviews ──────────────────────── group_movies
        │
        ├── oauth_accounts
        │
        └── totp_secrets

movies ──── movie_cache (TMDB metadata)
```

---

## MVP

### users

Пользователи приложения.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| name | varchar(256), NOT NULL | Отображаемое имя |
| email | varchar(256), NOT NULL, UNIQUE | Email для входа |
| password_hash | varchar(256), NOT NULL | Хеш пароля (bcrypt) |
| is_admin | boolean, NOT NULL, default false | Глобальный админ (для MVP) |

**Индексы:**
- `UNIQUE INDEX` на `email`

---

### refresh_tokens

Refresh-токены для двухтокеновой JWT-схемы. Хранятся в БД для возможности отзыва.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | uuid, PK | |
| user_id | int, FK → users.id, NOT NULL | Владелец токена |
| token_hash | varchar(256), NOT NULL | Хеш refresh-токена |
| expires_at | timestamp, NOT NULL | Срок действия |
| revoked | boolean, NOT NULL, default false | Отозван ли токен |
| user_agent | varchar(512) | Браузер/устройство |
| ip_address | varchar(45) | IP при выдаче |

**Индексы:**
- `INDEX` на `user_id`
- `INDEX` на `token_hash`
- `INDEX` на `expires_at` (для очистки устаревших)

---

### movies

Фильмы, добавленные в систему. Одна запись на фильм — если один и тот же фильм добавлен в несколько групп, запись в `movies` одна, связи через `group_movies`.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| external_id | varchar(255), NOT NULL, UNIQUE | ID фильма в TMDB |
| title | varchar(255), NOT NULL | Название фильма |
| original_title | varchar(255) | Оригинальное название |
| overview | text | Описание/синопсис |
| poster_path | varchar(255) | Путь к постеру (TMDB) |
| release_date | date | Дата выхода |
| vote_average | numeric(3,1) | Средний рейтинг TMDB |

**Индексы:**
- `UNIQUE INDEX` на `external_id`
- `INDEX` на `title`

---

### groups

Группы пользователей. В MVP — одна группа, в дальнейшем — множество.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| name | varchar(256), NOT NULL | Название группы |
| description | text | Описание |
| avatar_url | varchar(512) | URL аватара группы |
| owner_id | int, FK → users.id, NOT NULL | Создатель / владелец |

**Индексы:**
- `INDEX` на `owner_id`

---

### group_members

Связь пользователей с группами (many-to-many). Определяет, кто состоит в какой группе.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| group_id | int, FK → groups.id, NOT NULL | |
| user_id | int, FK → users.id, NOT NULL | |
| role | enum('admin', 'member'), NOT NULL, default 'member' | Роль в группе (в MVP: admin / member) |

**Ограничения:**
- `UNIQUE (group_id, user_id)` — пользователь не может быть дважды в одной группе

**Индексы:**
- `INDEX` на `group_id`
- `INDEX` на `user_id`

---

### group_movies

Связь фильмов с группами. Хранит статус фильма в конкретной группе и дату просмотра.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| group_id | int, FK → groups.id, NOT NULL | |
| movie_id | int, FK → movies.id, NOT NULL | |
| added_by | int, FK → users.id, NOT NULL | Кто добавил фильм |
| status | enum('tracking', 'planned', 'watched'), NOT NULL, default 'tracking' | Статус фильма в группе |
| planned_date | timestamp | Дата запланированного просмотра |
| watched_date | timestamp | Дата фактического просмотра |

**Ограничения:**
- `UNIQUE (group_id, movie_id)` — один фильм в группе не дублируется

**Индексы:**
- `INDEX` на `group_id`
- `INDEX` на `(group_id, status)` — фильтрация по статусу внутри группы
- `INDEX` на `planned_date` — для напоминаний (Telegram бот)

---

## Этап 2: Многопользовательские группы

### invitations

Пригласительные ссылки в группу.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | uuid, PK | |
| group_id | int, FK → groups.id, NOT NULL | В какую группу |
| created_by | int, FK → users.id, NOT NULL | Кто создал ссылку |
| code | varchar(64), NOT NULL, UNIQUE | Уникальный код приглашения |
| max_uses | int | Макс. число использований (NULL = безлимит) |
| use_count | int, NOT NULL, default 0 | Сколько раз использована |
| expires_at | timestamp | Когда истекает (NULL = бессрочно) |
| is_active | boolean, NOT NULL, default true | Активна ли ссылка |

**Индексы:**
- `UNIQUE INDEX` на `code`
- `INDEX` на `group_id`

---

## Этап 3: Ролевая модель

На этом этапе значение enum `role` в таблице `group_members` расширяется:

**group_members.role:** `'admin'` | `'moderator'` | `'member'`

Новых таблиц не добавляется — роли хранятся в существующей таблице `group_members`.

---

## Этап 4: Оценки и отзывы

### reviews

Оценки и текстовые отзывы пользователей на фильмы.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| group_movie_id | int, FK → group_movies.id, NOT NULL | Фильм в конкретной группе |
| user_id | int, FK → users.id, NOT NULL | Автор отзыва |
| rating | smallint | Оценка (1-10) |
| comment | text | Текст отзыва (опционально) |

**Ограничения:**
- `UNIQUE (group_movie_id, user_id)` — один отзыв от пользователя на фильм в группе
- `CHECK (rating >= 1 AND rating <= 10)`

**Индексы:**
- `INDEX` на `group_movie_id`
- `INDEX` на `user_id`

---

## Этап 5: Telegram бот

### telegram_bindings

Привязка Telegram-чатов к группам в приложении.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| group_id | int, FK → groups.id, NOT NULL | |
| telegram_chat_id | bigint, NOT NULL | ID чата в Telegram |
| bound_by | int, FK → users.id, NOT NULL | Кто привязал |
| bind_code | varchar(64), UNIQUE | Код привязки (обнуляется после использования) |
| notify_enabled | boolean, NOT NULL, default true | Включены ли напоминания |
| notify_time | time, default '10:00' | Время отправки напоминаний |

**Ограничения:**
- `UNIQUE (group_id, telegram_chat_id)`

**Индексы:**
- `INDEX` на `group_id`
- `INDEX` на `telegram_chat_id`
- `INDEX` на `bind_code`

---

## Этап 6: Улучшение безопасности

### oauth_accounts

Привязанные OAuth-провайдеры к аккаунтам пользователей.

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| user_id | int, FK → users.id, NOT NULL | |
| provider | varchar(32), NOT NULL | Провайдер (google, github, yandex, vk) |
| provider_account_id | varchar(256), NOT NULL | ID пользователя у провайдера |
| email | varchar(256) | Email от провайдера |

**Ограничения:**
- `UNIQUE (provider, provider_account_id)` — один аккаунт провайдера привязан один раз
- `UNIQUE (user_id, provider)` — один провайдер на пользователя

**Индексы:**
- `INDEX` на `user_id`

---

### totp_secrets

Данные для двухфакторной аутентификации (TOTP).

| Поле | Тип | Описание |
|------|-----|----------|
| **id** | serial, PK | |
| user_id | int, FK → users.id, NOT NULL, UNIQUE | |
| secret | varchar(256), NOT NULL | Зашифрованный TOTP-секрет |
| is_enabled | boolean, NOT NULL, default false | Активирован ли 2FA |
| recovery_codes | text | Зашифрованные резервные коды (JSON-массив) |
| verified_at | timestamp | Когда пользователь подтвердил настройку |

**Индексы:**
- `UNIQUE INDEX` на `user_id`

---

## Сводка по этапам

| Этап | Новые таблицы | Изменения в существующих |
|------|---------------|--------------------------|
| **MVP** | users, refresh_tokens, movies, groups, group_members, group_movies | — |
| **Этап 2** | invitations | — |
| **Этап 3** | — | group_members.role: добавляется значение 'moderator' |
| **Этап 4** | reviews | — |
| **Этап 5** | telegram_bindings | — |
| **Этап 6** | oauth_accounts, totp_secrets | users: поле password_hash становится nullable (OAuth-only аккаунты) |

---

## Каскадное удаление

| Родительская таблица | Дочерняя таблица | Поведение при удалении |
|---------------------|------------------|----------------------|
| users | refresh_tokens | CASCADE |
| users | group_members | CASCADE |
| users | reviews | CASCADE |
| users | oauth_accounts | CASCADE |
| users | totp_secrets | CASCADE |
| groups | group_members | CASCADE |
| groups | group_movies | CASCADE |
| groups | invitations | CASCADE |
| groups | telegram_bindings | CASCADE |
| movies | group_movies | CASCADE |
| group_movies | reviews | CASCADE |
