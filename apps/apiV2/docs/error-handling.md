# Обработка ошибок

## Принципы

- **Никакого Result-pattern.** Domain не возвращает ошибки как данные, а кидает исключения.
- **Domain errors не знают про HTTP.** `UserNotFoundError` не содержит `statusCode`.
- **Controller ничего не знает про ошибки.** Ни `try/catch`, ни `throw new NotFoundException()`.
- **Exception Filter — единая точка.** Все domain errors ловятся, мапятся в HTTP и форматируются в JSON.
- **Каждая ошибка — отдельный класс.** Для `instanceof` type narrowing.
- **Никаких `HttpException` вне filter.** Ни в domain, ни в application, ни в controller, ни в инфраструктурных сервисах.

---

## Поток ошибки

```
Domain:      throw new UserNotFoundError()
  ↓
Application: пробрасывает (или throw new своя DomainError)
  ↓
Controller:  пробрасывает (никаких try/catch)
  ↓
Filter:      ловит → мапит в HTTP → JSON
```

---

## Domain Error

```typescript
// modules/user/domain/errors/user-not-found.error.ts
export class UserNotFoundError extends Error {
  constructor(readonly userId: string) {
    super(`User ${userId} not found`);
  }
}
```

**Правила:**

- Наследуется от `Error` (или от базового `DomainError`, если нужен общий тип)
- Не содержит HTTP-специфики (`statusCode`, `response`)
- Хранит контекст (`userId`, `groupId`) для сообщений и логов
- Каждая ошибка — отдельный класс для `instanceof` в filter

**Антипаттерны:**

```typescript
// ❌ Domain не знает про HTTP
export class UserNotFoundError extends Error {
  readonly statusCode = 404;
}

// ❌ Не делаем Result-pattern
return Result.err(new UserNotFoundError(id));

// ❌ Не используем enum/string codes вместо классов
new DomainError('USER_NOT_FOUND', '...');

// ❌ Не наследуемся от HttpException
export class UserNotFoundError extends NotFoundException {}
```

---

## Use-Case

```typescript
// modules/user/application/use-cases/get-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { IUserRepository } from '../ports/user-repository.port';

export const USER_REPO = Symbol('USER_REPO');

@Injectable()
export class GetUserUseCase {
  constructor(@Inject(USER_REPO) private readonly repo: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
}
```

**Правило:** use-case кидает domain error. Не ловит, не оборачивает, не мапит в HTTP.

---

## Controller

```typescript
// modules/user/user.controller.ts
@Get(':id')
@ApiResponse({ status: 200, type: UserResponseDto })
@ApiResponse({ status: 404, description: 'User not found' })
async getById(@Param('id') id: string): Promise<UserResponseDto> {
  const user = await this.facade.getById(id);
  return UserResponseDto.fromEntity(user);
}
```

**Правила:**

- Никаких `try/catch`
- Никаких `throw new NotFoundException()`
- Swagger-декоратор `@ApiResponse({ status: 404 })` для документации, но без логики

**Антипаттерн:**

```typescript
// ❌ Не делаем так
@Get(':id')
async getById(@Param('id') id: string) {
  try {
    return await this.facade.getById(id);
  } catch (e) {
    if (e instanceof UserNotFoundError) throw new NotFoundException();
    throw e;
  }
}
```

---

## Exception Filter

```typescript
// infra/exceptions/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ERROR_MAP } from './error-map';
import { HealthCheckError } from '../health/health-check.error';

interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, payload } = this._resolve(error);
    this._log(error, status, request);

    response.status(status).json(payload);
  }

  private _resolve(error: unknown): { status: number; payload: unknown } {
    // 1. Health check — возвращаем result как есть
    if (error instanceof HealthCheckError) {
      return { status: HttpStatus.SERVICE_UNAVAILABLE, payload: error.result };
    }

    // 2. Domain error → мапим через ERROR_MAP
    if (error instanceof Error) {
      const status = ERROR_MAP.get(
        error.constructor as new (...args: any[]) => Error,
      );
      if (status) {
        return {
          status,
          payload: {
            code: error.constructor.name.replace(/Error$/, ''),
            message: error.message,
          },
        };
      }
    }

    // 3. NestJS HttpException → берём как есть, но нормализуем payload
    if (error instanceof HttpException) {
      const response = error.getResponse();
      const message =
        typeof response === 'string' ? response : (response as any).message;
      return {
        status: error.getStatus(),
        payload: {
          code: 'HTTP_ERROR',
          message: Array.isArray(message) ? message.join(', ') : message,
        },
      };
    }

    // 4. Unknown → 500
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      payload: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    };
  }

  private _log(error: unknown, status: number, request: Request): void {
    const message = `[${request.method}] ${request.url} → ${status}`;

    if (status >= 500) {
      this.logger.error(
        message,
        error instanceof Error ? error.stack : String(error),
      );
    } else {
      this.logger.warn(message);
    }
  }
}
```

---

## Маппинг Domain → HTTP

```typescript
// infra/exceptions/error-map.ts
import { HttpStatus } from '@nestjs/common';

export const ERROR_MAP = new Map<new (...args: any[]) => Error, number>([
  // user
  [UserNotFoundError, HttpStatus.NOT_FOUND],
  [UserAlreadyExistsError, HttpStatus.CONFLICT],

  // group
  [GroupNotFoundError, HttpStatus.NOT_FOUND],
  [InsufficientRoleError, HttpStatus.FORBIDDEN],
  [CannotRemoveOwnerError, HttpStatus.FORBIDDEN],

  // movie
  [MovieNotFoundError, HttpStatus.NOT_FOUND],
  [MovieAlreadyExistsError, HttpStatus.CONFLICT],
]);
```

**Правила:**

- HTTP status — concern инфраструктуры, не domain
- Каждый новый domain error добавляется сюда при создании модуля
- Если ошибки нет в мапе → `500 INTERNAL_ERROR`

---

## Формат ответа

### Domain error

```json
{
  "code": "USER_NOT_FOUND",
  "message": "User 123 not found"
}
```

### Validation error (Valibot)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email"],
      "name": ["String must contain at least 1 character(s)"]
    },
    "formErrors": []
  }
}
```

### Unknown error

```json
{
  "code": "INTERNAL_ERROR",
  "message": "Internal server error"
}
```

### Health check

```json
{
  "status": "error",
  "info": {},
  "error": { "memory": { "status": "down", "message": "..." } },
  "details": { "memory": { "status": "down", "message": "..." } }
}
```

**Почему `code` строкой, а не числом:**

- Фронтенд свичится по строке: `if (err.code === 'USER_NOT_FOUND')`
- HTTP status (`404`) недостаточно специфичен — `UserNotFound` и `GroupNotFound` оба 404
- `code` генерируется из имени класса: `UserNotFoundError` → `USER_NOT_FOUND`

---

## Health Check

Health check — не domain error. Это инфраструктурный probe, у которого формат ответа отличается от стандартного `{ code, message }`.

```typescript
// infra/health/health-check.error.ts
import { HealthResultDto } from './dto';

export class HealthCheckError extends Error {
  constructor(readonly result: HealthResultDto) {
    super('Health check failed');
  }
}
```

```typescript
// infra/health/health.controller.ts
@Get()
@ApiResponse({ status: 200, type: HealthResultDto })
@ApiResponse({ status: 503, description: 'Application is unhealthy' })
async check(): Promise<HealthResultDto> {
  const result = await this._healthService.checkLiveness();
  if (result.status === 'error') throw new HealthCheckError(result);
  return result;
}
```

**Почему не `extends HttpException`:** ни domain, ни инфраструктурный сервис не должен знать про HTTP. `HealthCheckError` — чистый `Error`. Exception filter мапит его в 503 и возвращает `result` как payload.

---

## Valibot Validation

`ValibotValidationPipe` валидирует входные данные и кидает `BadRequestException` с flatten-объектом:

```typescript
// infra/validation/valibot-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { flatten, safeParse } from 'valibot';

export class ValibotValidationPipe implements PipeTransform {
  constructor(private schema: v.GenericSchema) {}

  transform(value: unknown): unknown {
    const parsed = safeParse(this.schema, value);
    if (!parsed.success) {
      const flat = flatten(parsed.issues);
      throw new BadRequestException({
        fieldErrors: flat.nested,
        formErrors: flat.root,
      });
    }
    return parsed.output;
  }
}
```

Exception filter ловит `BadRequestException`:

- Если payload содержит `fieldErrors` / `formErrors` → форматирует как `VALIDATION_ERROR`
- Если обычный `BadRequestException` (не от valibot) → оставляет message

---

## Логирование

| Статус              | Уровень                 | Пример                                 |
| ------------------- | ----------------------- | -------------------------------------- |
| 4xx (domain errors) | `warn`                  | `UserNotFoundError`, `ValidationError` |
| 5xx (unknown)       | `error` + stack         | `TypeError`, `DatabaseConnectionError` |
| Health 503          | `debug` или не логируем | Шум, мониторинг отдельно               |

Exception filter логирует сам. Не дублируем логи в controller/use-case.

---

## Чек-лист при добавлении нового модуля

- [ ] Создан domain error класс в `modules/<feature>/domain/errors/`
- [ ] Use-case кидает domain error (не возвращает, не мапит в HTTP)
- [ ] Controller не содержит `try/catch`
- [ ] Domain error добавлен в `infra/exceptions/error-map.ts`
- [ ] Swagger декоратор `@ApiResponse` содержит ожидаемые HTTP статусы
- [ ] Никаких `HttpException` вне `infra/exceptions/http-exception.filter.ts`
