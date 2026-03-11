# Query Store Pattern

Паттерн для создания сторов на базе `createQuery` с чётким разделением ответственности.

## Архитектура

```
Module
├── xxx-store.svelte.ts      # Список сущностей (только чтение)
├── xxx-store.svelte.ts      # Отдельная сущность + формы (CRUD)
├── types.ts                 # PostStatus, GroupFormMode, etc.
├── api.ts                   # API функции
└── validation.svelte.ts     # Валидация форм
```

**Ключевой принцип:** Один модуль = несколько отдельных сторов для списка и одной сущности + формы:
- **List Store** — только список, без форм
- **Item Store** — одна сущность + create/update формы

## Принципы

1. **Единственный источник правды** — query state, геттеры только делегируют
2. **FetchStatus** — единый тип статуса загрузки из query
3. **PostStatus** — отдельный тип для форм (`idle | submitting | success | error`)
4. **Разделение ответственности** — list store не знает про формы, item store управляет формами

## Структура сторов

### List Store (только чтение)

```typescript
import type { Item } from '$lib/api/generated/types';
import { createQuery, type FetchStatus, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import { getItems } from './api';

class ItemsStore extends BaseStore {
	private _query: QueryResult<Item[]> | null = null;

	constructor() {
		super();
		this._query = createQuery<Item[]>({
			key: ['items'],
			tags: ['items'],
			fetcher: (signal) => getItems(signal),
			debug: !__IS_PROD__
		});
	}

	// === Геттеры — делегируют к query ===

	get items(): Item[] {
		return this._query?.data ?? [];
	}

	get status(): FetchStatus {
		if (!this._query) return 'idle';
		return this._query.status;
	}

	get error(): string | null {
		if (!this._query?.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки');
	}

	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	// === Действия ===

	async fetchItems(): Promise<void> {
		if (this.status === 'loaded') return; // Защита от повторных запросов
		await this._query?.refetch();
	}

	async refetch(): Promise<void> {
		await this._query?.refetch();
	}

	reset(): void {
		this._query?.reset();
	}

	destroy(): void {
		this._query?.destroy();
		this._query = null;
	}
}

export const itemsStore = new ItemsStore();
```

### Item Store (CRUD + формы)

```typescript
import type { ItemCreateDto, ItemResponseDto, ItemUpdateDto } from '$lib/api/generated/types';
import { createQuery, queryRegistry, type FetchStatus, type QueryResult } from '$lib/query';
import { BaseStore } from '$lib/stores/base.svelte';

import { createItem as createItemApi, getItem as getItemApi, updateItem as updateItemApi } from './api';
import type { PostStatus } from './types';

class ItemStore extends BaseStore {
	private _query: QueryResult<ItemResponseDto, number> | null = null;
	private _currentId: number | null = null;

	// === Состояние формы ===
	formStatus = $state<PostStatus>('idle');
	formError = $state<string | null>(null);

	constructor() {
		super();
		this._query = createQuery<ItemResponseDto, number>({
			key: ['item'],
			tags: ['item'],
			fetcher: (signal, id) => {
				if (!id) throw new Error('No item id');
				return getItemApi(id, signal);
			},
			debug: !__IS_PROD__
		});
	}

	// === Геттеры — делегируют к query ===

	get currentItem(): ItemResponseDto | null {
		return this._query?.data ?? null;
	}

	get status(): FetchStatus {
		if (!this._query) return 'idle';
		return this._query.status;
	}

	get error(): string | null {
		if (!this._query?.error) return null;
		return this._extractErrorMessage(this._query.error, 'Ошибка загрузки');
	}

	get isSubmitting(): boolean {
		return this.formStatus === 'submitting';
	}

	// === Загрузка ===

	async fetchItem(id: number): Promise<void> {
		if (this._currentId === id) return; // Защита от повторных запросов того же id
		await this._query?.revalidate(['item', id], id);
		this._currentId = id;
	}

	// === Создание ===

	async createItem(data: ItemCreateDto): Promise<ItemResponseDto | null> {
		this.formStatus = 'submitting';
		this.formError = null;

		try {
			const item = await createItemApi(data);
			this.formStatus = 'success';
			queryRegistry.invalidateByTag('items');
			return item;
		} catch (error) {
			this.formStatus = 'error';
			this.formError = this._extractErrorMessage(error, 'Ошибка создания');
			this._log('error', 'Failed to create item', { error });
			return null;
		}
	}

	// === Обновление ===

	async updateItem(id: number, data: ItemUpdateDto): Promise<ItemResponseDto | null> {
		this.formStatus = 'submitting';
		this.formError = null;

		try {
			const item = await updateItemApi(id, data);
			this.formStatus = 'success';
			queryRegistry.invalidateByTag('items');
			queryRegistry.invalidateByKey(['item', id]);
			return item;
		} catch (error) {
			this.formStatus = 'error';
			this.formError = this._extractErrorMessage(error, 'Ошибка обновления');
			this._log('error', 'Failed to update item', { error });
			return null;
		}
	}

	// === Сброс ===

	reset(): void {
		this._query?.reset();
	}

	resetForm(): void {
		this.formStatus = 'idle';
		this.formError = null;
	}

	destroy(): void {
		this._query?.destroy();
		this._query = null;
		this.resetForm();
	}
}

export const itemStore = new ItemStore();
```

## Типы

### FetchStatus (из query)

```typescript
// В $lib/query/types.ts
export type FetchStatus = 'idle' | 'loaded' | 'error' | 'loading' | 'fetching';
```

| Status | Когда |
|--------|-------|
| `idle` | Начальное состояние, данных нет |
| `loading` | Первый запрос, данных ещё нет |
| `fetching` | Refetch, данные уже есть |
| `loaded` | Данные успешно загружены |
| `error` | Ошибка загрузки |

### PostStatus (для форм)

```typescript
// В module/types.ts
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
	refetch(): Promise<void>;
	reset(): void;
	destroy(): void;
	revalidate(newKey: unknown[], newParams?: K | null): Promise<void>;
}
```

### revalidate(newKey, newParams)

Меняет ключ и параметры, затем делает запрос.

```typescript
// Для query с параметрами
await query.revalidate(['item', id], id);

// fetcher получит id как второй аргумент
fetcher: (signal, id) => getItem(id, signal)
```

## Использование в компонентах

### Список

```svelte
<script lang="ts">
	import { untrack } from 'svelte';
	import { itemsStore } from '$lib/modules/items';

	$effect(() => {
		untrack(() => {
			void itemsStore.fetchItems();
		});
	});
</script>

<div aria-busy={itemsStore.status === 'loading'}>
	{#if itemsStore.status === 'loading'}
		<Skeleton />
	{:else if itemsStore.status === 'error'}
		<EmptyState variant="error" description={itemsStore.error}>
			<Button onclick={() => itemsStore.refetch()}>Повторить</Button>
		</EmptyState>
	{:else if itemsStore.isEmpty}
		<EmptyState title="Пусто" />
	{:else}
		<List>
			{#each itemsStore.items as item (item.id)}
				<ListItem>{item.name}</ListItem>
			{/each}
		</List>

		{#if itemsStore.status === 'fetching'}
			<Spinner />
		{/if}
	{/if}
</div>
```

### Форма создания

```svelte
<script lang="ts">
	import { toast } from '@repo/ui';
	import { itemStore } from '$lib/modules/items';

	let form = $state({ name: '' });

	$effect(() => {
		// cleanup при уходе
		return () => itemStore.resetForm();
	});

	const handleSubmit = async () => {
		const item = await itemStore.createItem(form);
		if (item) {
			toast.success('Создано');
			goto('/items/' + item.id);
		} else {
			toast.error(itemStore.formError ?? 'Ошибка');
		}
	};
</script>

<form onsubmit={handleSubmit}>
	<input bind:value={form.name} />
	<Button type="submit" disabled={itemStore.isSubmitting}>
		{itemStore.isSubmitting ? 'Создание...' : 'Создать'}
	</Button>
</form>
```

### Форма редактирования

```svelte
<script lang="ts">
	import { untrack } from 'svelte';
	import { toast, Spinner } from '@repo/ui';
	import { itemStore } from '$lib/modules/items';

	const itemId = $derived(Number(page.params.id));
	let form = $state({ name: '' });

	$effect(() => {
		untrack(() => {
			void itemStore.fetchItem(itemId);
		});
		return () => itemStore.resetForm();
	});

	$effect(() => {
		if (itemStore.currentItem && !itemStore.formError) {
			form = { name: itemStore.currentItem.name };
		}
	});

	const handleSubmit = async () => {
		const item = await itemStore.updateItem(itemId, form);
		if (item) {
			toast.success('Сохранено');
			goto('/items/' + item.id);
		} else if (itemStore.formError) {
			toast.error(itemStore.formError);
		}
	};

	const handleRetry = () => {
		void itemStore.fetchItem(itemId);
	};
</script>

{#if itemStore.status === 'loading'}
	<Spinner />
{:else if itemStore.status === 'error'}
	<EmptyState variant="error" description={itemStore.error}>
		<Button onclick={handleRetry}>Повторить</Button>
	</EmptyState>
{:else}
	<form onsubmit={handleSubmit}>
		<input bind:value={form.name} />
		<Button type="submit" disabled={itemStore.isSubmitting}>
			{itemStore.isSubmitting ? 'Сохранение...' : 'Сохранить'}
		</Button>
	</form>
{/if}
```

## Query Registry

```typescript
import { queryRegistry } from '$lib/query';

// Инвалидация по тегу (все query с этим тегом)
queryRegistry.invalidateByTag('items');

// Инвалидация по ключу (префиксное совпадение)
queryRegistry.invalidateByKey(['item', id]);

// Сброс всех query (при logout)
queryRegistry.resetAll();
```

## Чек-лист создания нового модуля

1. **types.ts**
   - [ ] `PostStatus` — если есть формы
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
   - [ ] Методы: `fetchItems()`, `refetch()`, `reset()`, `destroy()`

4. **item-store.svelte.ts**
   - [ ] `createQuery<Item, number>` с key `['item']` и params
   - [ ] Состояние формы: `formStatus`, `formError`
   - [ ] Геттеры: `currentItem`, `status`, `error`, `isSubmitting`
   - [ ] Методы: `fetchItem(id)`, `createItem()`, `updateItem()`, `resetForm()`, `destroy()`
   - [ ] Защита от повторных запросов: `if (this._currentId === id) return`

5. **index.ts**
   - [ ] Экспорт обоих сторов
   - [ ] Экспорт типов

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
	await this._query.refetch();
	this.items = this._query.data ?? []; // Дублирование!
}
```

```typescript
// ПРАВИЛЬНО — геттер делегирует
get items(): Item[] {
	return this._query?.data ?? [];
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
// PostStatus — для форм (idle/submitting/success/error)
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
// ПРАВИЛЬНО
async createItem(data) {
	const item = await api.create(data);
	queryRegistry.invalidateByTag('items');
	return item;
}
```

### ❌ Не защищать от повторных запросов

```typescript
// НЕПРАВИЛЬНО — при каждом ререндере будет запрос
async fetchItem(id: number) {
	await this._query?.revalidate(['item', id], id);
}
```

```typescript
// ПРАВИЛЬНО — защита по id
private _currentId: number | null = null;

async fetchItem(id: number) {
	if (this._currentId === id) return;
	await this._query?.revalidate(['item', id], id);
	this._currentId = id;
}
```
