# Флоу работы с DTO и Swagger

## Принцип

DTO (Data Transfer Object) — единый контракт для:
- **Валидации** входных данных (request)
- **Документации** ответов API (response)
- **Типизации** контроллеров и сервисов

## Правила

### 1. DTO — всегда class, не interface

```ts
// ❌ interface — Swagger не подхватит
export interface CreateUserDto { name: string; }

// ✅ class + @ApiProperty — Swagger сгенерирует схему
export class CreateUserDto {
  @ApiProperty() name: string;
}
```

### 2. DTO не имплементит интерфейсы

DTO живёт отдельно от domain-типов. Не связывай их через `implements`:

```ts
// ❌ Не делаем
export class CreateUserDto implements User { ... }

// ✅ Делаем
export class CreateUserDto {
  @ApiProperty() name: string;
}
```

### 3. Request DTO — zod + @ApiProperty

Для endpoints, которые принимают body/query/params:

```ts
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export class CreateUserDto {
  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;
}
```

Валидация через zod (кастомный pipe), Swagger через `@ApiProperty`.

### 4. Response DTO — только @ApiProperty

Для endpoints, которые возвращают данные — без zod, только документация:

```ts
export class UserDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
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
@ApiTags('users')           // Группировка в Swagger UI
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create user' })        // Описание метода
  @ApiBody({ type: CreateUserDto })                 // Схема request body
  @ApiResponse({ status: 201, type: UserDto })      // Успешный ответ
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()                                   // Если требуется JWT
  async create(@Body() dto: CreateUserDto): Promise<UserDto> { ... }
}
```

## Структура модуля

```
src/modules/<feature>/
  dto/
    index.ts
    create-<feature>.dto.ts      # Request (с zod schema)
    <feature>-response.dto.ts    # Response (только @ApiProperty)
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.module.ts
```

## Чек-лист для нового endpoint

- [ ] Создан Request DTO (class + @ApiProperty + zod schema, если есть body/params)
- [ ] Создан Response DTO (class + @ApiProperty)
- [ ] Контроллер: `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- [ ] Если response содержит `Record<string, Dto>` — добавлен `@ApiExtraModels`
- [ ] Если endpoint требует авторизации — добавлен `@ApiBearerAuth()`
- [ ] DTO экспортирован из `dto/index.ts`

## Пример: Health Check

```ts
// dto/health-indicator-result.dto.ts
export class HealthIndicatorResultDto {
  @ApiProperty({ enum: ['up', 'down'] }) status: 'up' | 'down';
  @ApiPropertyOptional() message?: string;
  @ApiPropertyOptional() details?: Record<string, unknown>;
}

// dto/health-result.dto.ts
export class HealthResultDto {
  @ApiProperty({ enum: ['ok', 'error'] }) status: 'ok' | 'error';
  @ApiProperty({ additionalProperties: { $ref: getSchemaPath(HealthIndicatorResultDto) } })
  info: Record<string, HealthIndicatorResultDto>;
}

// health.controller.ts
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
