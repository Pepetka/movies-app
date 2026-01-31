# Авторизация в NestJS с Passport.js и JWT

Документ содержит базовые примеры реализации аутентификации и авторизации в NestJS с использованием Passport.js и JWT стратегии.

## Установка зависимостей

```bash
# Перейдите в директорию API приложения
cd apps/api

# Установите необходимые пакеты
pnpm add @nestjs/passport passport passport-jwt @nestjs/jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
```

## Структура модуля аутентификации

```
apps/api/src/auth/
├── constants.ts          # Константы (секретные ключи)
├── auth.module.ts       # Модуль аутентификации
├── auth.service.ts      # Сервис аутентификации
├── jwt.strategy.ts      # JWT стратегия Passport
├── jwt-auth.guard.ts    # Guard для защиты маршрутов
├── public.guard.ts      # Guard для публичных маршрутов
├── local.strategy.ts    # Локальная стратегия (опционально)
├── decorators/          # Кастомные декораторы
│   └── public.decorator.ts
└── dto/                 # DTO для входа/регистрации
    ├── login.dto.ts
    └── register.dto.ts
```

## 1. Константы (constants.ts)

```typescript
// apps/api/src/auth/constants.ts
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '60m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
```

> **Важно:** В продакшене всегда используйте переменные окружения для хранения секретных ключей.

## 2. DTO для валидации (dto/)

### Login DTO

```typescript
// apps/api/src/auth/dto/login.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}
```

### Register DTO

```typescript
// apps/api/src/auth/dto/register.dto.ts
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}
```

### Refresh Token DTO

```typescript
// apps/api/src/auth/dto/refresh.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token обязателен' })
  refreshToken: string;
}
```

## 3. Кастомные декораторы (decorators/)

### @Public() декоратор

```typescript
// apps/api/src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### @User() декоратор

```typescript
// apps/api/src/auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Использование в контроллере:
// @Get('profile')
// getProfile(@User() user: TUser) { return user; }
// @Get('profile/id')
// getProfileId(@User('id') userId: string) { return userId; }
```

### @Roles() декоратор

```typescript
// apps/api/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

## 4. Guard для публичных маршрутов (public.guard.ts)

```typescript
// apps/api/src/auth/public.guard.ts
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class PublicGuard {
  constructor(private reflector: Reflector) {}

  isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
```

## 5. JWT Auth Guard с поддержкой @Public()

```typescript
// apps/api/src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

## 6. Roles Guard

```typescript
// apps/api/src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
```

## 7. Сервис аутентификации (auth.service.ts)

```typescript
// apps/api/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { jwtConstants } from './constants';

interface TokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findOne(dto.email);

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findOne(dto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await this.comparePasswords(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...tokens,
    };
  }

  async refreshTokens(dto: RefreshDto) {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        dto.refreshToken,
        { secret: jwtConstants.refreshSecret },
      );

      const user = await this.usersService.findById(payload.sub);

      if (!user || user.refreshToken !== dto.refreshToken) {
        throw new UnauthorizedException('Невалидный refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Невалидный или истекший refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Успешный выход из системы' };
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return user;
  }
}
```

## 8. JWT стратегия (jwt.strategy.ts)

```typescript
// apps/api/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }
}
```

## 9. Модуль аутентификации (auth.module.ts)

```typescript
// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## 10. Auth контроллер (auth.controller.ts)

```typescript
// apps/api/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@User('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('profile')
  getProfile(@User() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAdminData() {
    return { message: 'Только для админов' };
  }
}
```

## 11. Настройка главного модуля (app.module.ts)

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Глобальный guard для всех маршрутов
    },
  ],
})
export class AppModule {}
```

> **Примечание:** Использование `APP_GUARD` делает все маршруты защищенными по умолчанию. Для публичных маршрутов используйте декоратор `@Public()`.

## 12. Переменные окружения

Создайте файл `.env` в корне API приложения:

```env
# JWT токены доступа
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=60m

# JWT refresh токены
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

### Генерация секретных ключей

```bash
# Генерация случайного секретного ключа (32+ байт)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 13. Обновление схемы users

Добавьте в схему пользователей поле `refreshToken`:

```typescript
// apps/api/src/db/schemas/users.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  refreshToken: text('refresh_token'), // Добавьте это поле
  roles: text('roles').array().default(['user']), // Опционально
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## 14. Тестирование API

### Регистрация

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ivan",
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

Ответ:
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Ivan",
    "email": "ivan@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Вход

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

### Обновление токенов

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Доступ к защищенному маршруту

```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Выход

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 15. UsersService для работы с БД

```typescript
// apps/api/src/users/users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schemas';
import { users } from '../db/schemas/users';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findOne(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async create(userData: { name: string; email: string; passwordHash: string }) {
    const [newUser] = await this.db
      .insert(users)
      .values(userData)
      .returning();
    return newUser;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    await this.db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, userId));
  }
}
```

## 16. UsersModule

```typescript
// apps/api/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## 17. Включение валидации

Добавьте `ValidationPipe` глобально в `main.ts`:

```typescript
// apps/api/src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // Выдает ошибку при лишних свойствах
      transform: true, // Автоматически преобразует типы
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

## Примечания

### Безопасность

1.  **Секретные ключи**: Никогда не храните секретные ключи в коде. Используйте переменные окружения или сервисы хранения секретов (AWS Secrets Manager, Azure Key Vault).
2.  **Пароли**: Всегда хешируйте пароли перед сохранением в БД. Используйте bcrypt с salt rounds ≥ 10.
3.  **HTTPS**: В продакшене используйте HTTPS для передачи токенов.
4.  **XSS и CSRF**: Защитите фронтенд от XSS-атак (храните токены в httpOnly cookies или memory).

### Refresh токены

- Access токены короткоживущие (15-60 минут)
- Refresh токены долгоживущие (7-30 дней)
- Храните refresh токены в БД для возможности отзыва
- При утечке refresh токена можно отозвать все токены пользователя

> **TODO: Текущая реализация хранит только один refresh токен на пользователя.**
> Это означает, что при входе с нового устройства предыдущий токен перезаписывается.
> Для production необходимо реализовать менеджмент токенов через отдельную таблицу `refresh_tokens`:
> - Поддержка нескольких устройств одного пользователя
> - Отзыв конкретного устройства
> - Отслеживание device info, IP, last used
>
> Пример схемы:
> ```sql
> refresh_tokens (
>   id uuid PRIMARY KEY,
>   user_id uuid REFERENCES users(id),
>   token text UNIQUE NOT NULL,
>   device_info jsonb,
>   ip_address text,
>   created_at timestamptz,
>   expires_at timestamptz,
>   revoked_at timestamptz
> )
> ```

### Валидация

- Используйте class-validator для валидации входных данных
- Настройте ValidationPipe глобально в main.ts
- Опция `whitelist: true` удаляет лишние свойства из запроса

### Обработка ошибок

Создайте фильтр для обработки ошибок аутентификации:

```typescript
// apps/api/src/common/filters/auth-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Дополнительные ресурсы

- [Официальная документация NestJS по аутентификации](https://docs.nestjs.com/security/authentication)
- [Passport.js документация](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/) - для отладки JWT токенов