# Архитектура apiV2

Версия: 1.1.0

---

## Принципы

- **Вертикальные модули** — каждый feature изолирован со своими слоями.
- **Прагматичная чистая архитектура** — domain не знает про NestJS/HTTP/ORM, но не гонимся за enterprise-бойлерплейтом.
- **Dependency Rule** — domain → application → infrastructure. Внутренние слои не зависят от внешних.
- **Один DTO-слой** — Swagger + Zod в одном месте, без дублирования application DTO.
- **Domain exceptions** — вместо `Result<T, E>`. Читаемость выше, проще в TypeScript.
- **Верхний уровень модуля** — controller, facade, module, dto. Знакомая NestJS-структура, но с чистыми границами внутри.

---

## Топ-левел структура

```
src/
  main.ts              # bootstrap + глобальные перехватчики
  app.module.ts        # композиция корневого модуля

  modules/             # Бизнес-модули (вертикальные срезы)
    <feature>/
      domain/            # Entities, VO, errors, events — zero deps
      application/
        ports/           # outgoing interfaces (repo, cache, bus)
        use-cases/       # 1 класс = 1 операция
      infrastructure/
        persistence/     # repo impl
        acl/             # anti-corruption для других модулей/API
        guards/          # feature-specific guards
        listeners/       # domain event listeners
        mappers/         # ORM row ↔ entity (только если нужен)
      dto/               # request/response DTO (class + @ApiProperty + zod)
      <feature>.controller.ts
      <feature>.facade.ts
      <feature>.module.ts

  infra/               # Инфраструктурные NestJS-модули (side-effects)
    app-config/
    db/
    redis/
    logger/
    cache/
    throttling/
    health/
    exceptions/          # Global exception filter + domain→HTTP mapper
    guards/              # Global guards (auth, roles, throttler, csrf)
    validation/          # ZodValidationPipe, decorators

  shared/              # Чистый shared код (zero deps)
    domain/              # Base types, primitives (UserId, Email, etc.)
    schemas/             # Shared zod schemas
    types/               # Utility types
```

---

## Path aliases

```json
{
  "paths": {
    "$modules/*": ["./src/modules/*"],
    "$shared/*": ["./src/shared/*"],
    "$infra/*": ["./src/infra/*"]
  }
}
```

Модули внутри `src/modules/` используют относительные импорты внутри одного feature или алиасы `$shared/` / `$infra/`. Для импорта между модулями — `$modules/<feature>/...`.

---

## Правила зависимостей

```
shared/         ← ничего не импортирует из проекта
   ↑
modules/*/domain/ ← может импортировать shared/
   ↑
modules/*/application/ ← может импортировать domain/, shared/
   ↑
modules/*/infrastructure/ ← может импортировать application/, domain/, shared/
   ↑
modules/*/dto/  ← может импортировать shared/schemas/
   ↑
controller.ts   ← facade, dto, infra/validation (pipe)
   ↑
facade.ts       ← application/use-cases
   ↑
module.ts       ← всё
   ↑
infra/          ← может импортировать всё, кроме modules/*/infrastructure/
```

**Запрещено:**

- `modules/*/domain/` импортирует `infra/`, `modules/*/infrastructure/`, `@nestjs/*`
- `modules/*/application/` импортирует `infra/`
- `shared/` импортирует что-либо из проекта

---

## Domain (чистый TypeScript)

```typescript
// modules/user/domain/entities/user.entity.ts
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';

export class User {
  private constructor(
    readonly id: UserId,
    readonly email: Email,
    readonly name: string,
  ) {}

  static create(email: Email, name: string): User {
    if (!name?.trim()) throw new Error('Name required');
    return new User(UserId.generate(), email, name);
  }
}
```

```typescript
// modules/user/domain/errors/user-not-found.error.ts
export class UserNotFoundError extends Error {
  constructor(readonly userId: string) {
    super(`User ${userId} not found`);
  }
}
```

**Контроль:** ни один файл в `domain/` не импортирует `@nestjs/*`, `zod`, `drizzle-orm`.

---

## Application: Use-Cases + Ports

### Ports (интерфейсы)

```typescript
// modules/user/application/ports/user-repository.port.ts
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id';
import { Email } from '../../domain/value-objects/email';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

### Use-Case

```typescript
// modules/user/application/use-cases/create-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { IUserRepository } from '../ports/user-repository.port';

export const USER_REPO = Symbol('USER_REPO');

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USER_REPO) private readonly repo: IUserRepository) {}

  async execute(input: { email: string; name: string }): Promise<User> {
    const email = Email.create(input.email);
    const exists = await this.repo.findByEmail(email);
    if (exists) throw new UserAlreadyExistsError(email.value);

    const user = User.create(email, input.name);
    await this.repo.save(user);
    return user;
  }
}
```

**Важно:** `@Injectable()` + `@Inject()` допустимы в application, но только для DI. Никакого `@nestjs/swagger`, `ConfigService`, `HttpService`.

**Тестируемость:**

```typescript
const useCase = new CreateUserUseCase(fakeRepo); // zero NestJS
```

---

## Facade — published API модуля

```typescript
// modules/user/user.facade.ts
import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';

@Injectable()
export class UserFacade {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
  ) {}

  async create(input: { email: string; name: string }) {
    return this.createUser.execute(input);
  }

  async getById(id: string) {
    return this.getUser.execute(id);
  }
}
```

**Где используется:**

- Внутри модуля: `UserController → UserFacade → UseCase`
- Снаружи: другие модули импортируют только `UserFacade`

**Чего не делает:** не содержит бизнес-логики (не должно быть `if` с инвариантами), не знает про HTTP.

---

## Controller + DTO (верхний уровень модуля)

Подробнее о флоу DTO и Swagger — [`dto-flow.md`](./dto-flow.md).

### DTO

```typescript
// modules/user/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}
```

```typescript
// modules/user/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  static fromEntity(user: User): UserResponseDto {
    return { id: user.id.value, email: user.email.value, name: user.name };
  }
}
```

### Controller

```typescript
// modules/user/user.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserFacade } from './user.facade';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly facade: UserFacade) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto,
  ) {
    const user = await this.facade.create(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('id') id: string) {
    const user = await this.facade.getById(id);
    return UserResponseDto.fromEntity(user);
  }
}
```

**Правило:** Swagger + Zod только в `dto/` и controller. Application/use-case работает с plain objects.

---

## Модуль (компоновка)

```typescript
// modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserFacade } from './user.facade';
import { UserController } from './user.controller';
import {
  CreateUserUseCase,
  USER_REPO,
} from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository';

@Module({
  providers: [
    { provide: USER_REPO, useClass: DrizzleUserRepository },
    CreateUserUseCase,
    GetUserUseCase,
    UserFacade,
  ],
  controllers: [UserController],
  exports: [UserFacade],
})
export class UserModule {}
```

**Swap-реализация для тестов:**

```typescript
UserModule.forRoot({ repository: InMemoryUserRepository }); // Dynamic Module
```

---

## Ошибки

Подробнее в [`error-handling.md`](./error-handling.md).

Кратко: domain кидает `extends Error`, controller ничего не знает про ошибки, exception filter в `infra/exceptions/` ловит и мапит в HTTP. Никаких `HttpException` вне filter.

---

## Связь модулей

### Способ A: Facade (синхронный, строгий)

```typescript
// modules/task/infrastructure/acl/user-checker.adapter.ts
import { Injectable } from '@nestjs/common';
import { IUserChecker } from '../../application/ports/user-checker.port';
import { UserFacade } from '../../../user/user.facade';

@Injectable()
export class UserCheckerAdapter implements IUserChecker {
  constructor(private readonly userFacade: UserFacade) {}

  async userExists(id: string): Promise<boolean> {
    try {
      await this.userFacade.getById(id);
      return true;
    } catch (e) {
      if (e instanceof UserNotFoundError) return false;
      throw e;
    }
  }
}
```

```typescript
// modules/task/task.module.ts
@Module({
  imports: [UserModule], // получаем UserFacade
  providers: [
    { provide: USER_CHECKER, useClass: UserCheckerAdapter },
    // ...
  ],
})
export class TaskModule {}
```

### Способ B: Domain Events (асинхронный, слабый)

```typescript
// modules/user/domain/events/user-created.event.ts
export class UserCreatedEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
  ) {}
}
```

```typescript
// modules/task/infrastructure/listeners/user-created.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../../user/domain/events/user-created.event';
import { TaskFacade } from '../../task.facade';

@Injectable()
export class UserCreatedListener {
  constructor(private readonly taskFacade: TaskFacade) {}

  @OnEvent('user.created')
  async handle(event: UserCreatedEvent) {
    await this.taskFacade.createWelcomeTask(event.userId);
  }
}
```

**Рекомендация:** facade для обязательных инвариантов, events для сайд-эффектов.

---

## Интеграция Swagger + Zod

### ZodValidationPipe

```typescript
// infra/validation/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return parsed.data;
  }
}
```

### Использование

```typescript
@Post()
async create(
  @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto,
) {
  return this.facade.create(dto);
}
```

**Правило:** Zod schema — единый источник правды для валидации. Swagger-декораторы (`@ApiProperty`) дублируют для документации. Если критично избежать дублирования — можно рассмотреть `@anatine/zod-nestjs` позже.

---

## Где что хранится

| Что                 | Где                                     | Почему                            |
| ------------------- | --------------------------------------- | --------------------------------- |
| Domain entities, VO | `modules/*/domain/`                     | Чистый код, zero deps             |
| Domain errors       | `modules/*/domain/errors/`              | Без HTTP-специфики                |
| Use-cases           | `modules/*/application/use-cases/`      | Оркестрация domain                |
| Ports               | `modules/*/application/ports/`          | Контракты для infra               |
| Facade              | `modules/*/<feature>.facade.ts`         | Published API                     |
| Controller          | `modules/*/<feature>.controller.ts`     | HTTP layer, рядом с facade        |
| DTO                 | `modules/*/dto/`                        | Контракт HTTP, рядом с controller |
| Repositories (impl) | `modules/*/infrastructure/persistence/` | ORM/Drizzle                       |
| Module guards       | `modules/*/infrastructure/guards/`      | Специфично для feature            |
| Event listeners     | `modules/*/infrastructure/listeners/`   | Слабая связь                      |
| ACL-адаптеры        | `modules/*/infrastructure/acl/`         | Межмодульная связь                |
| Global guards       | `infra/guards/`                         | Переиспользуемые                  |
| Exception filter    | `infra/exceptions/`                     | Централизованный маппинг          |
| Shared primitives   | `shared/domain/`, `shared/schemas/`     | Email, UUID и т.д.                |
| Config, DB, Redis   | `infra/*/`                              | Side-effects                      |
| Health              | `infra/health/`                         | Не бизнес-логика                  |

---

## Флоу добавления нового модуля

### Шаг 0: Bounded context

Даём имя существительное в единственном числе: `group`, `movie`, `review`. Создаём `src/modules/{name}/`.

### Шаг 1: Domain

- `value-objects/` — immutable типы с валидацией
- `entities/` — rich models (`create()`, `update()`)
- `events/` — domain events (если нужны)
- `errors/` — специфичные ошибки

**Контроль:** ни одного импорта из `@nestjs/*`, `zod` (кроме VO), `drizzle-orm`.

### Шаг 2: Application

- `ports/` — интерфейсы: `I{Name}Repository`, `ICache`, `IBus`
- `use-cases/` — `@Injectable()`, `@Inject(TOKEN)`, 1 класс = 1 операция

### Шаг 3: Facade

`{name}.facade.ts` — инжектит все use-cases, предоставляет методы наружу.

### Шаг 4: DTO + Controller

- `dto/` — class + `@ApiProperty` + zod schema
- `{name}.controller.ts` — NestJS controller, зовёт facade

### Шаг 5: Infrastructure

- `persistence/` — repo impl (начинаем с `InMemory`, потом `Drizzle`)
- `guards/` — если нужны feature-specific
- `acl/` — если модуль зависит от другого
- `listeners/` — если слушаем события других модулей

### Шаг 6: Module

`{name}.module.ts` — wiring токенов, use-cases, facade, controller.

### Шаг 7: Корень

Импортируем `{Name}Module` в `AppModule`. Добавляем domain errors в `infra/exceptions/error-map.ts`.

### Шаг 8: Тесты

- **Domain:** чистые unit (`new Entity(...)`)
- **Use-case:** интеграция с in-memory адаптерами (`new UseCase(fakeRepo)`)
- **Controller:** e2e с `supertest`

---

## Миграция текущего кода

| Сейчас                        | Куда                                         |
| ----------------------------- | -------------------------------------------- |
| `src/health/`                 | `src/infra/health/`                          |
| `src/common/app-config/`      | `src/infra/app-config/`                      |
| `src/common/security/`        | `src/infra/security/`                        |
| `src/common/` (всё остальное) | `src/shared/` или `src/infra/` по назначению |

После миграции `src/common/` удаляется. Path alias `$common/` → `$shared/` + `$infra/`.

---

## Чек-лист нового модуля

- [ ] Domain без внешних зависимостей
- [ ] Application use-case `@Injectable()` с `@Inject(TOKEN)`
- [ ] Port (interface) для каждой внешней зависимости
- [ ] Facade маршрутизирует вызовы
- [ ] Controller + DTO (Swagger + zod) на верхнем уровне
- [ ] Infrastructure: repo impl (+ mapper если нужен)
- [ ] Domain errors добавлены в `infra/exceptions/error-map.ts`
- [ ] Модуль зарегистрирован в `AppModule`
- [ ] Нет импортов из `infra/` в `domain/` / `application/`
