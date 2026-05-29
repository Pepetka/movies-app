# Флоу работы с DTO и Swagger

## Принцип

DTO (Data Transfer Object) — контракт для HTTP-слоя. Используется только в controller'е для Swagger-документации и типизации входных/выходных данных.

Facade и use-cases работают с plain objects (тип из zod схемы), не с DTO class.

---

## Поток данных

### Request (входящий)

```
HTTP Body
  ↓ ZodValidationPipe валидирует по CreateUserSchema
Validated plain object (типизирован как CreateUserDto class)
  ↓ Controller вызывает facade
CreateUserInput (z.infer<typeof CreateUserSchema>) — plain object
  ↓ Facade вызывает use-case
CreateUserInput
  ↓ Use-case вызывает domain
plain values (email, name) → User entity
```

### Response (исходящий)

```
User (domain entity)
  ↓ Use-case возвращает
User
  ↓ Facade возвращает
User
  ↓ Controller мапит через fromEntity()
UserResponseDto (class + @ApiProperty)
  ↓ NestJS сериализует в JSON
HTTP Response
```

---

## Правила

### 1. DTO — всегда class, не interface

```ts
// ❌ interface — Swagger не подхватит
export interface CreateUserDto {
  name: string;
}

// ✅ class + @ApiProperty — Swagger сгенерирует схему
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### 2. DTO не имплементит интерфейсы

DTO живёт отдельно от domain-типов. Не связывай их через `implements`:

```ts
// ❌ Не делаем
export class CreateUserDto implements User { ... }

// ✅ Делаем
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### 3. Request — zod schema + type + DTO class

```ts
// modules/user/dto/create-user.dto.ts
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Тип для facade и use-case
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Class только для controller и Swagger
export class CreateUserDto {
  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;
}
```

Валидация — через zod (`ZodValidationPipe`), типизация facade/use-case — через `CreateUserInput`, Swagger — через `@ApiProperty` на `CreateUserDto`.

### 4. Response DTO — только @ApiProperty + fromEntity()

```ts
export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id.value,
      name: user.name,
      email: user.email.value,
    };
  }
}
```

### 5. Record<string, Dto> — использовать @ApiExtraModels

Если DTO содержит `Record<string, OtherDto>`, вложенная схема не регистрируется автоматически:

```ts
// ❌ Swagger выдаст ошибку: Could not resolve reference
export class HealthResultDto {
  @ApiProperty({
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorResultDto) },
  })
  info: Record<string, HealthIndicatorResultDto>;
}

// ✅ Добавляем @ApiExtraModels на контроллере
@ApiExtraModels(HealthIndicatorResultDto)
@Controller('health')
export class HealthController { ... }
```

### 6. Контроллер — обязательные декораторы

```ts
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly facade: UserFacade) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.facade.create(dto);
    return UserResponseDto.fromEntity(user);
  }
}
```

### 7. Facade и use-case — plain object, не DTO

```ts
// user.facade.ts
import type { CreateUserInput } from './dto/create-user.dto';

async create(input: CreateUserInput) {
  return this.createUser.execute(input);
}

// use-case
import type { CreateUserInput } from '../dto/create-user.dto';

async execute(input: CreateUserInput): Promise<User> {
  const email = Email.create(input.email);
  const user = User.create(email, input.name);
  await this.repo.save(user);
  return user;
}
```

**Важно:** facade и use-case принимают `CreateUserInput` (type из zod), не `CreateUserDto` (class со Swagger). `import type` — zero runtime deps от `@nestjs/swagger`.

---

## Структура модуля

```
src/modules/<feature>/
  domain/
    entities/
    errors/
    value-objects/
  application/
    ports/
    use-cases/
  infrastructure/
    persistence/
  dto/
    index.ts
    create-<feature>.dto.ts      # Schema + Input type + DTO class
    <feature>-response.dto.ts    # DTO class + fromEntity()
  <feature>.controller.ts
  <feature>.facade.ts
  <feature>.module.ts
```

---

## Чек-лист для нового endpoint

- [ ] Создан zod schema + `Input` type + Request DTO class
- [ ] Создан Response DTO class + `static fromEntity()`
- [ ] В controller: `@Body(new ZodValidationPipe(Schema))`
- [ ] Контроллер: `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- [ ] Facade/use-case принимают `Input` type, не DTO class
- [ ] Если response содержит `Record<string, Dto>` — добавлен `@ApiExtraModels`
- [ ] Если endpoint требует авторизации — добавлен `@ApiBearerAuth()`
- [ ] DTO экспортирован из `dto/index.ts`

---

## Пример: Health Check

```ts
// infra/health/dto/health-indicator-result.dto.ts
export class HealthIndicatorResultDto {
  @ApiProperty({ enum: ['up', 'down'] }) status: 'up' | 'down';
  @ApiPropertyOptional() message?: string;
  @ApiPropertyOptional() details?: Record<string, unknown>;
}

// infra/health/dto/health-result.dto.ts
export class HealthResultDto {
  @ApiProperty({ enum: ['ok', 'error'] }) status: 'ok' | 'error';
  @ApiProperty({ additionalProperties: { $ref: getSchemaPath(HealthIndicatorResultDto) } })
  info: Record<string, HealthIndicatorResultDto>;
}

// infra/health/health.controller.ts
@ApiTags('health')
@ApiExtraModels(HealthIndicatorResultDto)
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, type: HealthResultDto })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check(): Promise<HealthResultDto> { ... }
}
```
