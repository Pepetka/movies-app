# Схема базы данных

## users

| Поле             | Тип          | Constraints              |
| ---------------- | ------------ | ------------------------ |
| id               | serial       | PK                       |
| name             | varchar(256) | not null                 |
| email            | varchar(256) | not null, unique         |
| passwordHash     | varchar(256) | **nullable**             |
| role             | user_role    | not null, default USER   |
| refreshTokenHash | varchar(256) | nullable, unique         |
| avatar           | varchar(512) | nullable                 |
| createdAt        | timestamp    | default now()            |
| updatedAt        | timestamp    | default now()            |

**Примечания:**
- `passwordHash` — nullable для OAuth-only пользователей.
- `avatar` — URL аватара (заполняется при OAuth-входе или может быть установлен вручную).

## oauth_accounts

| Поле              | Тип             | Constraints                                    |
| ----------------- | --------------- | ---------------------------------------------- |
| id                | serial          | PK                                             |
| userId            | integer         | FK → users.id, onDelete cascade, not null      |
| provider          | auth_provider   | not null                                       |
| providerAccountId | varchar(256)    | not null                                       |
| avatar            | varchar(512)    | nullable                                       |
| createdAt         | timestamp       | default now()                                  |
| updatedAt         | timestamp       | default now()                                  |

**Constraints:**
- Unique: `(provider, providerAccountId)`
- Index: `user_id`

**Примечания:**
- Хранит связь между локальным пользователем и внешним OAuth-провайдером.
- Один user может иметь несколько oauth_accounts (разные провайдеры).
- `providerAccountId` — ID пользователя на стороне провайдера (для Google — `sub` из OIDC).

## movies

| Поле      | Тип          | Constraints       |
| --------- | ------------ | ----------------- |
| id        | serial       | PK                |
| title     | varchar(256) | not null          |
| year      | integer      | nullable          |
| poster    | varchar(512) | nullable          |
| source    | movie_source | not null          |
| externalId| varchar(256) | nullable          |
| createdAt | timestamp    | default now()     |
| updatedAt | timestamp    | default now()     |

## groups

| Поле      | Тип          | Constraints       |
| --------- | ------------ | ----------------- |
| id        | serial       | PK                |
| name      | varchar(256) | not null          |
| ownerId   | integer      | FK → users.id     |
| createdAt | timestamp    | default now()     |
| updatedAt | timestamp    | default now()     |

## group_members

| Поле      | Тип             | Constraints                        |
| --------- | --------------- | ---------------------------------- |
| id        | serial          | PK                                 |
| groupId   | integer         | FK → groups.id, onDelete cascade   |
| userId    | integer         | FK → users.id, onDelete cascade    |
| role      | group_member_role | not null, default member         |
| createdAt | timestamp       | default now()                      |
| updatedAt | timestamp       | default now()                      |

## group_movies

| Поле       | Тип                  | Constraints                        |
| ---------- | -------------------- | ---------------------------------- |
| id         | serial               | PK                                 |
| groupId    | integer              | FK → groups.id, onDelete cascade   |
| movieId    | integer              | FK → movies.id, onDelete cascade   |
| status     | group_movie_status   | not null, default pending          |
| createdAt  | timestamp            | default now()                      |
| updatedAt  | timestamp            | default now()                      |

## group_movie_reviews

| Поле         | Тип          | Constraints                              |
| ------------ | ------------ | ---------------------------------------- |
| id           | serial       | PK                                       |
| groupMovieId | integer      | FK → group_movies.id, onDelete cascade   |
| userId       | integer      | FK → users.id, onDelete cascade          |
| rating       | numeric(2,1) | not null                                 |
| text         | text         | nullable                                 |
| createdAt    | timestamp    | default now()                            |
| updatedAt    | timestamp    | default now()                            |

**Constraints:**
- Unique: `(groupMovieId, userId)` — один отзыв на фильм от пользователя

**Примечания:**
- `rating` хранится с шагом 0.5 (например, 3.5).
- `text` — опциональный текстовый комментарий.
