# API (NestJS + Drizzle)

## Структура импортов

```typescript
// 1. Внешние пакеты
import { Injectable, Logger } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';

// 2. Алиасные импорты ($common, $db)
import { GroupMemberRole } from '$common/enums';
import type { Group } from '$db/schemas';

// 3. Локальные импорты
import { GroupsRepository } from './groups.repository';
import { GroupCreateDto } from './dto';
```

## Service

```typescript
@Injectable()
export class GroupsService {
  private readonly _logger = new Logger(GroupsService.name);

  constructor(private readonly groupsRepository: GroupsRepository) {}

  async create(userId: number, dto: GroupCreateDto): Promise<Group> {
    const group = await this.groupsRepository.createGroup({
      name: dto.name,
      description: dto.description ?? null,
      avatarUrl: dto.avatarUrl ?? null,
    });

    this._logger.log(`Group ${group.id} created by user ${userId}`);
    return group;
  }

  // Приватные методы в конце класса
  private async validateAccess(id: number, userId: number): Promise<void> {}
}
```

## Controller

Порядок декораторов:

```typescript
@Get(':id')                                    // 1. HTTP-метод
@UseGuards(GroupMemberGuard)                   // 2. Guards
@SerializeOptions({ type: GroupResponseDto })  // 3. SerializeOptions
@ApiOperation({ summary: 'Get group by id' })  // 4. ApiOperation
@ApiResponse({ status: 200, ... })             // 5. ApiResponse
findOne(
  @Param('id', ParseIntPipe) id: number,       // Параметры сначала
  @User('id') userId: number,                  // Затем user decorator
) {
  return this.groupsService.findOne(id, userId);
}
```

## DTO

### Request DTO

```typescript
export class GroupCreateDto {
  @ApiProperty({ example: 'Movie Club', description: 'Group name' })
  @IsString()
  @MaxLength(256)
  name: string;

  @ApiPropertyOptional({ example: 'Weekly movie nights' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  @MaxLength(512)
  avatarUrl?: string;
}
```

### Response DTO

`ClassSerializerInterceptor` настроен с `excludeExtraneousValues: true` — в ответ попадают только поля с `@Expose()`. Каждое поле response DTO обязано иметь `@Expose()`, иначе оно будет молча удалено из ответа.

```typescript
import { Expose } from 'class-transformer';

export class GroupResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  // Без @Expose() — поле не попадёт в ответ
  inviteToken: string;
}
```

## Repository

```typescript
@Injectable()
export class GroupsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findGroupById(id: number): Promise<Group | null> {
    const [result] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);
    return result ?? null;
  }

  async transferOwnership(groupId: number, from: number, to: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.update(groupMembers)...
      await tx.update(groupMembers)...
    });
  }
}
```

## Exceptions

```typescript
export class GroupNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Group with id ${id} not found`);
  }
}
```

## Guards

```typescript
@Injectable()
export class AuthGuard extends NestJsAuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

## Database Schemas

```typescript
import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';

export const groups = pgTable('groups', {
  id: serial().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  description: text(),
  avatarUrl: varchar({ length: 512 }),
  inviteToken: varchar({ length: 32 }),
  ...timestamps,
});

// timestamps.ts
export const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
```
