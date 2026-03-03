# Testing (Jest)

## Unit Tests

### Структура теста

```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { GroupMemberRole } from '$common/enums';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';

// Моки данных
const mockGroup = {
  id: 1,
  name: 'Test Group',
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Фабрика моков репозитория
const createMockGroupsRepository = () => ({
  createGroup: jest.fn(),
  findGroupById: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
});

describe('GroupsService', () => {
  let service: GroupsService;
  let groupsRepository: ReturnType<typeof createMockGroupsRepository>;

  beforeEach(async () => {
    const mockRepo = createMockGroupsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: GroupsRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    groupsRepository = mockRepo as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create group and add user as admin', async () => {
      groupsRepository.createGroup.mockResolvedValue(mockGroup);

      const result = await service.create(1, { name: 'Test' });

      expect(result).toEqual(mockGroup);
      expect(groupsRepository.createGroup).toHaveBeenCalledWith({
        name: 'Test',
      });
    });

    it('should throw if repository fails', async () => {
      groupsRepository.createGroup.mockRejectedValue(new Error('DB error'));

      await expect(service.create(1, {} as any)).rejects.toThrow('DB error');
    });
  });
});
```

### Naming convention

```typescript
describe('MethodName', () => {
  it('should return expected value when condition', () => { });
  it('should throw ErrorName for invalid input', () => { });
  it('should handle edge case: empty array', () => { });
});
```

### Моки

```typescript
// Фабрика моков (предпочтительно)
const createMockRepository = () => ({
  findById: jest.fn(),
  create: jest.fn(),
});

// Мок с реализацией
const mockRepo = {
  findById: jest.fn().mockResolvedValue({ id: 1 }),
  create: jest.fn().mockResolvedValue({ id: 2 }),
};

// Chain mocks
groupsRepository.findMember
  .mockResolvedValueOnce({ role: 'admin' })
  .mockResolvedValueOnce(null);
```

### NestJS Testing Module

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    Service,                              // Реальный сервис
    { provide: Repository, useValue: mockRepo },  // Мок зависимости
  ],
}).compile();

service = module.get<Service>(Service);
```

### it.each для параметризованных тестов

```typescript
it.each([Role.MODERATOR, Role.MEMBER])(
  'should throw NotAdminException for %s',
  async (role) => {
    groupsRepository.findMember.mockResolvedValue({ role });

    await expect(service.remove(1, 2)).rejects.toThrow(NotAdminException);
  },
);
```

## E2E Tests

Находятся в `apps/api/test/` с суффиксом `.e2e-spec.ts`.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GroupsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/groups (GET)', () => {
    return request(app.getHttpServer())
      .get('/groups')
      .set('Authorization', 'Bearer token')
      .expect(200);
  });
});
```

## Команды

```bash
pnpm run test           # Unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # With coverage
pnpm run test:e2e       # E2E tests
```

## Coverage

| Layer       | Что тестируем                           |
| ----------- | --------------------------------------- |
| Services    | Бизнес-логика, edge cases, ошибки       |
| Repository  | Запросы к БД (integration)              |
| Controllers | HTTP статусы, guards, serialization     |
