# Movies Architecture

## Обзор

Архитектура модуля работы с фильмами использует **единую таблицу** `group_movies` для хранения двух типов контента:

1. **Провайдерские фильмы** (`source='provider'`) — данные копируются из Kinopoisk при добавлении в группу (snapshot подход)
2. **Кастомные фильмы** (`source='custom'`) — создаются пользователями вручную

## Ключевые решения

| Решение                     | Значение                                             |
| --------------------------- | ---------------------------------------------------- |
| Обновление при дедупликации | **Никогда** - используем существующую копию как есть |
| Дедупликация                | **imdbId приоритет**, затем `externalId`             |
| Редактирование              | Прямое редактирование полей в `group_movies`         |
| Удаление                    | **CASCADE** с группой                                |
| Поиск                       | **Параллельный**: Kinopoisk + фильмы текущей группы  |

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

### group_movies (Unified — все фильмы в группе)

Единая таблица для provider и custom фильмов.

```sql
group_movies
  id                  serial PRIMARY KEY
  groupId             integer REFERENCES groups(id) ON DELETE CASCADE
  source              enum('provider', 'custom') NOT NULL DEFAULT 'provider'
  movieId             integer REFERENCES movies(id) ON DELETE SET NULL  -- NULL для custom
  title               varchar(255) NOT NULL
  posterPath          varchar(512)
  overview            text
  releaseYear         integer
  runtime             integer
  rating              decimal(3,1)
  status              enum('tracking', 'planned', 'watched') DEFAULT 'tracking'
  plannedDate         timestamp
  watchedDate         timestamp
  addedBy             integer REFERENCES users(id) ON DELETE RESTRICT
  createdAt           timestamp
  updatedAt           timestamp

Indexes:
  - group_id_idx
  - movie_id_idx

UNIQUE(groupId, movieId)  -- только для provider фильмов (movieId NOT NULL)
```

**Различия по source:**

| Поле        | provider                    | custom         |
| ----------- | --------------------------- | -------------- |
| movieId     | NOT NULL (ссылка на movies) | NULL           |
| rating      | Копируется из movies        | NULL           |
| Данные      | Копия snapshot из movies    | Введены юзером |

---

## Flow добавления фильма в группу

### Провайдерский фильм

```
┌────────────────────────────────────────────────────────────────────────┐
│  SEARCH                                                                │
│  User/Admin → GET /groups/:id/movies/search?query=matrix              │
│  → { provider: [...], currentGroup: [...] }                           │
└────────────────────────────────────────────────────────────────────────┘
                              ↓ user selects provider movie
┌────────────────────────────────────────────────────────────────────────┐
│  ADD TO GROUP                                                          │
│  POST /groups/:id/movies                                               │
│  { imdbId: "tt0133093" }                                               │
│                                                                        │
│  1. GroupMoviesService.findOrCreateMovie():                            │
│     ├─ findByImdbId("tt0133093")                                       │
│     └─ если не найден → provider.findByImdbId() → movies.create()     │
│                                                                        │
│  2. Создание записи со snapshot данных:                                │
│     └→ group_movies.create({                                           │
│           groupId, source: 'provider', movieId,                        │
│           title, posterPath, overview, releaseYear, runtime, rating,   │
│           status: "tracking", addedBy                                  │
│        })                                                              │
└────────────────────────────────────────────────────────────────────────┘
```

### Кастомный фильм

```
┌────────────────────────────────────────────────────────────────────────┐
│  CREATE CUSTOM                                                         │
│  POST /groups/:id/movies/custom                                        │
│  { title: "Мой фильм", overview: "...", ... }                          │
│                                                                        │
│  → group_movies.create({                                               │
│       groupId, source: 'custom', movieId: null,                        │
│       title, posterPath, overview, releaseYear, runtime,               │
│       rating: null, status, addedBy                                    │
│    })                                                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Редактирование фильма

```
┌────────────────────────────────────────────────────────────────────────┐
│  UPDATE                                                                │
│  PATCH /groups/:id/movies/:id                                          │
│  { title: "Новое название", status: "watched", watchedDate: "..." }   │
│                                                                        │
│  → group_movies.update({ title, status, watchedDate })                 │
│                                                                        │
│  Работает одинаково для provider и custom фильмов                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Поиск в контексте группы

```typescript
async searchInGroup(groupId: number, query: string, page = 1) {
  const [providerResults, groupMovies] = await Promise.all([
    // 1. Kinopoisk API
    moviesService.search({ query, page }),

    // 2. Фильмы этой группы (provider + custom)
    groupMoviesService.findByGroup(groupId, undefined, query),
  ]);

  return {
    provider: providerResults,   // Результаты из Kinopoisk
    currentGroup: groupMovies,   // Фильмы этой группы
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
│ 📁 Избранное (уже в группе)      │
│   └─ The Matrix (provider)       │
│   └─ Семейное видео 2024 (custom)│
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

```typescript
async remove(groupId: number, id: number): Promise<void> {
  await this._findOneOrThrow(groupId, id);
  await this.groupMoviesRepository.delete(groupId, id);

  // Для provider: movieId остаётся в таблице movies (переиспользование)
  // Для custom: просто удаляется запись
  this._logger.log(`Movie ${id} removed from group ${groupId}`);
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

### Фильмы в группе (unified)

| Метод  | Роут                                 | Описание                         | Guard      |
| ------ | ------------------------------------ | -------------------------------- | ---------- |
| GET    | `/groups/:groupId/movies`            | Список всех фильмов группы      | Members    |
| GET    | `/groups/:groupId/movies/search`     | Поиск (Kinopoisk + группа)      | Members    |
| POST   | `/groups/:groupId/movies`            | Добавить provider фильм         | Moderators |
| POST   | `/groups/:groupId/movies/custom`     | Создать custom фильм            | Moderators |
| GET    | `/groups/:groupId/movies/:id`        | Детали фильма                   | Members    |
| PATCH  | `/groups/:groupId/movies/:id`        | Изменить статус/данные          | Moderators |
| DELETE | `/groups/:groupId/movies/:id`        | Удалить из группы               | Moderators |

---

## DTO

### Статусы фильмов

```typescript
enum GroupMovieStatus {
  TRACKING = "tracking", // Отслеживается (по умолчанию)
  PLANNED = "planned",   // Запланирован к просмотру
  WATCHED = "watched",   // Просмотрен
}
```

**Правила валидации:**
- `tracking` — даты не требуются и не допускаются
- `planned` — требуется `plannedDate`
- `watched` — требуется `watchedDate`

### AddMovieDto (добавление провайдерского фильма)

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
  status?: GroupMovieStatus;  // default: 'tracking'
  plannedDate?: string;       // ISO 8601, требуется если status='planned'
  watchedDate?: string;       // ISO 8601, требуется если status='watched'
}
```

### GroupMovieUpdateDto (изменение статуса и данных)

```typescript
{
  // Статус и даты
  status?: GroupMovieStatus;
  plannedDate?: string;   // ISO 8601
  watchedDate?: string;   // ISO 8601

  // Данные фильма (для редактирования)
  title?: string;
  posterPath?: string;
  overview?: string;
  releaseYear?: number;
  runtime?: number;
}
```

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

### Общие

- **CASCADE удаление** — при удалении группы удаляются все её фильмы
- **Snapshot подход** — данные provider фильмов не обновляются после копирования
- **Прямое редактирование** — любые поля можно изменить через PATCH

### Provider фильмы

- **Переиспользование movies** — один фильм может быть в нескольких группах
- **Unique constraint** — (groupId, movieId) предотвращает дубликаты
- **Безопасное удаление** — удаление из группы не удаляет фильм из таблицы movies

### Custom фильмы

- **movieId = NULL** — не связаны с таблицей movies
- **rating = NULL** — рейтинг недоступен для custom фильмов
