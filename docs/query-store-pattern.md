# Query Store Pattern

Паттерн для создания сторов на базе `createQuery` и `createMutation` с чётким разделением ответственности.

## Архитектура

```
Module
├── groups-store.svelte.ts   # Список сущностей (только чтение)
├── group-store.svelte.ts    # Отдельная сущность + формы (CRUD)
├── types.ts                 # PostStatus, GroupFormMode, etc.
├── api.ts                   # API функции
└── validation.svelte.ts     # Валидация форм
```

**Ключевой принцип:** Один модуль = несколько отдельных сторов для списка и одной сущности + формы:
- **List Store** — только список, без форм
- **Item Store** — одна сущность + create/update mutations

## Принципы

1. **Единственный источник правды** — query/mutation state, геттеры только делегируют
2. **FetchStatus** — единый тип статуса загрузки из query
3. **PostStatus** — статус из mutation для форм (`idle | submitting | success | error`)
4. **Разделение ответственности** — list store не знает про формы, item store управляет формами
5. **Все query/mutation создаются в constructor** — не динамически!

## Структура сторов

### List Store (только чтение)

```typescript
import type { GroupResponseDto } from '$lib/api/generated/types';
import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import { getGroups } from './api';

class GroupsStore extends BaseStore {
	private readonly _query: QueryResult<GroupResponseDto[]>;

	constructor() {
		super();
		this._query = createQuery<GroupResponseDto[]>({
			key: ['groups'],
			tags: ['groups'],
			fetcher: (signal) => getGroups(signal),
			debug: !__IS_PROD__
		});
	}

	// === Геттеры — делегируют к query ===

	get groups(): GroupResponseDto[] {
		return this._query.data ?? [];
	}

	get status(): FetchStatus {
		return this._query.status;
	}

	get error(): string | null {
		if (!this._query.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки');
	}

	get isEmpty(): boolean {
		return this.groups.length === 0;
	}

	// === Действия ===

	async fetchGroups(): Promise<void> {
		if (this.status === 'loaded') return;
		await this._query.fetch();
	}

	async fetch(): Promise<void> {
		await this._query.fetch();
	}

	reset(): void {
		this._query.reset();
	}
}

export const groupsStore = new GroupsStore();
```

### Item Store (CRUD + mutations)

```typescript
import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';
import {
	createMutation,
	createQuery,
	type FetchStatus,
	type MutationResult,
	type PostStatus,
	type QueryResult
} from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import {
	createGroup as createGroupApi,
	getGroup as getGroupApi,
	updateGroup as updateGroupApi
} from './api';

class GroupStore extends BaseStore {
	private readonly _query: QueryResult<GroupResponseDto, number>;
	private readonly _createMutation: MutationResult<GroupResponseDto, GroupCreateDto>;
	private readonly _updateMutation: MutationResult<
		GroupResponseDto,
		{ id: number; data: GroupUpdateDto }
	>;

	constructor() {
		super();

		this._query = createQuery<GroupResponseDto, number>({
			key: ['group'],
			tags: ['group'],
			fetcher: (signal, id) => {
				if (!id) throw new Error('No group id');
				return getGroupApi(id, signal);
			},
			debug: !__IS_PROD__
		});

		this._createMutation = createMutation<GroupResponseDto, GroupCreateDto>({
			key: ['group', 'create'],
			tags: ['groups'],
			mutator: createGroupApi,
			debug: !__IS_PROD__
		});

		this._updateMutation = createMutation<
			GroupResponseDto,
			{ id: number; data: GroupUpdateDto }
		>({
			key: ['group', 'update'],
			tags: ['groups'],
			mutator: ({ id, data }) => updateGroupApi(id, data),
			invalidateKeys: (_, { id }) => [['group', id]],
			debug: !__IS_PROD__
		});
	}

	// === Query геттеры ===

	get currentGroup(): GroupResponseDto | null {
		return this._query.data ?? null;
	}

	get status(): FetchStatus {
		return this._query.status;
	}

	get error(): string | null {
		if (!this._query.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки');
	}

	async fetchGroup(id: number): Promise<void> {
		if (this._query.isCurrentKey(['group', id]) && this.status === 'loaded') return;
		await this._query.revalidate(['group', id], id);
	}

	// === Create mutation ===

	get createStatus(): PostStatus {
		return this._createMutation.status;
	}

	get createError(): string | null {
		if (!this._createMutation.error) return null;
		return this._extractErrorMessage(this._createMutation.error, 'Ошибка создания');
	}

	get isCreating(): boolean {
		return this._createMutation.isSubmitting;
	}

	async createGroup(data: GroupCreateDto): Promise<GroupResponseDto | null> {
		return this._createMutation.mutate(data);
	}

	resetCreate(): void {
		this._createMutation.reset();
	}

	// === Update mutation ===

	get updateStatus(): PostStatus {
		return this._updateMutation.status;
	}

	get updateError(): string | null {
		if (!this._updateMutation.error) return null;
		return this._extractErrorMessage(this._updateMutation.error, 'Ошибка обновления');
	}

	get isUpdating(): boolean {
		return this._updateMutation.isSubmitting;
	}

	async updateGroup(id: number, data: GroupUpdateDto): Promise<GroupResponseDto | null> {
		return this._updateMutation.mutate({ id, data });
	}

	resetUpdate(): void {
		this._updateMutation.reset();
	}

	// === Reset ===

	reset(): void {
		this._query.reset();
	}

	resetForm(): void {
		this._createMutation.reset();
		this._updateMutation.reset();
	}
}

export const groupStore = new GroupStore();
```

## Типы

### FetchStatus (из query)

```typescript
export type FetchStatus = 'idle' | 'loaded' | 'error' | 'loading' | 'fetching';
```

| Status | Когда |
|--------|-------|
| `idle` | Начальное состояние, данных нет |
| `loading` | Первый запрос, данных ещё нет |
| `fetching` | Refetch, данные уже есть |
| `loaded` | Данные успешно загружены |
| `error` | Ошибка загрузки |

### PostStatus (из mutation)

```typescript
export type PostStatus = 'idle' | 'submitting' | 'success' | 'error';
```

| Status | Когда |
|--------|-------|
| `idle` | Начальное состояние |
| `submitting` | Запрос в процессе |
| `success` | Успешное завершение |
| `error` | Ошибка |

## Query API

### createQuery(options)

```typescript
const query = createQuery<T, K>({
	key: ['entity'],           // Уникальный ключ
	tags: ['entity'],         // Теги для инвалидации
	fetcher: (signal, params) => api.get(params, signal), // Функция загрузки
	params: initialValue,     // Начальные параметры (опционально)
	debug: !__IS_PROD__       // Логирование в dev
});
```

### QueryResult

```typescript
interface QueryResult<T, K> {
	// Геттеры
	data: T | null;
	error: Error | null;
	isFetching: boolean;
	isError: boolean;
	status: FetchStatus;

	// Методы
	fetch(): Promise<void>;
	reset(): void;
	destroy(): void;
	revalidate(newKey: unknown[], newParams?: K | null): Promise<void>;
	isCurrentKey(key: unknown[]): boolean;
}
```

### revalidate(newKey, newParams)

Меняет ключ и параметры, затем делает запрос. Используется для динамических ключей.

```typescript
// Для query с параметрами
await query.revalidate(['group', id], id);

// fetcher получит id как второй аргумент
fetcher: (signal, id) => getGroup(id, signal)
```

### isCurrentKey(key)

Проверяет, совпадает ли текущий ключ с переданным. Используется для защиты от повторных запросов.

```typescript
if (query.isCurrentKey(['group', id]) && status === 'loaded') return;
await query.revalidate(['group', id], id);
```

## Mutation API

### createMutation(options)

```typescript
const mutation = createMutation<T, V>({
	key: ['entity', 'create'],              // Уникальный ключ
	tags: ['entities'],                     // Теги для инвалидации после успеха
	mutator: (variables) => api.create(variables), // Функция мутации
	invalidateKeys: (data, variables) => [['entity', variables.id]], // Доп. ключи для инвалидации
	debug: !__IS_PROD__                     // Логирование в dev
});
```

### MutationResult

```typescript
interface MutationResult<T, V> {
	// Геттеры
	data: T | null;
	error: Error | null;
	isSubmitting: boolean;
	isError: boolean;
	status: PostStatus;

	// Методы
	mutate(variables: V): Promise<T | null>;
	reset(): void;
}
```

### Инвалидация

После успешной мутации автоматически инвалидируются:
1. Все query с тегами из `tags`
2. Все query с ключами из `invalidateKeys(data, variables)`

```typescript
createMutation({
	tags: ['groups'],  // Инвалидирует все query с тегом 'groups'
	invalidateKeys: (_, { id }) => [['group', id]], // + инвалидирует конкретный group
});
```

## Query Registry

```typescript
import { queryRegistry } from '$lib/query';

// Инвалидация по тегу (все query с этим тегом)
queryRegistry.invalidateByTag('groups');

// Инвалидация по ключу (префиксное совпадение)
queryRegistry.invalidateByKey(['group', id]);

// Сброс всех query и mutations (при logout)
queryRegistry.resetAll();
```

## Использование в компонентах

### Список

```svelte
<script lang="ts">
	import { untrack } from 'svelte';
	import { groupsStore } from '$lib/modules/groups';

	$effect(() => {
		untrack(() => {
			void groupsStore.fetchGroups();
		});
	});
</script>

<div aria-busy={groupsStore.status === 'loading'}>
	{#if groupsStore.status === 'loading'}
		<Skeleton />
	{:else if groupsStore.status === 'error'}
		<EmptyState variant="error" description={groupsStore.error}>
			<Button onclick={() => groupsStore.fetch()}>Повторить</Button>
		</EmptyState>
	{:else if groupsStore.isEmpty}
		<EmptyState title="Нет групп" />
	{:else}
		<List>
			{#each groupsStore.groups as group (group.id)}
				<ListItem>{group.name}</ListItem>
			{/each}
		</List>

		{#if groupsStore.status === 'fetching'}
			<Spinner />
		{/if}
	{/if}
</div>
```

### Форма создания

```svelte
<script lang="ts">
	import { toast } from '@repo/ui';
	import { groupStore, EMPTY_GROUP_FORM, type GroupFormData } from '$lib/modules/groups';
	import { goto } from '$app/navigation';

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

	$effect(() => {
		return () => groupStore.resetForm();
	});

	const handleSubmit = async () => {
		const group = await groupStore.createGroup(form);
		if (group) {
			toast.success('Группа создана');
			await goto('/groups/' + group.id);
		} else {
			toast.error(groupStore.createError ?? 'Ошибка');
		}
	};
</script>

<GroupForm
	mode="create"
	bind:form
	onSubmit={handleSubmit}
	isSubmitting={groupStore.isCreating}
/>
```

### Форма редактирования

```svelte
<script lang="ts">
	import { untrack } from 'svelte';
	import { toast, Spinner } from '@repo/ui';
	import { groupStore, EMPTY_GROUP_FORM, type GroupFormData } from '$lib/modules/groups';
	import { page } from '$app/state';

	const groupId = $derived(Number(page.params.id));
	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

	$effect(() => {
		untrack(() => {
			void groupStore.fetchGroup(groupId);
		});
		return () => groupStore.resetForm();
	});

	$effect(() => {
		if (groupStore.currentGroup && !groupStore.updateError) {
			form = {
				name: groupStore.currentGroup.name ?? '',
				description: groupStore.currentGroup.description ?? '',
				avatarUrl: groupStore.currentGroup.avatarUrl ?? ''
			};
		}
	});

	const handleSubmit = async () => {
		const group = await groupStore.updateGroup(groupId, form);
		if (group) {
			toast.success('Сохранено');
			await goto('/groups/' + group.id);
		} else if (groupStore.updateError) {
			toast.error(groupStore.updateError);
		}
	};

	const handleRetry = () => {
		void groupStore.fetchGroup(groupId);
	};
</script>

{#if groupStore.status === 'loading'}
	<Spinner />
{:else if groupStore.status === 'error'}
	<EmptyState variant="error" description={groupStore.error}>
		<Button onclick={handleRetry}>Повторить</Button>
	</EmptyState>
{:else}
	<GroupForm
		mode="edit"
		bind:form
		onSubmit={handleSubmit}
		isSubmitting={groupStore.isUpdating}
	/>
{/if}
```

## Чек-лист создания нового модуля

1. **types.ts**
   - [ ] `PostStatus` — импортировать из `$lib/query`
   - [ ] `FormMode` — если есть create/edit
   - [ ] `IProps` — для компонентов формы

2. **api.ts**
   - [ ] `getItems(signal)` — список
   - [ ] `getItem(id, signal)` — одна сущность
   - [ ] `createItem(data)` — создание
   - [ ] `updateItem(id, data)` — обновление

3. **items-store.svelte.ts**
   - [ ] `createQuery<Item[]>` с key `['items']`
   - [ ] Геттеры: `items`, `status`, `error`, `isEmpty`
   - [ ] Методы: `fetchItems()`, `fetch()`, `reset()`

4. **item-store.svelte.ts**
   - [ ] `createQuery<Item, number>` с key `['item']` и params
   - [ ] `createMutation` для create с tags: `['items']`
   - [ ] `createMutation` для update с tags + `invalidateKeys`
   - [ ] Геттеры делегируют к query/mutation
   - [ ] Защита от повторных запросов: `isCurrentKey() && status === 'loaded'`

5. **index.ts**
   - [ ] Экспорт обоих сторов
   - [ ] Экспорт типов
   - [ ] Экспорт компонентов формы

## Эталонные реализации

| Модуль | List Store | Item Store |
|--------|------------|------------|
| Groups | `groups-store.svelte.ts` | `group-store.svelte.ts` |
| Auth | `auth/store.svelte.ts` | — (только currentUser) |

## Что НЕ делать

### ❌ Дублировать данные

```typescript
// НЕПРАВИЛЬНО
items = $state<Item[]>([]);

async fetchItems() {
	await this._query.fetch();
	this.items = this._query.data ?? []; // Дублирование!
}
```

```typescript
// ПРАВИЛЬНО — геттер делегирует
get items(): Item[] {
	return this._query.data ?? [];
}
```

### ❌ Смешивать статусы

```typescript
// НЕПРАВИЛЬНО — один статус для всего
status = $state<'idle' | 'loading' | 'submitting' | 'error'>('idle');
```

```typescript
// ПРАВИЛЬНО — раздельные статусы
// FetchStatus — из query (loading/fetching/loaded/error/idle)
// PostStatus — из mutation (idle/submitting/success/error)
```

### ❌ Забывать инвалидацию

```typescript
// НЕПРАВИЛЬНО
async createItem(data) {
	const item = await api.create(data);
	return item; // Список не обновится!
}
```

```typescript
// ПРАВИЛЬНО — createMutation автоматически инвалидирует по tags
createMutation({
	tags: ['items'],
	mutator: api.create,
});
```

### ❌ Не защищать от повторных запросов

```typescript
// НЕПРАВИЛЬНО — при каждом ререндере будет запрос
async fetchItem(id: number) {
	await this._query.revalidate(['item', id], id);
}
```

```typescript
// ПРАВИЛЬНО — защита по isCurrentKey
async fetchItem(id: number): Promise<void> {
	if (this._query.isCurrentKey(['item', id]) && this.status === 'loaded') return;
	await this._query.revalidate(['item', id], id);
}
```

### ❌ Создавать query динамически

```typescript
// НЕПРАВИЛЬНО — query создаётся в методе
async fetchItem(id: number) {
	this._query = createQuery({ ... }); // Будет утечка!
}
```

```typescript
// ПРАВИЛЬНО — query создаётся в constructor
constructor() {
	this._query = createQuery({ ... });
}
```
