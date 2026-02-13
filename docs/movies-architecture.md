# Movies Architecture

## Обзор

Архитектура модуля работы с фильмами разделена на два типа контента:

1. **Провайдерские фильмы** — данные импортируются из Kinopoisk при добавлении в группу и больше не синхронизируются (snapshot подход)
2. **Кастомные фильмы** — создаются пользователями вручную, принадлежат конкретной группе

## Ключевые решения

| Решение                      | Значение                                             |
| ---------------------------- | ---------------------------------------------------- |
| Обновление при дедупликации  | **Никогда** - используем существующую копию как есть |
| Дедупликация                 | **imdbId приоритет**, затем `externalId`             |
| Редактирование провайдерских | **Конвертация** в custom фильм с копированием данных |
| Удаление провайдерских       | **Удаление связи** из `group_movies`, фильм остаётся |
| Удаление кастомных           | **CASCADE** с группой (фильм удаляется)              |
| Поиск                        | **Параллельный**: Kinopoisk + custom текущей группы  |

---

## Схема БД

### movies (Провайдерские фильмы)

Snapshot из Kinopoisk, immutable после создания.

```sql
movies
  id                  serial PRIMARY KEY
  imdbId              varchar(20)              -- индекс
  externalId          varchar(255) NOT NULL, UNIQUE
  title               varchar(255) NOT NULL
  posterPath          varchar(512)
  overview            text
  releaseYear         integer
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
  releaseYear         integer
  runtime             integer
  status              enum('tracking', 'planned', 'watched') DEFAULT 'tracking'
  plannedDate         timestamp
  watchedDate         timestamp
  createdById         integer REFERENCES users(id) ON DELETE CASCADE
  createdAt           timestamp
  updatedAt           timestamp

Indexes:
  - group_id_idx
  - title_idx
  - status_idx
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
│  → { provider: [...], currentGroup: [] }                              │
└────────────────────────────────────────────────────────────────────────┘
                              ↓ user selects provider movie
┌────────────────────────────────────────────────────────────────────────┐
│  ADD TO GROUP                                                          │
│  POST /groups/:id/movies                                               │
│  { imdbId: "tt0133093" }                                             │
│                                                                        │
│  1. GroupMoviesService.findOrCreateMovie():                            │
│     ├─ findByImdbId("tt0133093")                                       │
│     └─ если не найден → provider.findByImdbId() → movies.create()     │
│                                                                        │
│  2. Создание связи:                                                    │
│     └→ group_movies.create({ groupId, movieId, status: "tracking" })   │
└────────────────────────────────────────────────────────────────────────┘
```

### Редактирование провайдерского фильма (конвертация в custom)

```
┌────────────────────────────────────────────────────────────────────────┐
│  EDIT & CONVERT                                                       │
│  PATCH /groups/:id/movies/:movieId/edit                               │
│  { title: "Матрица (режиссёрская версия)", overview: "..." }           │
│                                                                        │
│  1. Создаётся custom фильм на основе данных провайдерского:            │
│     └→ custom_movies.create({                                           │
│           groupId, title, posterPath, overview,                         │
│           releaseYear, runtime, status, dates...                         │
│        })                                                              │
│                                                                        │
│  2. Удаляется связь из group_movies:                                   │
│     └→ group_movies.delete(groupId, movieId)                            │
│                                                                        │
│  Результат: провайдерский фильм остаётся в movies,                     │
│  группе теперь принадлежит custom фильм с изменёнными данными           │
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
async searchInGroup(groupId: number, query: string, page = 1) {
  const [providerResults, currentCustom] = await Promise.all([
    // 1. Kinopoisk API
    moviesService.search({ query, page }),

    // 2. Custom фильмы этой группы
    customMoviesService.findByGroup(groupId, query),
  ]);

  return {
    provider: providerResults,   // Результаты из Kinopoisk
    currentGroup: currentCustom,  // Custom этой группы
  };
}
```

### UI отображение результатов поиска

```
Поиск в группе "Избранное": "Matrix"

┌─ Результаты ─────────────────────┐
│ 📦 Kinopoisk                     │
│   └─ Inception                   │
│   └─ The Matrix                  │
│                                  │
│ 📁 Избранное                     │
│   └─ Семейное видео 2024         │
└──────────────────────────────────┘
```

---

## Логика дедупликации (GroupMoviesService)

```typescript
class GroupMoviesService {
  async findOrCreateMovie(dto: AddMovieDto): Promise<Movie> {
    const provider = this.movieProvidersService.getProvider("kinopoisk");

    let movie: Movie | null = null;

    // Priority 1: imdbId (универсальный)
    if (dto.imdbId) {
      movie = await this.moviesRepository.findByImdbId(dto.imdbId);
    }

    // Priority 2: externalId (специфичный для провайдера)
    if (!movie && dto.externalId) {
      movie = await this.moviesRepository.findByExternalId(dto.externalId);
    }

    if (movie) {
      return movie; // Используем существующую копию
    }

    // Не найден локально - импортируем из провайдера
    return this.importMovie(dto, provider);
  }

  private async importMovie(
    dto: AddMovieDto,
    provider: MovieProvider,
  ): Promise<Movie> {
    const details = dto.imdbId
      ? await provider.findByImdbId(dto.imdbId)
      : await provider.getMovieDetails(dto.externalId ?? "");

    const newMovie = provider.mapToNewMovie(details);
    return this.moviesRepository.create(newMovie);
  }
}
```

---

## Логика удаления

### Провайдерский фильм

```typescript
async remove(groupId: number, movieId: number): Promise<void> {
  await this.findOne(groupId, movieId);

  // Удаляем только связь
  await this.groupMoviesRepository.delete(groupId, movieId);

  // Фильм остаётся в таблице movies (может использоваться в других группах)
  this._logger.log(`Movie ${movieId} removed from group ${groupId}`);
}
```

### Кастомный фильм

```typescript
async remove(id: number, groupId: number): Promise<void> {
  await this.findOne(id, groupId);

  // Кастомный фильм удаляется CASCADE вместе с группой
  // Или явно через DELETE FROM custom_movies WHERE id = $1
  await this.customMoviesRepository.delete(id);
  this._logger.log(`Custom movie ${id} deleted`);
}
```

---

## API Endpoints

### Глобальные фильмы (admin только)

| Метод  | Роут             | Описание                                | Guard         |
| ------ | ---------------- | --------------------------------------- | ------------- |
| GET    | `/movies`        | Все провайдерские фильмы (с пагинацией) | Admin         |
| GET    | `/movies/search` | Поиск через Kinopoisk API               | Public        |
| POST   | `/movies`        | Создать фильм по imdbId/externalId      | Admin         |
| GET    | `/movies/:id`    | Детали провайдерского фильма            | Authenticated |
| PATCH  | `/movies/:id`    | Редактировать данные                    | Admin         |
| DELETE | `/movies/:id`    | Удалить фильм                           | Admin         |

### Провайдерские фильмы в группе

| Метод  | Роут                                    | Описание                                | Guard      |
| ------ | --------------------------------------- | --------------------------------------- | ---------- |
| GET    | `/groups/:groupId/movies`               | Список провайдерских фильмов группы     | Members    |
| GET    | `/groups/:groupId/movies/search`        | Поиск в группе (Kinopoisk + custom)     | Members    |
| POST   | `/groups/:groupId/movies`               | Добавить фильм в группу                 | Moderators |
| GET    | `/groups/:groupId/movies/:movieId`      | Детали фильма в группе                  | Members    |
| PATCH  | `/groups/:groupId/movies/:movieId`      | Изменить статус/дату                    | Moderators |
| PATCH  | `/groups/:groupId/movies/:movieId/edit` | Редактировать и конвертировать в custom | Moderators |
| DELETE | `/groups/:groupId/movies/:movieId`      | Удалить из группы                       | Moderators |

### Кастомные фильмы в группе

| Метод  | Роут                                            | Описание              | Guard      |
| ------ | ----------------------------------------------- | --------------------- | ---------- |
| GET    | `/groups/:groupId/custom-movies`                | Список custom фильмов | Members    |
| POST   | `/groups/:groupId/custom-movies`                | Создать custom фильм  | Moderators |
| GET    | `/groups/:groupId/custom-movies/:customMovieId` | Детали custom фильма  | Members    |
| PATCH  | `/groups/:groupId/custom-movies/:customMovieId` | Редактировать         | Moderators |
| DELETE | `/groups/:groupId/custom-movies/:customMovieId` | Удалить               | Moderators |

---

## DTO

### Статусы фильмов

```typescript
enum MovieStatus {
  TRACKING = "tracking", // Отслеживается (по умолчанию)
  PLANNED = "planned", // Запланирован к просмотру
  WATCHED = "watched", // Просмотрен
}
```

### AddMovieDto (добавление провайдерского фильма в группу)

```typescript
{
  // Либо IMDb ID (приоритет)
  imdbId?: string;  // "tt0133093"

  // Либо externalId Kinopoisk
  externalId?: string;  // "301"
}
```

**Валидация:** обязательно должно быть указано либо `imdbId`, либо `externalId`.

### CreateCustomMovieDto (создание кастомного фильма)

```typescript
{
  title: string;
  posterPath?: string;
  overview?: string;
  releaseYear?: number;
  runtime?: number;
  status?: MovieStatus;  // default: 'tracking'
  plannedDate?: string;  // ISO 8601
  watchedDate?: string;  // ISO 8601
}
```

### EditGroupMovieDto (редактирование и конвертация провайдерского фильма)

```typescript
{
  // Данные для редактирования (опционально)
  title?: string;
  posterPath?: string;
  overview?: string;
  releaseYear?: number;
  runtime?: number;

  // Статус и даты (копируются из group_movies если не указаны)
  status?: MovieStatus;
  plannedDate?: string;  // ISO 8601
  watchedDate?: string;  // ISO 8601
}
```

**Примечание:** При вызове `PATCH /groups/:groupId/movies/:movieId/edit` создаётся новый custom фильм, а связь с провайдерским фильмом удаляется.

### GroupMovieUpdateDto (изменение статуса провайдерского фильма)

```typescript
{
  status?: MovieStatus;
  plannedDate?: string;  // ISO 8601
  watchedDate?: string;  // ISO 8601
}
```

**Валидация:** при установке `status='watched'` требуется `watchedDate`, при `status='planned'` требуется `plannedDate`.

---

## Провайдеры

### MovieProvider interface

```typescript
interface MovieProvider {
  readonly name: string;

  search(query: string, page?: number): Promise<ProviderSearchResult>;
  getMovieDetails(externalId: string): Promise<ProviderMovieDetails>;
  findByImdbId(imdbId: string): Promise<ProviderMovieDetails>;
  mapToNewMovie(details: ProviderMovieDetails): NewMovie;
}
```

### Реализации

- **KinopoiskService** — Kinopoisk API (default для всех)

---

## Ограничения

### Custom фильмы

- **Нет переноса между группами** — кастомный фильм принадлежит только одной группе
- **CASCADE удаление** — при удалении группы удаляются все её custom фильмы

### Провайдерские фильмы

- **Snapshot подход** — данные не обновляются после импорта
- **Переиспользование** — один фильм может быть в нескольких группах
- **Безопасное удаление** — удаление из группы не удаляет фильм из БД
- **Редактирование через конвертацию** — для редактирования провайдерский фильм конвертируется в custom
