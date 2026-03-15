# Form Patterns

Паттерны работы с формами в SvelteKit: валидация, компоненты, интеграция со сторами.

## Архитектура

```
Module
├── validation.svelte.ts    # Schema, types, EMPTY_FORM, validateForm, transformers
├── *-store.svelte.ts       # mutations + isSubmitting (для component form)
├── *Form.svelte            # Переиспользуемый компонент (опционально)
└── routes/
    └── +page.svelte        # Страница с формой
```

## Подходы к формам

### 1. Simple Form (инлайн в странице)

Для простых форм без переиспользования (login, register).

```typescript
// Страница: routes/(auth)/login/+page.svelte
import { toast } from '@repo/ui';
import {
	authStore,
	EMPTY_LOGIN_FORM,
	validateLoginForm,
	createFormFieldValidator,
	loginFormToDto,
	type LoginFormData
} from '$lib/modules/auth';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { ROUTES } from '$lib/utils';

import '$lib/styles/auth.css';

let form = $state<LoginFormData>({ ...EMPTY_LOGIN_FORM });
const fieldValidator = createFormFieldValidator(validateLoginForm);

$effect(() => {
	return () => {
		fieldValidator.cancel();
		authStore.resetForm();
	};
});

const handleSubmit = async (e: Event) => {
	e.preventDefault();
	if (authStore.isLoggingIn) return;

	const validation = validateLoginForm(form);
	fieldValidator.setErrors(validation.errors);
	if (!validation.isValid) return;

	await authStore.login(loginFormToDto(form));

	if (authStore.isLoginSuccess) {
		toast.success('Добро пожаловать!');
		await goto(resolve(ROUTES.GROUPS), { replaceState: true });
	} else {
		toast.error(authStore.loginError ?? 'Ошибка входа');
	}
};
```

**Характеристики:**
- `EMPTY_FORM` константа для инициализации
- `isSubmitting` из mutation (`authStore.isLoggingIn`)
- Валидация на уровне страницы
- Toast на уровне страницы
- Cleanup через `$effect` с `fieldValidator.cancel()` и `store.resetForm()`
- Форма инлайн в странице

### 2. Component Form (переиспользуемый компонент)

Для CRUD-форм, которые используются в нескольких местах (create/edit).

```typescript
// Страница: routes/(app)/groups/new/+page.svelte
import { groupFormToCreateDto, EMPTY_GROUP_FORM, type GroupFormData } from '$lib/modules/groups';

let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

$effect(() => {
	return () => groupStore.resetForm();
});

const handleSubmit = async () => {
	await groupStore.createGroup(groupFormToCreateDto(form));

	if (groupStore.isCreateSuccess && groupStore.currentGroup) {
		toast.success('Создано');
		await goto(ROUTES.GROUP_DETAIL(groupStore.currentGroup.id));
	} else {
		toast.error(groupStore.createError ?? 'Ошибка');
	}
};

// В template:
<GroupForm
	mode="create"
	bind:form
	onSubmit={handleSubmit}
	isSubmitting={groupStore.isCreating}
/>
```

**Характеристики:**
- `EMPTY_FORM` константа для инициализации
- `isSubmitting` — из mutation store (`isCreating`, `isUpdating`)
- Валидация в компоненте (на submit + onChange)
- Форма вынесена в отдельный компонент

## Валидация

### Утилиты

```typescript
// lib/utils/validation.svelte.ts

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface ValidationResult<T> {
	isValid: boolean;
	data: T | null;
	errors: Record<string, string>;
}

// Создаёт валидатор из Zod-схемы
export const createValidator = <T>(schema: z.ZodSchema<T>) => {
	return (data: unknown): ValidationResult<T> => {
		const result = schema.safeParse(data);
		if (result.success) {
			return { isValid: true, data: result.data, errors: {} };
		}
		return { isValid: false, data: null, errors: extractZodErrors(result.error) };
	};
};

// Real-time валидация полей с debounce и touched tracking
export const createFormFieldValidator = <T extends Record<string, unknown>>(
	validateForm: (data: T) => ValidationResult<T>,
	debounceMs = 1000
) => {
	// ...
	return {
		get errors(): Record<string, string>,
		handleFieldChange(form: T, field: keyof T & string): void,
		setErrors(newErrors: Record<string, string>): void,
		reset(): void,
		cancel(): void
	};
};
```

### Модуль валидации

```typescript
// modules/groups/validation.svelte.ts
import type { Icon } from '@lucide/svelte';
import { z } from 'zod';

import type { GroupCreateDto, GroupResponseDto, GroupUpdateDto } from '$lib/api/generated/types';
import { createValidator } from '$lib/utils/validation.svelte';

// === Schema ===

const optionalUrl = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().url('Некорректный URL').optional()
);

const optionalString = z.preprocess(
	(val) => (val === '' ? undefined : val),
	z.string().max(500, 'Максимум 500 символов').optional()
);

export const groupSchema = z.object({
	name: z.string().min(1, 'Обязательное поле').max(100, 'Максимум 100 символов'),
	description: optionalString,
	avatarUrl: optionalUrl
});

// === Types ===

export type GroupFormData = z.infer<typeof groupSchema>;

export type GroupFormMode = 'create' | 'edit';

export interface GroupFormProps {
	mode?: GroupFormMode;
	title?: string;
	subtitle?: string;
	cardTitle?: string;
	cardSubtitle?: string;
	submitLabel?: string;
	submitIcon?: typeof Icon;
	onSubmit?: () => void | Promise<void>;
	form?: GroupFormData;
	isSubmitting?: boolean;
}

// === Constants ===

export const EMPTY_GROUP_FORM: GroupFormData = {
	name: '',
	description: '',
	avatarUrl: ''
};

// === Validation ===

export const validateGroupForm = createValidator(groupSchema);

// === Transformers ===

export const groupFormToCreateDto = (form: GroupFormData): GroupCreateDto => ({
	name: form.name,
	description: form.description || undefined,
	avatarUrl: form.avatarUrl || undefined
});

export const groupFormToUpdateDto = (form: GroupFormData): GroupUpdateDto => ({
	name: form.name || undefined,
	description: form.description || undefined,
	avatarUrl: form.avatarUrl || undefined
});

export const groupFormFromEntity = (group: GroupResponseDto): GroupFormData => ({
	name: group.name ?? '',
	description: group.description ?? '',
	avatarUrl: group.avatarUrl ?? ''
});
```

### Экспорт из модуля

```typescript
// modules/groups/index.ts
export { groupsStore } from './groups-store.svelte';
export { groupStore } from './group-store.svelte';

export {
	EMPTY_GROUP_FORM,
	groupFormToCreateDto,
	groupFormToUpdateDto,
	groupFormFromEntity,
	type GroupFormData,
	type GroupFormMode,
	type GroupFormProps
} from './validation.svelte';

export { default as GroupForm } from './GroupForm.svelte';
```

## Компонент формы

### Структура

```svelte
<script lang="ts">
	import { Button, Card, Input, Textarea } from '@repo/ui';
	import { createFormFieldValidator } from '$lib/utils';
	import { validateGroupForm, EMPTY_GROUP_FORM, type GroupFormProps } from './validation.svelte';

	import '$lib/styles/group-form.css';

	let {
		mode = 'create',
		submitLabel = mode === 'create' ? 'Создать' : 'Сохранить',
		onSubmit,
		form = $bindable({ ...EMPTY_GROUP_FORM }),
		isSubmitting = false
	}: GroupFormProps = $props();

	const fieldValidator = createFormFieldValidator(validateGroupForm);

	$effect(() => {
		return () => fieldValidator.reset();
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (isSubmitting) return;

		const validation = validateGroupForm(form);
		fieldValidator.setErrors(validation.errors);

		if (!validation.isValid) return;
		await onSubmit?.();
	};
</script>

<div class="form-page">
	<Card variant="outlined" class="form-card">
		{#snippet header()}
			<div class="form-card-header">
				<h2 class="form-card-title">Данные</h2>
			</div>
		{/snippet}

		<form class="form-fields" onsubmit={handleSubmit}>
			<Input
				label="Название"
				bind:value={form.name}
				error={fieldValidator.errors.name}
				disabled={isSubmitting}
				onChange={() => fieldValidator.handleFieldChange(form, 'name')}
			/>

			<Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
				{submitLabel}
			</Button>
		</form>
	</Card>
</div>
```

### Ключевые моменты

1. **Двусторонняя привязка:** `form = $bindable({ ...EMPTY_FORM })` для связи с родителем
2. **Валидация на submit:** `validateGroupForm(form)` + `fieldValidator.setErrors()`
3. **Валидация на change:** `onChange={() => fieldValidator.handleFieldChange(form, 'name')}`
4. **Защита от двойного сабмита:** `if (isSubmitting) return;`
5. **Cleanup:** `$effect(() => return () => fieldValidator.reset())`

## Страницы с формами

### Create

```svelte
<script lang="ts">
	import { toast } from '@repo/ui';
	import {
		GroupForm,
		groupStore,
		EMPTY_GROUP_FORM,
		groupFormToCreateDto,
		type GroupFormData
	} from '$lib/modules/groups';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/utils';

	import '$lib/styles/group-form.css';

	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });

	$effect(() => {
		return () => groupStore.resetForm();
	});

	const handleSubmit = async () => {
		await groupStore.createGroup(groupFormToCreateDto(form));

		if (groupStore.isCreateSuccess) {
			toast.success('Группа создана');
			await goto(resolve(ROUTES.GROUP_DETAIL(groupStore.currentGroup!.id)));
		} else {
			toast.error(groupStore.createError ?? 'Ошибка');
		}
	};
</script>

<GroupForm mode="create" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isCreating} />
```

### Edit

```svelte
<script lang="ts">
	import { Button, EmptyState, Spinner, toast } from '@repo/ui';
	import { untrack } from 'svelte';
	import {
		GroupForm,
		groupStore,
		EMPTY_GROUP_FORM,
		groupFormToUpdateDto,
		groupFormFromEntity,
		type GroupFormData
	} from '$lib/modules/groups';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ROUTES } from '$lib/utils';

	import '$lib/styles/group-form.css';
	import '$lib/styles/page-states.css';

	const groupId = $derived(Number(page.params.id));
	let form = $state<GroupFormData>({ ...EMPTY_GROUP_FORM });
	let isFormInitialized = $state(false);

	$effect(() => {
		untrack(() => {
			void groupStore.fetchGroup(groupId);
		});
		return () => {
			groupStore.resetForm();
			isFormInitialized = false;
		};
	});

	$effect(() => {
		if (groupStore.currentGroup && !groupStore.updateError && !isFormInitialized) {
			form = groupFormFromEntity(groupStore.currentGroup);
			isFormInitialized = true;
		}
	});

	const handleSubmit = async () => {
		await groupStore.updateGroup(groupId, groupFormToUpdateDto(form));

		if (groupStore.isUpdateSuccess) {
			toast.success('Сохранено');
			await goto(resolve(ROUTES.GROUP_DETAIL(groupId)));
		} else {
			toast.error(groupStore.updateError ?? 'Ошибка');
		}
	};
</script>

{#if groupStore.isLoading}
	<div class="page-state">
		<Spinner size="lg" />
	</div>
{:else if groupStore.isError}
	<div class="page-state">
		<EmptyState variant="error" description={groupStore.error}>
			<Button onclick={() => groupStore.fetchGroup(groupId)}>Повторить</Button>
		</EmptyState>
	</div>
{:else}
	<GroupForm mode="edit" bind:form onSubmit={handleSubmit} isSubmitting={groupStore.isUpdating} />
{/if}
```

## Обработка ошибок с сервера

### Принцип

| Операция | Где отслеживать | Как показывать |
|----------|-----------------|----------------|
| **Mutation** (формы) | Component | `toast.error` |
| **Query** (загрузка данных) | Store → Component | `EmptyState` в UI |

### Унифицированный паттерн для mutation

**ВСЕГДА используй `isSuccess` из store, НЕ проверяй возвращаемое значение:**

```typescript
const handleSubmit = async () => {
    await store.createItem(data);

    if (store.isCreateSuccess) {
        toast.success('Создано');
        await goto('/items/' + store.currentItem?.id);
    } else {
        toast.error(store.createError ?? 'Ошибка');
    }
};
```

**Почему НЕЛЬЗЯ проверять `if (result)`:**

```typescript
// ❌ НЕПРАВИЛЬНО — ломается при void / 204 No Content
const result = await store.deleteItem(id);
if (result) { ... }  // result всегда null/undefined!

// ✅ ПРАВИЛЬНО — работает для всех случаев
await store.deleteItem(id);
if (store.isDeleteSuccess) {
    toast.success('Удалено');
} else {
    toast.error(store.deleteError ?? 'Ошибка удаления');
}
```

**Причины:**
- Мутация может возвращать `void` (204 No Content)
- Мутация может возвращать `null` как валидный результат
- `isSuccess` работает корректно во всех случаях

### Query (загрузка данных) — toast НЕ нужен

```svelte
{#if store.isError}
    <EmptyState variant="error" description={store.error}>
        <Button onclick={() => store.fetch()}>Повторить</Button>
    </EmptyState>
{:else}
    <!-- форма -->
{/if}
```

### toError-трансформер НЕ нужен

HTTP-клиент уже генерирует правильные ошибки с `getErrorMessage()`:

```
HttpError → body.message || 'HTTP 400'
NetworkError → 'Ошибка сети'
RetryError → 'Ошибка после N попыток'
```

Store делегирует через `BaseStore._extractErrorMessage(error, fallback)`.

## Интеграция со сторами

### Store с mutations

```typescript
// modules/groups/group-store.svelte.ts
class GroupStore extends BaseStore {
	private readonly _createMutation: MutationResult<GroupResponseDto, GroupCreateDto>;
	private readonly _updateMutation: MutationResult<GroupResponseDto, { id: number; data: GroupUpdateDto }>;

	constructor() {
		super();

		this._createMutation = createMutation<GroupResponseDto, GroupCreateDto>({
			key: ['group', 'create'],
			tags: ['groups'],
			mutator: createGroupApi,
			debug: !__IS_PROD__
		});

		this._updateMutation = createMutation<GroupResponseDto, { id: number; data: GroupUpdateDto }>({
			key: ['group', 'update'],
			tags: ['groups'],
			mutator: ({ id, data }) => updateGroupApi(id, data),
			invalidateKeys: (_, { id }) => [['group', id]],
			debug: !__IS_PROD__
		});
	}

	// Create
	get isCreating(): boolean {
		return this._createMutation.isSubmitting;
	}

	get createError(): string | null {
		return this._extractErrorMessage(this._createMutation.error, 'Ошибка создания');
	}

	async createGroup(data: GroupCreateDto): Promise<GroupResponseDto | null> {
		return this._createMutation.mutate(data);
	}

	// Update
	get isUpdating(): boolean {
		return this._updateMutation.isSubmitting;
	}

	get updateError(): string | null {
		return this._extractErrorMessage(this._updateMutation.error, 'Ошибка обновления');
	}

	async updateGroup(id: number, data: GroupUpdateDto): Promise<GroupResponseDto | null> {
		return this._updateMutation.mutate({ id, data });
	}

	resetForm(): void {
		this._createMutation.reset();
		this._updateMutation.reset();
	}
}
```

### Store с mutations (Simple Form)

```typescript
// modules/auth/store.svelte.ts
class AuthStore extends BaseStore {
	private readonly _query: QueryResult<UserResponseDto>;
	private readonly _loginMutation: MutationResult<void, AuthLoginDto>;

	constructor() {
		super();

		this._query = createQuery<UserResponseDto>({
			key: ['currentUser'],
			tags: ['user'],
			fetcher: (signal) => getCurrentUser(signal),
			debug: !__IS_PROD__
		});

		this._loginMutation = createMutation<void, AuthLoginDto>({
			key: ['auth', 'login'],
			tags: ['user'],
			mutator: async (data) => {
				await apiLogin(data);
			},
			debug: !__IS_PROD__
		});
	}

	// === Login mutation ===

	get isLoggingIn(): boolean {
		return this._loginMutation.isSubmitting;
	}

	get isLoginSuccess(): boolean {
		return this._loginMutation.isSuccess;
	}

	get loginError(): string | null {
		if (!this._loginMutation.error) return null;
		return this._extractErrorMessage(this._loginMutation.error, 'Ошибка входа');
	}

	async login(data: AuthLoginDto): Promise<void> {
		await this._loginMutation.mutate(data);
	}

	resetForm(): void {
		this._loginMutation.reset();
	}
}
```

## Константы

```typescript
// lib/utils/config.ts
export const DEBOUNCE = {
	AVATAR_NAME: 300,       // Debounce для превью аватара
	FORM_VALIDATION: 1000   // Debounce для валидации полей
} as const;
```

## Чек-лист создания формы

### 1. validation.svelte.ts

- [ ] Zod-схема с сообщениями об ошибках на русском
- [ ] `optionalUrl`, `optionalString` препроцессоры для опциональных полей
- [ ] `FormData` тип через `z.infer`
- [ ] `FormMode` тип (`'create' | 'edit'`)
- [ ] `FormProps` интерфейс для компонента
- [ ] `EMPTY_FORM` константа
- [ ] `validateForm` через `createValidator(schema)`
- [ ] `formToCreateDto` трансформер
- [ ] `formToUpdateDto` трансформер
- [ ] `formFromEntity` трансформер

### 2. Компонент (для Component Form)

- [ ] Импорт CSS: `import '$lib/styles/xx-form.css'`
- [ ] `$bindable` для `form`
- [ ] `fieldValidator = createFormFieldValidator(validateForm)`
- [ ] `handleSubmit` с валидацией на submit
- [ ] `onChange={() => fieldValidator.handleFieldChange(form, 'field')}` для каждого поля
- [ ] `disabled={isSubmitting}` для полей
- [ ] `loading={isSubmitting}` для кнопки
- [ ] Cleanup в `$effect`
- [ ] Контейнер `<div class="form-page">`
- [ ] Card: `variant="outlined"` + `class="form-card"`
- [ ] Форма: `<form class="form-fields">`

### 3. Страница

- [ ] Импорт CSS: `import '$lib/styles/xx-form.css'`
- [ ] `let form = $state<FormData>({ ...EMPTY_FORM })`
- [ ] Для edit: `isFormInitialized` флаг + `$effect` для заполнения из store через `formFromEntity`
- [ ] `$effect` с cleanup: `return () => { fieldValidator.cancel(); store.resetForm(); }`
- [ ] `handleSubmit` вызывает store-метод с `formToCreateDto`/`formToUpdateDto`
- [ ] `toast.success` при успехе
- [ ] `toast.error(store.xxxError ?? 'Сообщение')` при неудаче
- [ ] Для edit: `EmptyState` при ошибке загрузки данных

### 4. Store (для Component Form)

- [ ] `createMutation` для create
- [ ] `createMutation` для update с `invalidateKeys`
- [ ] Геттеры: `isCreating`, `createError`, `isUpdating`, `updateError`
- [ ] Методы: `createGroup()`, `updateGroup()`, `resetForm()`

## Эталонные реализации

| Тип | Модуль | Файлы |
|-----|--------|-------|
| Simple Form (login) | auth | `validation.svelte.ts`, `store.svelte.ts`, `routes/(auth)/login/+page.svelte` |
| Simple Form (register) | auth | `validation.svelte.ts`, `store.svelte.ts`, `routes/(auth)/register/+page.svelte` |
| Component Form | groups | `validation.svelte.ts`, `GroupForm.svelte`, `group-store.svelte.ts`, `routes/(app)/groups/*/` |

## Что НЕ делать

### ❌ Валидация без debounce

```typescript
// НЕПРАВИЛЬНО — валидация на каждый символ
onChange={() => {
	const result = validateForm(form);
	errors = result.errors;
}}
```

```typescript
// ПРАВИЛЬНО — через fieldValidator с debounce
onChange={() => fieldValidator.handleFieldChange(form, 'email')}
```

### ❌ Дублирование состояния

```typescript
// НЕПРАВИЛЬНО — дублирование isLoading
let isLoading = $state(false);
// ... потом
isLoading = groupStore.isCreating;
```

```typescript
// ПРАВИЛЬНО — использовать isSubmitting из store
isSubmitting={groupStore.isCreating}
```

### ❌ Забывать cleanup

```typescript
// НЕПРАВИЛЬНО — нет cleanup
$effect(() => {
	void store.fetchItem(id);
});
```

```typescript
// ПРАВИЛЬНО — cleanup возвращает функция
$effect(() => {
	void store.fetchItem(id);
	return () => store.resetForm();
});
```

### ❌ Не преобразовывать пустые строки

```typescript
// НЕПРАВИЛЬНО — пустая строка уйдёт на backend
await store.createGroup(form);
```

```typescript
// ПРАВИЛЬНО — преобразовать пустые строки в undefined
await store.createGroup({
	name: form.name,
	description: form.description || undefined,
	avatarUrl: form.avatarUrl || undefined
});
```

### ❌ Использовать PostStatus вместо булевых флагов

```typescript
// НЕПРАВИЛЬНО — сравнение со строкой
{#if store.createStatus === 'submitting'}
```

```typescript
// ПРАВИЛЬНО — булевы флаги
{#if store.isCreating}
```

### ❌ Проверять возвращаемое значение mutation

```typescript
// НЕПРАВИЛЬНО — ломается при void / 204 No Content
const result = await store.createItem(data);
if (result) {
    toast.success('Создано');
}
```

```typescript
// ПРАВИЛЬНО — использовать isSuccess
await store.createItem(data);
if (store.isCreateSuccess) {
    toast.success('Создано');
} else {
    toast.error(store.createError ?? 'Ошибка');
}
```
