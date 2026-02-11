# Movies API - План реализации

## Обзор

План поэтапной реализации API для работы с фильмами в соответствии с MVP требованиями из `docs/product-roadmap.md`.

## Текущее состояние

- ✅ Модуль auth (JWT, регистрация, вход)
- ✅ Модуль user (CRUD, роли USER/ADMIN)
- ✅ Базовая схема БД (users, movies-placeholder)
- ✅ Guards (AuthGuard, RolesGuard, AuthorGuard, CsrfGuard)
- ✅ Rate limiting tiers (short, medium, long)

---

## Этап 1: Расширение схемы movies

### Файлы для создания/изменения

**`apps/api/src/db/schemas/movies.ts`** - расширение схемы

```typescript
// Новые поля:
- posterPath: varchar(512)       // Путь к постеру в TMDB
- overview: text                  // Описание фильма
- releaseDate: date               // Дата выхода
- rating: decimal(3,1)            // Рейтинг TMDB
- genres: jsonb                   // Массив жанров
- runtime: integer                // Длительность в минутах
```

**`apps/api/src/db/schemas/groups.ts`** - новая схема

```typescript
export const groups = pgTable("groups", {
  id: serial().primaryKey(),
  name: varchar(256).notNull(),
  description: text(),
  avatarUrl: varchar(512),
  ownerId: integer()
    .references(() => users.id)
    .notNull(),
  ...timestamps,
});
```

**`apps/api/src/db/schemas/group-members.ts`** - новая схема

```typescript
export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "admin",
  "moderator",
  "member",
]);

export const groupMembers = pgTable("group_members", {
  id: serial().primaryKey(),
  groupId: integer()
    .references(() => groups.id)
    .notNull(),
  userId: integer()
    .references(() => users.id)
    .notNull(),
  role: groupMemberRoleEnum("role").notNull().default("member"),
  ...timestamps,
});
// UNIQUE(groupId, userId)
```

**`apps/api/src/db/schemas/group-movies.ts`** - новая схема

```typescript
export const groupMovieStatusEnum = pgEnum("group_movie_status", [
  "tracking",
  "planned",
  "watched",
]);

export const groupMovies = pgTable("group_movies", {
  id: serial().primaryKey(),
  groupId: integer()
    .references(() => groups.id)
    .notNull(),
  movieId: integer()
    .references(() => movies.id)
    .notNull(),
  addedBy: integer()
    .references(() => users.id)
    .notNull(),
  status: groupMovieStatusEnum("status").notNull().default("tracking"),
  plannedDate: timestamp(),
  watchedDate: timestamp(),
  ...timestamps,
});
// UNIQUE(groupId, movieId)
```

**`apps/api/src/db/schemas/index.ts`** - обновление экспортов

---

## Этап 2: Модуль movies

### Структура модуля

```
apps/api/src/movies/
├── movies.module.ts
├── movies.controller.ts
├── movies.service.ts
├── movies.repository.ts
├── tmdb.service.ts
├── dto/
│   ├── index.ts
│   ├── movie-search.dto.ts
│   ├── movie-create.dto.ts
│   ├── movie-response.dto.ts
│   └── movie-update.dto.ts
├── movies.controller.spec.ts
└── movies.service.spec.ts
```

### movies.controller.ts

Роуты:

| Метод  | Роут             | Описание                         | Guard         |
| ------ | ---------------- | -------------------------------- | ------------- |
| GET    | `/movies/search` | Поиск фильмов через TMDB API     | @Public()     |
| GET    | `/movies/:id`    | Получить фильм по ID (локальный) | AuthGuard     |
| POST   | `/movies`        | Создать фильм (из TMDB)          | @Roles(ADMIN) |
| PATCH  | `/movies/:id`    | Обновить фильм                   | @Roles(ADMIN) |
| DELETE | `/movies/:id`    | Удалить фильм                    | @Roles(ADMIN) |

### movies.service.ts

Методы:

```typescript
class MoviesService {
  // Поиск в TMDB
  searchByTitle(query: string, page?: number): Promise<TmdbSearchResponse>;

  // Получение деталей из TMDB
  fetchFromTmdb(externalId: string): Promise<TmdbMovieDetails>;

  // Создание фильма (с проверкой на дубликаты по externalId)
  createFromTmdb(externalId: string): Promise<Movie>;

  // CRUD операции
  findOne(id: number): Promise<Movie>;
  findAll(opts?: PaginationOptions): Promise<Movie[]>;
  update(id: number, dto: MovieUpdateDto): Promise<Movie>;
  remove(id: number): Promise<void>;

  // Проверка существования
  findByExternalId(externalId: string): Promise<Movie | null>;
}
```

### tmdb.service.ts

Сервис для работы с TMDB API:

```typescript
class TmdbService {
  private readonly baseUrl = "https://api.themoviedb.org/3";

  // Конфигурация через ConfigService
  // TMDB_API_KEY из env

  searchMovies(query: string, page?: number): Promise<TmdbSearchResponse>;
  getMovieDetails(id: string): Promise<TmdbMovieDetails>;
  getMoviePosterUrl(path: string): string;
}
```

### movies.repository.ts

Работа с БД:

```typescript
class MoviesRepository {
  create(data: NewMovie): Promise<Movie>;
  findById(id: number): Promise<Movie | null>;
  findByExternalId(externalId: string): Promise<Movie | null>;
  findAll(limit?, offset?): Promise<Movie[]>;
  update(id: number, data: Partial<NewMovie>): Promise<Movie>;
  delete(id: number): Promise<void>;
}
```

### DTO

**movie-search.dto.ts**

```typescript
class MovieSearchDto {
  @IsNotEmpty()
  @MinLength(2)
  query: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  page?: number = 1;
}
```

**movie-create.dto.ts**

```typescript
class MovieCreateDto {
  @IsNotEmpty()
  externalId: string; // TMDB ID
}
```

**movie-response.dto.ts**

```typescript
class MovieResponseDto {
  id: number;
  externalId: string;
  title: string;
  posterPath: string | null;
  overview: string | null;
  releaseDate: Date | null;
  rating: number | null;
  genres: Record<string, unknown>[] | null;
  runtime: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Этап 3: Модуль groups

### Структура модуля

```
apps/api/src/groups/
├── groups.module.ts
├── groups.controller.ts
├── groups.service.ts
├── groups.repository.ts
├── dto/
│   ├── index.ts
│   ├── group-create.dto.ts
│   ├── group-response.dto.ts
│   └── group-update.dto.ts
├── groups.controller.spec.ts
└── groups.service.spec.ts
```

### groups.controller.ts

Роуты (MVP - упрощённые):

| Метод  | Роут                  | Описание                  | Guard       |
| ------ | --------------------- | ------------------------- | ----------- |
| GET    | `/groups`             | Список групп пользователя | AuthGuard   |
| GET    | `/groups/:id`         | Получить группу           | AuthorGuard |
| POST   | `/groups`             | Создать группу            | AuthGuard   |
| PATCH  | `/groups/:id`         | Обновить группу           | AuthorGuard |
| DELETE | `/groups/:id`         | Удалить группу            | AuthorGuard |
| GET    | `/groups/:id/members` | Участники группы          | RolesGuard  |

### groups.service.ts

```typescript
class GroupsService {
  // Создание группы (юзер становится owner)
  create(userId: number, dto: GroupCreateDto): Promise<Group>;

  // Получение групп пользователя
  findUserGroups(userId: number): Promise<Group[]>;

  // Получение группы с проверкой прав
  findOne(id: number, userId: number): Promise<Group>;

  // Обновление (только owner/admin группы)
  update(id: number, userId: number, dto: GroupUpdateDto): Promise<Group>;

  // Удаление (только owner)
  remove(id: number, userId: number): Promise<void>;

  // Управление участниками
  addMember(
    groupId: number,
    userId: number,
    role?: GroupMemberRole,
  ): Promise<void>;
  removeMember(
    groupId: number,
    userId: number,
    requesterId: number,
  ): Promise<void>;
  updateMemberRole(
    groupId: number,
    userId: number,
    role: GroupMemberRole,
  ): Promise<void>;

  // Проверка прав
  isMember(groupId: number, userId: number): Promise<boolean>;
  isAdmin(groupId: number, userId: number): Promise<boolean>;
  isOwner(groupId: number, userId: number): Promise<boolean>;
}
```

---

## Этап 4: Модуль group-movies

### Структура модуля

```
apps/api/src/group-movies/
├── group-movies.module.ts
├── group-movies.controller.ts
├── group-movies.service.ts
├── group-movies.repository.ts
├── dto/
│   ├── index.ts
│   ├── group-movie-create.dto.ts
│   ├── group-movie-update.dto.ts
│   ├── group-movie-response.dto.ts
│   └── group-movie-filter.dto.ts
└── ...
```

### group-movies.controller.ts

| Метод  | Роут                      | Описание                    | Guard        |
| ------ | ------------------------- | --------------------------- | ------------ |
| GET    | `/groups/:id/movies`      | Фильмы группы (с фильтрами) | @Member()    |
| POST   | `/groups/:id/movies`      | Добавить фильм в группу     | @Moderator() |
| GET    | `/groups/:id/movies/:mid` | Детали фильма в группе      | @Member()    |
| PATCH  | `/groups/:id/movies/:mid` | Изменить статус/дату        | @Moderator() |
| DELETE | `/groups/:id/movies/:mid` | Удалить фильм из группы     | @Moderator() |

### group-movies.service.ts

```typescript
class GroupMoviesService {
  // Добавление фильма в группу
  addMovie(
    groupId: number,
    movieId: number,
    addedBy: number,
  ): Promise<GroupMovie>;

  // Получение фильмов группы с фильтрами
  findGroupMovies(
    groupId: number,
    filters?: { status?: GroupMovieStatus; sortBy?: string },
  ): Promise<GroupMovieWithDetails[]>;

  // Получение конкретного фильма
  findOne(groupId: number, movieId: number): Promise<GroupMovieWithDetails>;

  // Изменение статуса
  updateStatus(
    groupId: number,
    movieId: number,
    status: GroupMovieStatus,
    plannedDate?: Date,
  ): Promise<GroupMovie>;

  // Отметка как просмотренного
  markAsWatched(
    groupId: number,
    movieId: number,
    watchedDate?: Date,
  ): Promise<GroupMovie>;

  // Удаление из группы
  remove(groupId: number, movieId: number): Promise<void>;

  // Проверки прав
  canModerate(groupId: number, userId: number): Promise<boolean>;
  isMember(groupId: number, userId: number): Promise<boolean>;
}
```

### DTO

**group-movie-filter.dto.ts**

```typescript
class GroupMovieFilterDto {
  @IsOptional()
  @IsEnum(GroupMovieStatus)
  status?: GroupMovieStatus;

  @IsOptional()
  @IsEnum(["addedAt", "plannedDate", "watchedDate", "rating"])
  sortBy?: string = "addedAt";

  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
```

**group-movie-update.dto.ts**

```typescript
class GroupMovieUpdateDto {
  @IsOptional()
  @IsEnum(GroupMovieStatus)
  status?: GroupMovieStatus;

  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @IsOptional()
  @IsDateString()
  watchedDate?: string;
}
```

---

## Этап 5: Новые Guards и Decorators

### `$common/decorators/roles.decorator.ts` - расширение

```typescript
// Добавить новые декораторы
export const Member = () => SetMetadata("isGroupMember", true);
export const Moderator = () => SetMetadata("isGroupModerator", true);
```

### `$common/guards/group-member.guard.ts`

```typescript
@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(private groupsService: GroupsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Проверка: является ли пользователь членом группы
  }
}
```

### `$common/guards/group-moderator.guard.ts`

```typescript
@Injectable()
export class GroupModeratorGuard implements CanActivate {
  constructor(private groupsService: GroupsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Проверка: является ли пользователь админом или модератором группы
  }
}
```

---

## Этап 6: Миграции БД

### Команды

```bash
cd apps/api
pnpm run db:generate  # Генерация миграции
pnpm run db:migrate   # Применение миграции
```

### Порядок миграций

1. `001_add_groups.ts` - таблицы groups, group_members
2. `002_add_group_movies.ts` - таблица group_movies
3. `003_extend_movies.ts` - новые поля в movies

---

## Этап 7: Регистрация модулей

### `apps/api/src/app.module.ts`

```typescript
@Module({
  imports: [
    // ... существующие
    MoviesModule,
    GroupsModule,
    GroupMoviesModule,
  ],
  // ...
})
```

---

## Валидация

### Тестирование вручную

1. **Создать тестового пользователя** (если нет)

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123!"}'
```

2. **Получить токен**

```bash
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}' \
  | jq -r '.accessToken')
```

3. **Создать группу**

```bash
curl -X POST http://localhost:8080/api/v1/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Movie Group","description":"Test group"}'
```

4. **Поиск фильма в TMDB**

```bash
curl "http://localhost:8080/api/v1/movies/search?query=matrix&page=1"
```

5. **Добавить фильм в группу**

```bash
curl -X POST http://localhost:8080/api/v1/groups/1/movies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"externalId":"603"}'  # The Matrix TMDB ID
```

6. **Изменить статус фильма**

```bash
curl -X PATCH http://localhost:8080/api/v1/groups/1/movies/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"planned","plannedDate":"2026-02-10T19:00:00Z"}'
```

### Swagger

- Доступен на `http://localhost:8080/api/docs` (в dev)
- Проверить все эндпоинты через UI

---

## Зависимости модулей

```
MoviesModule
  └── нет зависимостей (только DbModule)

GroupsModule
  └── UserModule (для получения owner)

GroupMoviesModule
  ├── MoviesModule
  └── GroupsModule
```

---

## Переменные окружения

Добавить в `.env`:

```bash
# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

---

## Порядок реализации

1. **Этап 1**: Расширение схем БД + миграции
2. **Этап 2**: MoviesModule (поиск TMDB, CRUD)
3. **Этап 3**: GroupsModule (базовые группы)
4. **Этап 4**: GroupMoviesModule (связь групп и фильмов)
5. **Этап 5**: Guards и Decorators для групп
6. **Этап 6**: Тестирование

---

## Примечания

- Для MVP одна группа будет захардкожена - можно добавить `DEFAULT_GROUP_ID` в env
- Все даты хранить в UTC
- TMDB API имеет лимиты - добавить rate limiting
- Постеры не хранить локально - использовать URL от TMDB
- Жанры хранить как jsonb для гибкости
