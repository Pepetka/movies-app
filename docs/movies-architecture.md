# Movies Architecture

## Обзор

Архитектура модуля работы с фильмами разделена на два типа контента:

1. **Провайдерские фильмы** — данные импортируются из внешнего провайдера (TMDB) при добавлении в группу и больше не синхронизируются (snapshot подход)
2. **Кастомные фильмы** — создаются пользователями вручную, принадлежат конкретной группе

## Ключевые решения

| Решение                     | Значение                                             |
| --------------------------- | ---------------------------------------------------- |
| Обновление при дедупликации | **Никогда** - используем существующую копию как есть |
| Дедупликация                | **imdbId приоритет**, затем `externalId`             |
| Пользовательские правки     | **Глобально** в таблице `movies`                     |
| Удаление провайдерских      | **Удаление связи** из `group_movies`, фильм остаётся |
| Удаление кастомных          | **CASCADE** с группой (фильм удаляется)              |
| Поиск                       | **Параллельный**: TMDB + local custom                |

---

## Схема БД

### movies (Провайдерские фильмы)

Snapshot из TMDB, immutable после создания.

```sql
movies
  id                  serial PRIMARY KEY
  imdbId              varchar(20)              -- индекс
  externalId          varchar(255) NOT NULL, UNIQUE
  providerId          varchar(50) DEFAULT 'tmdb'
  title               varchar(255) NOT NULL
  posterPath          varchar(512)
  overview            text
  releaseDate         date
  rating              decimal(3,1)
  genres              jsonb
  runtime             integer
  createdAt           timestamp
  updatedAt           timestamp

Indexes:
  - imdb_id_idx
  - external_id_idx (unique)
  - title_idx
```

### custom_movies (Кастомные фильмы)

Создаются пользователями, принадлежат группе.

```sql
custom_movies
  id                  serial PRIMARY KEY
  groupId             integer REFERENCES groups(id) ON DELETE CASCADE
  title               varchar(255) NOT NULL
  posterPath          varchar(512)
  overview            text
  releaseDate         date
  runtime             integer
  createdById         integer REFERENCES users(id)
  createdAt           timestamp
  updatedAt           timestamp

Indexes:
  - group_id_idx
  - title_idx
```

### groups (Группа)

```sql
groups
  id                  serial PRIMARY KEY
  name                varchar(256) NOT NULL
  description         text
  avatarUrl           varchar(512)
  ownerId             integer REFERENCES users(id)
  createdAt           timestamp
  updatedAt           timestamp
```

### group_members (Участники группы)

```sql
group_members
  id                  serial PRIMARY KEY
  groupId             integer REFERENCES groups(id) ON DELETE CASCADE
  userId              integer REFERENCES users(id) ON DELETE CASCADE
  role                enum('admin', 'moderator', 'member') DEFAULT 'member'
  createdAt           timestamp

UNIQUE(groupId, userId)
```

### group_movies (Провайдерские фильмы в группе)

Связь многие-ко-многим между группами и провайдерскими фильмами.

```sql
group_movies
  id                  serial PRIMARY KEY
  groupId             integer REFERENCES groups(id) ON DELETE CASCADE
  movieId             integer REFERENCES movies(id) ON DELETE CASCADE
  addedBy             integer REFERENCES users(id)
  status              enum('tracking', 'planned', 'watched') DEFAULT 'tracking'
  plannedDate         timestamp
  watchedDate         timestamp
  createdAt           timestamp
  updatedAt           timestamp

UNIQUE(groupId, movieId)
```

---

## Flow добавления фильма в группу

### Провайдерский фильм

```
┌────────────────────────────────────────────────────────────────────────┐
│  SEARCH                                                                │
│  User/Admin → GET /groups/:id/movies/search?query=matrix              │
│  → { provider: [...], currentGroup: [], yourMovies: [] }              │
└────────────────────────────────────────────────────────────────────────┘
                              ↓ user selects provider movie
┌────────────────────────────────────────────────────────────────────────┐
│  ADD TO GROUP                                                          │
│  POST /groups/:id/movies                                               │
│  { externalId: "603", providerId: "tmdb" }                             │
│                                                                        │
│  1. GroupMoviesService.findOrCreateMovie():                            │
│     ├─ findByExternalId("603")                                        │
│     └─ если не найден → provider.getMovieDetails() → movies.create()  │
│                                                                        │
│  2. Создание связи:                                                    │
│     └→ group_movies.create({ groupId, movieId, status: "tracking" })   │
└────────────────────────────────────────────────────────────────────────┘
```

### Кастомный фильм

```
┌────────────────────────────────────────────────────────────────────────┐
│  CREATE CUSTOM                                                         │
│  POST /groups/:id/custom-movies                                        │
│  { title: "Мой фильм", overview: "...", ... }                          │
│                                                                        │
│  → custom_movies.create({ groupId, ... })                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Поиск в контексте группы

```typescript
async searchForGroup(groupId: number, userId: number, query: string) {
  const [providerResults, currentCustom, yourCustom] = await Promise.all([
    // 1. TMDB API
    provider.search(query),

    // 2. Custom фильмы этой группы
    customMoviesRepo.findByGroup(groupId, query),

    // 3. Custom фильмов из других групп где юзер модератор/админ
    customMoviesRepo.findByUserGroups(userId, query),
  ]);

  return {
    provider: providerResults,      // Результаты из TMDB
    currentGroup: currentCustom,    // Custom этой группы
    yourMovies: yourCustom          // "Ваши фильмы" из других групп
  };
}
```

### UI отображение результатов поиска

```
Поиск в группе "Избранное": "Matrix"

┌─ Результаты ─────────────────────┐
│ 📦 TMDB                          │
│   └─ Inception                   │
│   └─ The Matrix                  │
│                                  │
│ 📁 Избранное                     │
│   └─ Семейное видео 2024         │
│                                  │
│ 👤 Ваши фильмы                   │
│   └─ Праздник 2023 (Родственники)│
└──────────────────────────────────┘
```

---

## Логика дедупликации (GroupMoviesService)

```typescript
class GroupMoviesService {
  private async findOrCreateMovie(dto: AddMovieDto): Promise<Movie> {
    // Priority 1: imdbId (универсальный)
    if (dto.imdbId) {
      const movie = await this.moviesRepo.findByImdbId(dto.imdbId);
      if (movie) return movie;
    }

    // Priority 2: externalId (специфичный для провайдера)
    if (dto.externalId) {
      const movie = await this.moviesRepo.findByExternalId(dto.externalId);
      if (movie) return movie;
    }

    // Не найден локально - импортируем из провайдера
    return this.importMovie(dto);
  }

  private async importMovie(dto: AddMovieDto): Promise<Movie> {
    const provider = this.getProvider(dto.providerId || "tmdb");

    const details = dto.imdbId
      ? await provider.findByImdbId(dto.imdbId)
      : await provider.getMovieDetails(dto.externalId);

    return this.moviesRepo.create(provider.mapToNewMovie(details));
  }
}
```

---

## Логика удаления

### Провайдерский фильм

```typescript
async removeMovieFromGroup(groupId: number, movieId: number): Promise<void> {
  // Удаляем только связь
  await this.groupMoviesRepo.delete(groupId, movieId);

  // Фильм остаётся в таблице movies (может использоваться в других группах)
}
```

### Кастомный фильм

```typescript
async removeCustomMovie(id: number): Promise<void> {
  // Кастомный фильм удаляется CASCADE вместе с группой
  // Или явно через DELETE FROM custom_movies WHERE id = $1
  await this.customMoviesRepo.delete(id);
}
```

---

## API Endpoints

### Поиск фильмов (в контексте группы)

| Метод | Роут                                     | Описание                          | Guard   |
| ----- | ---------------------------------------- | --------------------------------- | ------- |
| GET   | `/groups/:id/movies/search?query=matrix` | Параллельный поиск: TMDB + custom | Members |

### Провайдерские фильмы в группе

| Метод  | Роут                      | Описание                     | Guard      |
| ------ | ------------------------- | ---------------------------- | ---------- |
| GET    | `/groups/:id/movies`      | Список провайдерских фильмов | Members    |
| POST   | `/groups/:id/movies`      | Добавить провайдерский фильм | Moderators |
| GET    | `/groups/:id/movies/:mid` | Детали фильма в группе       | Members    |
| PATCH  | `/groups/:id/movies/:mid` | Изменить статус/дату         | Moderators |
| DELETE | `/groups/:id/movies/:mid` | Удалить из группы            | Moderators |

### Кастомные фильмы в группе

| Метод  | Роут                             | Описание              | Guard      |
| ------ | -------------------------------- | --------------------- | ---------- |
| GET    | `/groups/:id/custom-movies`      | Список custom фильмов | Members    |
| POST   | `/groups/:id/custom-movies`      | Создать custom фильм  | Moderators |
| GET    | `/groups/:id/custom-movies/:cid` | Детали custom фильма  | Members    |
| PATCH  | `/groups/:id/custom-movies/:cid` | Редактировать         | Moderators |
| DELETE | `/groups/:id/custom-movies/:cid` | Удалить               | Moderators |

### Глобальные фильмы (admin только)

| Метод  | Роут          | Описание                     | Guard         |
| ------ | ------------- | ---------------------------- | ------------- |
| GET    | `/movies`     | Все провайдерские фильмы     | Admin         |
| GET    | `/movies/:id` | Детали провайдерского фильма | Authenticated |
| PATCH  | `/movies/:id` | Исправить ошибки данных      | Admin         |
| DELETE | `/movies/:id` | Удалить фильм                | Admin         |

---

## DTO

### AddMovieDto (добавление провайдерского фильма в группу)

```typescript
{
  // Либо IMDb ID (приоритет)
  imdbId?: string;  // "tt0133093"

  // Либо externalId + providerId
  externalId?: string;  // "603"
  providerId?: string;  // "tmdb" (default)
}
```

### CreateCustomMovieDto (создание кастомного фильма)

```typescript
{
  title: string;
  posterPath?: string;
  overview?: string;
  releaseDate?: string;  // ISO 8601
  runtime?: number;
}
```

### GroupMovieUpdateDto (изменение статуса провайдерского фильма)

```typescript
{
  status?: 'tracking' | 'planned' | 'watched';
  plannedDate?: string;  // ISO 8601
  watchedDate?: string;  // ISO 8601
}
```

### UpdateCustomMovieDto (редактирование кастомного фильма)

```typescript
{
  title?: string;
  posterPath?: string;
  overview?: string;
  releaseDate?: string;
  runtime?: number;
}
```

---

## Провайдеры

### MovieProvider interface

```typescript
interface MovieProvider {
  readonly name: string;

  search(
    query: string,
    page?: number,
    language?: string,
  ): Promise<ProviderSearchResult>;
  getMovieDetails(
    externalId: string,
    language?: string,
  ): Promise<ProviderMovieDetails>;
  findByImdbId(
    imdbId: string,
    language?: string,
  ): Promise<ProviderMovieDetails>;
  mapToNewMovie(details: ProviderMovieDetails): NewMovie;
}
```

### Реализации

- **TmdbService** - TMDB API (default для всех)
- **OmdbService** - OMDB API (только для admin, TODO)

---

## Статусы фильма в группе

| Статус     | Описание                              | Дата          |
| ---------- | ------------------------------------- | ------------- |
| `tracking` | Отслеживается (дефолт при добавлении) | -             |
| `planned`  | Запланирован к просмотру              | `plannedDate` |
| `watched`  | Просмотрен                            | `watchedDate` |

---

## Ограничения

### Custom фильмы

- **Нет переноса между группами** — кастомный фильм принадлежит только одной группе
- **Экспорт/импорт** — можно добавить позже (JSON/CSV)
- **CASCADE удаление** — при удалении группы удаляются все её custom фильмы

### Провайдерские фильмы

- **Snapshot подход** — данные не обновляются после импорта
- **Переиспользование** — один фильм может быть в нескольких группах
- **Безопасное удаление** — удаление из группы не удаляет фильм из БД
