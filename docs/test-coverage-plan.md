# План тестирования API

## Текущее состояние

- **Покрытие**: ~0%
- **Существующие тесты**: только 1 e2e тест для health endpoint
- **Статус**: Auth модуль новый (feat/auth branch), не протестирован
- **CI**: Тестовый job закомментирован в `.github/workflows/ci.yml`

---

## CI / CD

### Текущий pipeline

```yaml
# .github/workflows/ci.yml

1. Lint → ESLint
2. Type Check → TypeScript
3. Build → сборка
4. Test → (закомментирован) ⚠️
```

### Что нужно сделать

1. **Раскомментировать test job** в `.github/workflows/ci.yml` после написания тестов
2. **Добавить coverage reporting** — загрузка в Codecov или GitHub Actions coverage
3. **Блокировать merge** без прохождения тестов

### Env переменные для тестов

| Переменная | Тестовое значение |
|------------|-------------------|
| `NODE_ENV` | `test` |
| `PORT` | `3000` |
| `WEB_URL` | `http://localhost:5173` |
| `API_URL` | `http://localhost:3000` |
| `COOKIE_SECRET` | `test-secret-key-not-for-production` |
| `DATABASE_URL` | `postgresql://test_user:test_pass@localhost:5432/test_db` |
| `JWT_ACCESS_SECRET` | `test-jwt-access-secret` |
| `JWT_REFRESH_SECRET` | `test-jwt-refresh-secret` |
| `JWT_ACCESS_EXPIRATION` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` |

**Важно:** Это не секреты — только для тестов. В GitHub Secrets добавлять не нужно.

### Рекомендуемый workflow

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  needs: lint
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_USER: test_user
        POSTGRES_PASSWORD: test_pass
        POSTGRES_DB: test_db
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
      ports:
        - 5432:5432

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Install pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9.0.0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run unit tests
      run: pnpm --filter=api test:cov
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db

    - name: Run e2e tests
      run: pnpm --filter=api test:e2e
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db

    - name: Upload coverage
      uses: codecov/codecov-action@v4
      with:
        files: ./apps/api/coverage/lcov.info
        flags: api
```

### Когда включать тесты в CI

| Стадия | Что запускать |
|--------|---------------|
| **Сейчас** | - |
| **После Auth модуля** | Unit tests (auth) |
| **После User модуля** | Unit tests (auth + user) |
| **После основных guards** | E2E tests (auth flow) |
| **Полное покрытие** | Все тесты + coverage reporting |

---

## Приоритеты

### 🔴 Высокий приоритет

#### Auth Module

**AuthService unit tests:**
- [ ] `register()` — создание нового пользователя
  - Успешная регистрация
  - Дубликат email (ошибка)
  - Валидация пароля
- [ ] `login()` — аутентификация
  - Успешный логин
  - Неверный пароль
  - Несуществующий пользователь
- [ ] `logout()` — выход
  - Очистка refresh token в БД
- [ ] `refreshTokens()` — обновление токенов
  - Валидный refresh token
  - Истёкший/невалидный refresh token
  - Генерация новой пары токенов
- [ ] `hashPassword()` / `comparePasswords()` — хеширование

**AuthController tests:**
- [ ] POST `/auth/register`
  - 201 Created с UserResponse
  - 400 Conflict при дубликатах
  - 400 Bad Request при невалидном DTO
- [ ] POST `/auth/login`
  - 200 OK с токенами в cookies
  - 401 Unauthorized при неверных данных
- [ ] POST `/auth/logout`
  - 204 No Content
  - Очистка cookies
- [ ] POST `/auth/refresh`
  - 200 OK с новым access token
  - 401 Unauthorized при невалидном refresh token
- [ ] Rate limiting на auth endpoints

**Guards & Strategies:**
- [ ] `RefreshGuard` — валидация refresh token из cookie
- [ ] `JwtAccessStrategy` — валидация access token
- [ ] `JwtRefreshStrategy` — валидация refresh token

---

#### User Module

**UserService unit tests:**
- [ ] `create()` — создание пользователя
- [ ] `findAll()` — список с пагинацией
- [ ] `findOne()` — поиск по ID
- [ ] `update()` — обновление данных
- [ ] `remove()` — удаление

**UserRepository unit tests:**
- [ ] Все CRUD методы с моком БД

**UserController tests:**
- [ ] GET `/user` — список (пагинация)
- [ ] GET `/user/:id` — один пользователь
- [ ] PATCH `/user/:id` — обновление
- [ ] DELETE `/user/:id` — удаление
- [ ] Проверка `@Roles('ADMIN')` на endpoints
- [ ] Проверка `@Author()` для owner-only операций

**DTO validation:**
- [ ] `UserCreateDto` — валидация полей
- [ ] `UserUpdateDto` — частичные обновления
- [ ] `UserResponseDto` — сериализация

---

### 🟡 Средний приоритет

#### Common Module

**Guards:**
- [ ] `AuthGuard` — проверка JWT access token
- [ ] `RolesGuard` — проверка ролей пользователя
- [ ] `AuthorGuard` — проверка владельца ресурса
- [ ] `CsrfGuard` — CSRF защита

**Decorators:**
- [ ] `@Public()` — обход AuthGuard
- [ ] `@Roles()` — установка метаданных ролей
- [ ] `@Author()` — проверка owner

**Validators:**
- [ ] `@IsPassword()` — валидация сложности пароля

**Utils:**
- [ ] `parseDuration()` — парсинг duration строк

---

#### Csrf Module

- [ ] GET `/csrf/token` — генерация CSRF токена

---

### 🟢 Низкий приоритет

#### Health Module

- [ ] GET `/health` — базовая проверка (уже есть e2e)

#### Db Module

- [ ] Валидация schema
- [ ] Migration утилиты

---

## E2E тесты (сценарии)

### Auth Flow:
- [ ] Регистрация → Логин → Refresh токенов → Logout
- [ ] Попытка доступа без токена
- [ ] Доступ с истёкшим токеном
- [ ] CSRF защита на POST запросах

### User Management:
- [ ] Admin создаёт пользователя
- [ ] User обновляет свой профиль
- [ ] User не может обновлять чужой профиль
- [ ] Admin удаляет пользователя

---

## Команды для запуска

```bash
# Unit tests
cd apps/api
pnpm run test              # Все тесты
pnpm run test:watch        # Watch mode
pnpm run test:cov          # С покрытием

# E2E tests
pnpm run test:e2e          # E2E сценарии
```

---

## Целевое покрытие

- **Минимум**: 80% по lines/branches/functions
- **Цель**: 90%+ для critical paths (Auth, User)
