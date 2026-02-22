# Критерии качества UI-компонентов

> Чеклист для разработки и ревью компонентов на 5 звёзд

---

## Обязательные требования

### 1. Структура файлов

```
ComponentName/
├── ComponentName.svelte         # Основной компонент
├── ComponentName.types.svelte.ts # Типы (IProps, экспортируемые типы)
├── ComponentName.stories.svelte  # Storybook stories
└── index.ts                      # Публичный экспорт
```

---

### 2. API дизайн

| Критерий                 | Требование                                                          | Пример                                                        |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Отдельный файл типов** | `ComponentName.types.svelte.ts`                                     | `Button.types.svelte.ts`                                      |
| **IProps интерфейс**     | Наследовать от `Omit<HTMLAttributes<Element>, 'size' \| 'variant'>` | `interface IProps extends Omit<HTMLButtonAttributes, 'size'>` |
| **Экспорт типов**        | Экспортировать size/variant типы                                    | `export type ButtonSize = 'sm' \| 'md' \| 'lg'`               |
| **Rest props**           | Имя `restProps`                                                     | `const { ...restProps } = $props()`                           |
| **Дефолты**              | Все опциональные props имеют дефолты                                | `size = 'md'`, `variant = 'primary'`                          |
| **$bindable**            | Для value/checked в деструктуризации                                | `let { value = $bindable('') } = $props()`                    |
| **let vs const**         | `let` если есть $bindable, иначе `const`                            | `let { checked = $bindable(false) } = $props()`               |

**Файл типов** (`ComponentName.types.svelte.ts`):

```typescript
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface IProps extends Omit<HTMLButtonAttributes, 'size' | 'variant'> {
	size?: ButtonSize;
	variant?: ButtonVariant;
	loading?: boolean;
	fullWidth?: boolean;
	class?: string;
	children?: Snippet;
}
```

**Файл компонента** (`ComponentName.svelte`):

```svelte
<script lang="ts">
	import type { IProps } from './Button.types.svelte';
	import { Loader2 } from '@lucide/svelte';

	const {
		variant = 'primary',
		size = 'md',
		loading = false,
		fullWidth = false,
		type = 'button',
		disabled,
		class: className,
		children,
		...restProps
	}: IProps = $props();

	const isDisabled = $derived(disabled || loading);
</script>
```

**С $bindable**:

```svelte
<script lang="ts">
	import type { IProps } from './Input.types.svelte';

	let {
		value = $bindable(''),
		size = 'md',
		disabled,
		class: className,
		...restProps
	}: IProps = $props();
</script>
```

---

### 3. Дизайн-токены

| Критерий        | Требование                                                     |
| --------------- | -------------------------------------------------------------- |
| **Все размеры** | Через CSS переменные из `tokens.css`                           |
| **Все отступы** | Через `--space-*` токены                                       |
| **Все цвета**   | Через семантические токены (`--text-*`, `--bg-*`, `--color-*`) |
| **Радиусы**     | Через `--radius-*`                                             |
| **Типографика** | Через `--text-*`, `--font-*`, `--leading-*`                    |
| **Переходы**    | Через `--transition-*`, `--ease-*`                             |

```css
/* ✅ Правильно */
.component {
	padding: var(--space-3) var(--space-4);
	font-size: var(--text-base);
	border-radius: var(--radius-lg);
	transition: background-color var(--transition-fast) var(--ease-out);
}

/* ❌ Неправильно */
.component {
	padding: 12px 16px;
	font-size: 16px;
	border-radius: 8px;
	transition: background-color 150ms;
}
```

---

### 4. Доступность (A11y)

| Критерий                 | Требование                                                     |
| ------------------------ | -------------------------------------------------------------- |
| **Role**                 | Правильный ARIA role (`button`, `switch`, `tablist`, `status`) |
| **aria-label**           | Для интерактивных элементов без видимого текста                |
| **aria-pressed/checked** | Для toggle-элементов                                           |
| **aria-current**         | Для навигации (`page`)                                         |
| **aria-invalid**         | Для форм с ошибками                                            |
| **aria-describedby**     | Связь с helper/error текстом                                   |
| **aria-errormessage**    | Связь с сообщением об ошибке                                   |
| **Disabled**             | Через атрибут, не только класс                                 |
| **Focus-visible**        | Стили для `:focus-visible`                                     |

```css
/* Обязательный стиль для всех интерактивных компонентов */
.component:not(:disabled):focus-visible {
	outline: 2px solid var(--border-focus);
	outline-offset: 2px;
}
```

---

### 5. UX / Mobile-first

| Критерий           | Требование                                               |
| ------------------ | -------------------------------------------------------- |
| **Touch targets**  | Минимум 44x44px для touch-элементов                      |
| **Safe areas**     | `env(safe-area-inset-bottom)` для fixed элементов        |
| **Scroll**         | Поддержка `scrollbar-width: none` для кастомных скроллов |
| **Overflow**       | Обработка длинного текста (ellipsis, wrap)               |
| **Loading states** | Для асинхронных операций                                 |
| **Error states**   | Визуальная индикация ошибок                              |

---

### 6. Стиль кода

| Критерий                 | Требование                                         |
| ------------------------ | -------------------------------------------------- |
| **Класс-префикс**        | `ui-` для всех CSS классов (`ui-btn`, `ui-avatar`) |
| **Svelte 5 runes**       | `$state`, `$derived`, `$effect`, `$props()`        |
| **Структура**            | script → template → style                          |
| **Имена**                | camelCase для JS, kebab-case для CSS классов       |
| **Минимум комментариев** | Только для неочевидной логики                      |

---

### 7. Storybook Stories

#### Обязательный набор stories

| Story                | Обязательность | Когда нужен         | Описание                          |
| -------------------- | -------------- | ------------------- | --------------------------------- |
| **Playground**       | ✅             | Всегда              | Интерактивное окружение с args    |
| **All Sizes**        | ✅             | Если есть size prop | Все размеры в одном месте         |
| **All States**       | ✅             | Всегда              | Normal, disabled, error, loading  |
| **In Context**       | ✅             | Всегда              | 2-3 реальных сценария             |
| **Variant-specific** | ✅             | Если есть variants  | Primary, Secondary, Ghost, Danger |

#### Структура stories файла

```svelte
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Component from './Component.svelte';
	import type { ComponentSize, ComponentVariant } from './Component.types.svelte';

	const { Story } = defineMeta({
		title: 'Components/ComponentName',
		component: Component,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] as ComponentSize[] },
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'ghost'] as ComponentVariant[]
			}
		}
	});
</script>

<!-- 1. Playground - всегда первый -->
<Story name="Playground" args={{ variant: 'primary', size: 'md' }}>Click me</Story>

<!-- 2. All Sizes - все размеры -->
<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<Button variant="primary" size="sm">Small</Button>
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<Button variant="primary" size="md">Medium</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>lg</span
				>
				<Button variant="primary" size="lg">Large</Button>
			</div>
		</div>
	{/snippet}
</Story>

<!-- 3. Variant stories -->
<Story name="Primary">...</Story>
<Story name="Secondary">...</Story>

<!-- 4. States -->
<Story name="Disabled">...</Story>
<Story name="Loading">...</Story>

<!-- 5. In Context - в конце -->
<Story name="In Context">...</Story>
```

#### Правила единообразия

**Именование stories:**

| Тип           | Имя                                       | Пример                        |
| ------------- | ----------------------------------------- | ----------------------------- |
| Интерактивный | `Playground`                              | `<Story name="Playground" />` |
| Размеры       | `All Sizes`                               | Все размеры компонента        |
| Варианты      | `Primary`, `Secondary`, `Ghost`, `Danger` | По имени variant              |
| Состояния     | `Disabled`, `Loading`, `Error State`      | По имени state                |
| Контекст      | `In Context`                              | Реальные сценарии             |

**Стилизация в stories:**

```svelte
<!-- ✅ Правильно - используем токены -->
<div style="padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg);">

<!-- ❌ Неправильно - hardcoded значения -->
<div style="padding: 16px; background: #f5f5f5; border-radius: 8px;">
```

**Структура In Context story:**

```svelte
<Story name="In Context">
	{#snippet template()}
		<div>
			<!-- Сценарий 1: Заголовок + пример -->
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Form Actions</h3>
			<div style="display: flex; gap: 12px; margin-bottom: 24px;">
				<Button variant="primary">Save Changes</Button>
				<Button variant="ghost">Cancel</Button>
			</div>

			<!-- Сценарий 2: Другой контекст -->
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Card Actions</h3>
			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<!-- Контент карточки -->
			</div>
		</div>
	{/snippet}
</Story>
```

#### All Sizes паттерны

**Вертикальный список (для форм):**

```svelte
<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<Input size="sm" label="Name" />
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<Input size="md" label="Name" />
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>lg</span
				>
				<Input size="lg" label="Name" />
			</div>
		</div>
	{/snippet}
</Story>
```

**Горизонтальный ряд (для compact компонентов):**

```svelte
<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; gap: 16px; align-items: center;">
			<Avatar name="Alex" size="xs" />
			<Avatar name="Alex" size="sm" />
			<Avatar name="Alex" size="md" />
			<Avatar name="Alex" size="lg" />
			<Avatar name="Alex" size="xl" />
		</div>
	{/snippet}
</Story>
```

#### All States паттерны

```svelte
<Story name="All States">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 24px;">
				<p style="margin-bottom: 8px; color: var(--text-tertiary); font-size: var(--text-sm);">
					Normal
				</p>
				<Button variant="primary">Click me</Button>
			</div>

			<div style="margin-bottom: 24px;">
				<p style="margin-bottom: 8px; color: var(--text-tertiary); font-size: var(--text-sm);">
					Disabled
				</p>
				<Button variant="primary" disabled>Click me</Button>
			</div>

			<div style="margin-bottom: 24px;">
				<p style="margin-bottom: 8px; color: var(--text-tertiary); font-size: var(--text-sm);">
					Loading
				</p>
				<Button variant="primary" loading>Click me</Button>
			</div>

			<div>
				<p style="margin-bottom: 8px; color: var(--text-tertiary); font-size: var(--text-sm);">
					Error
				</p>
				<Input label="Email" error="Invalid email" />
			</div>
		</div>
	{/snippet}
</Story>
```

#### Полный шаблон stories

```svelte
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
	import type { ButtonSize, ButtonVariant } from './Button.types.svelte';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'ghost', 'danger'] as ButtonVariant[]
			},
			size: { control: 'select', options: ['sm', 'md', 'lg'] as ButtonSize[] },
			loading: { control: 'boolean' },
			disabled: { control: 'boolean' },
			fullWidth: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'primary', size: 'md' }}>Button</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>sm</span
				>
				<Button variant="primary" size="sm">Small</Button>
				<Button variant="secondary" size="sm">Small</Button>
			</div>
			<div style="margin-bottom: 16px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>md</span
				>
				<Button variant="primary" size="md">Medium</Button>
				<Button variant="secondary" size="md">Medium</Button>
			</div>
			<div>
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); margin-right: 12px;"
					>lg</span
				>
				<Button variant="primary" size="lg">Large</Button>
				<Button variant="secondary" size="lg">Large</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Primary">
	{#snippet template()}
		<div>
			<Button variant="primary" size="sm">Small</Button>
			<Button variant="primary" size="md">Medium</Button>
			<Button variant="primary" size="lg">Large</Button>
		</div>
	{/snippet}
</Story>

<Story name="Secondary">
	{#snippet template()}
		<div>
			<Button variant="secondary" size="sm">Small</Button>
			<Button variant="secondary" size="md">Medium</Button>
			<Button variant="secondary" size="lg">Large</Button>
		</div>
	{/snippet}
</Story>

<Story name="Ghost">
	{#snippet template()}
		<div>
			<Button variant="ghost" size="sm">Small</Button>
			<Button variant="ghost" size="md">Medium</Button>
			<Button variant="ghost" size="lg">Large</Button>
		</div>
	{/snippet}
</Story>

<Story name="Danger">
	{#snippet template()}
		<div>
			<Button variant="danger" size="sm">Delete</Button>
			<Button variant="danger" size="md">Delete</Button>
			<Button variant="danger" size="lg">Delete</Button>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div>
			<Button variant="primary" size="sm" disabled>Primary</Button>
			<Button variant="secondary" size="md" disabled>Secondary</Button>
			<Button variant="ghost" size="lg" disabled>Ghost</Button>
			<Button variant="danger" size="md" disabled>Danger</Button>
		</div>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet template()}
		<div>
			<Button variant="primary" size="sm" loading>Primary</Button>
			<Button variant="primary" size="md" loading>Primary</Button>
			<Button variant="primary" size="lg" loading>Primary</Button>
		</div>
	{/snippet}
</Story>

<Story name="Full Width">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Button variant="primary" fullWidth>Full Width Button</Button>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div>
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Form Actions</h3>
			<div style="display: flex; gap: 12px; margin-bottom: 24px;">
				<Button variant="primary">Save Changes</Button>
				<Button variant="ghost">Cancel</Button>
			</div>

			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Delete Confirmation</h3>
			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<p style="margin-bottom: 16px; color: var(--text-secondary);">
					Are you sure you want to delete this item?
				</p>
				<div style="display: flex; gap: 12px;">
					<Button variant="danger">Delete</Button>
					<Button variant="ghost">Cancel</Button>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
```

---

### 8. Публичный экспорт

**index.ts**:

```typescript
export { default as ComponentName } from './ComponentName.svelte';
export * from './ComponentName.types.svelte';
```

**src/lib/index.ts** (добавить):

```typescript
export * from './components/ComponentName';
```

---

## Чеклист для нового компонента

### Создание файлов

- [ ] Создать папку `ComponentName/`
- [ ] Создать `ComponentName.types.svelte.ts` с типами
- [ ] Создать `ComponentName.svelte` с правильным IProps импортом
- [ ] Создать `ComponentName.stories.svelte` со всеми stories
- [ ] Создать `index.ts` с экспортом
- [ ] Добавить экспорт в `src/lib/index.ts`
- [ ] Добавить токены в `tokens.css` (если нужны специфичные)

### Код-ревью

- [ ] Отдельный файл `.types.svelte.ts`
- [ ] IProps с Omit
- [ ] Импорт `from './Component.types.svelte'` (без `.ts`)
- [ ] restProps имя
- [ ] UI-префикс классов
- [ ] Токены вместо hardcoded значений
- [ ] ARIA атрибуты
- [ ] focus-visible стили
- [ ] Disabled state
- [ ] Svelte 5 runes

### Stories

- [ ] Playground
- [ ] All Sizes (если есть size)
- [ ] All States (normal, disabled, error)
- [ ] In Context
- [ ] ArgTypes определены

---

## Полный шаблон компонента

**ComponentName.types.svelte.ts**:

```typescript
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'primary' | 'secondary' | 'ghost';

export interface IProps extends Omit<HTMLButtonAttributes, 'size' | 'variant'> {
	size?: ComponentSize;
	variant?: ComponentVariant;
	disabled?: boolean;
	class?: string;
	children?: Snippet;
}
```

**ComponentName.svelte**:

```svelte
<script lang="ts">
	import type { IProps } from './ComponentName.types.svelte';

	const {
		size = 'md',
		variant = 'primary',
		disabled = false,
		type = 'button',
		class: className,
		children,
		...restProps
	}: IProps = $props();
</script>

<button {type} class={['ui-component', size, variant, className]} {disabled} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.ui-component {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-base);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: background-color var(--transition-fast) var(--ease-out);
	}

	.ui-component:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ui-component:not(:disabled):focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}

	/* Sizes */
	.ui-component.sm {
		padding: var(--space-2) var(--space-3);
	}
	.ui-component.md {
		padding: var(--space-3) var(--space-4);
	}
	.ui-component.lg {
		padding: var(--space-4) var(--space-6);
	}

	/* Variants */
	.ui-component.primary {
		/* ... */
	}
	.ui-component.secondary {
		/* ... */
	}
	.ui-component.ghost {
		/* ... */
	}
</style>
```

**index.ts**:

```typescript
export { default as ComponentName } from './ComponentName.svelte';
export * from './ComponentName.types.svelte';
```

---

## Оценка качества

| Критерий    | 5 звёзд                      | 4 звезды             | 3 звезды              |
| ----------- | ---------------------------- | -------------------- | --------------------- |
| **API**     | Отдельный types файл + Omit  | Minor несоответствия | IProps в том же файле |
| **Tokens**  | 100% через токены            | 1-2 hardcoded        | >2 hardcoded          |
| **A11y**    | Все ARIA + focus-visible     | Отсутствует 1-2      | Отсутствует >2        |
| **UX**      | Touch targets + states       | Missing states       | Нет обработки ошибок  |
| **Stories** | All Sizes + States + Context | Отсутствует 1        | Отсутствует >1        |
