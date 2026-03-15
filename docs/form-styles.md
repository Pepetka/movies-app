# Form Styles

Стандартизированные стили и структура форм в приложении.

## Архитектура CSS

```
styles/
├── form-base.css      # Базовые стили (общие для всех форм)
├── auth.css           # Auth-специфичные (logo, benefits, password)
├── group-form.css     # Group-специфичные (avatar-header)
├── page-states.css    # Loading/error состояния
└── animations.css     # fadeInUp анимация
```

**Принцип:** `form-base.css` содержит все общие стили. Специфичные файлы только добавляют уникальные классы.

## Базовые классы (form-base.css)

| Класс | Описание |
|-------|----------|
| `.form-page` | Контейнер страницы формы |
| `.form-branding` | Заголовок страницы с анимацией |
| `.form-title` | Заголовок (bold, xl → 2xl → 3xl) |
| `.form-subtitle` | Подзаголовок (max-width: 280px) |
| `.form-card` | Карточка формы (max-width: 400px) |
| `.form-card-header` | Header карточки (centered) |
| `.form-card-title` | Заголовок карточки |
| `.form-card-subtitle` | Подзаголовок карточки |
| `.form-fields` | Контейнер полей (gap: var(--space-1)) |
| `.form-footer` | Футер со ссылками |

**Исходный файл:** [`apps/web/src/lib/styles/form-base.css`](../../apps/web/src/lib/styles/form-base.css)

**Ключевые стили:**
- `.form-branding` — `fadeInUp` анимация 0.5s, центрирование
- `.form-card` — `max-width: 400px`, `fadeInUp` 0.4s с задержкой 0.1s
- `.form-fields` — `gap: var(--space-1)`, flex column
- `.form-title` — responsive: xl → 2xl (480px) → 3xl (768px)

## Константы

| Значение | Описание |
|----------|----------|
| `400px` | Максимальная ширина формы (card) |
| `280px` | Максимальная ширина subtitle |
| `100%` | Ширина на мобильных устройствах |

## Типы форм

### 1. Auth Form (login, register)

Центрированная форма с брендингом для неавторизованных пользователей.

**Импорт:** `$lib/styles/auth.css` (включает form-base.css)

**Структура:**

```
.form-page.auth-page
├── .form-branding
│   ├── .auth-logo-link
│   │   ├── .auth-logo (иконка в градиенте)
│   │   └── .auth-app-name
│   └── .auth-tagline
└── .form-card
    ├── Card.header → .form-card-header
    ├── .auth-benefits (опционально)
    ├── form.form-fields
    └── Card.footer → .form-footer
```

**Использование:**

```svelte
<script lang="ts">
	import '$lib/styles/auth.css';
</script>

<div class="form-page auth-page">
	<div class="form-branding">
		<a href={ROUTES.HOME} class="auth-logo-link">
			<div class="auth-logo"><Film /></div>
			<h1 class="auth-app-name">Movies App</h1>
		</a>
		<p class="auth-tagline">Смотрите фильмы вместе с друзьями</p>
	</div>

	<Card variant="outlined" size="responsive" class="form-card">
		{#snippet header()}
			<div class="form-card-header">
				<h2 class="form-card-title">Вход</h2>
				<p class="form-card-subtitle">Войдите в свой аккаунт</p>
			</div>
		{/snippet}

		<form class="form-fields" onsubmit={handleSubmit}>
			<!-- поля -->
		</form>

		{#snippet footer()}
			<div class="form-footer">
				<p>Нет аккаунта? <a href={ROUTES.REGISTER}>Зарегистрироваться</a></p>
			</div>
		{/snippet}
	</Card>
</div>
```

**Специфичные классы:**
- `.auth-logo`, `.auth-logo-link`, `.auth-app-name`, `.auth-tagline` — брендинг
- `.auth-benefits`, `.auth-benefit` — блок преимуществ (register)
- `.password-field`, `.password-requirements` — поле пароля с требованиями

---

### 2. Module Form (create/edit сущностей)

Формы внутри приложения с TopBar и навигацией.

**Импорт:** `$lib/styles/group-form.css` (включает form-base.css)

**Структура:**

```
.form-page
├── .form-branding
│   ├── .xx-form-avatar-header (или другая иконка)
│   ├── .form-title
│   └── .form-subtitle
└── .form-card
    ├── Card.header → .form-card-header
    └── form.form-fields
```

**Использование:**

```svelte
<script lang="ts">
	import '$lib/styles/group-form.css';
</script>

<div class="form-page">
	<div class="form-branding">
		<div class="group-form-avatar-header">
			<Avatar src={form.avatarUrl} name={form.name} size="xl" />
		</div>
		<h1 class="form-title">Создание группы</h1>
		<p class="form-subtitle">Соберите друзей для совместных просмотров</p>
	</div>

	<Card variant="outlined" class="form-card">
		{#snippet header()}
			<div class="form-card-header">
				<h2 class="form-card-title">Данные группы</h2>
				<p class="form-card-subtitle">Заполните информацию</p>
			</div>
		{/snippet}

		<form class="form-fields" onsubmit={handleSubmit}>
			<Input label="Название" bind:value={form.name} />
			<Textarea label="Описание" bind:value={form.description} />
			<Divider label="Настройки" class="group-form-divider" />
			<Input label="Изображение" bind:value={form.avatarUrl} />
			<Button type="submit" variant="primary" fullWidth>Создать</Button>
		</form>
	</Card>
</div>
```

**Специфичные классы (group-form.css):**
- `.group-form-avatar-header` — аватар с hover эффектом
- `.group-form-divider` — отступ после разделителя

---

### 3. Inline Form (простые формы)

Минимальная форма без отдельной страницы.

```svelte
<Card variant="outlined" size="responsive">
	<form class="form-fields" onsubmit={handleSubmit}>
		<Input label="Название" bind:value={form.name} />
		<Button type="submit" variant="primary" fullWidth>Сохранить</Button>
	</form>
</Card>
```

## Card API

Компонент `Card` из `@repo/ui`:

| Prop | Значения | По умолчанию |
|------|----------|--------------|
| `variant` | `elevated`, `outlined`, `filled` | `elevated` |
| `size` | `sm`, `md`, `lg`, `responsive` | `responsive` |
| `class` | `string` | — |
| `header` | `Snippet` — `{#snippet header()}...{/snippet}` | — |
| `footer` | `Snippet` — `{#snippet footer()}...{/snippet}` | — |

**Размеры (padding):**

| Size | Header/Footer | Body |
|------|---------------|------|
| `responsive` | sm → md → lg | sm → md → lg |

**Breakpoints:**
- `< 480px` → sm
- `480px - 767px` → md
- `≥ 768px` → lg

## Состояния страницы

Для edit-страниц с загрузкой данных:

```svelte
<script lang="ts">
	import '$lib/styles/page-states.css';
</script>

{#if store.isLoading}
	<div class="page-state">
		<Spinner size="lg" />
	</div>
{:else if store.isError}
	<div class="page-state">
		<p class="page-state__error-message">{store.error}</p>
		<button class="page-state__retry-button" onclick={handleRetry}>Повторить</button>
	</div>
{:else}
	<!-- форма -->
{/if}
```

## Анимации

Все формы используют `fadeInUp` из `animations.css`:

```css
@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(16px); }
	to { opacity: 1; transform: translateY(0); }
}
```

**Применение:**
- `.form-branding`: `0.5s ease-out backwards`
- `.form-card`: `0.4s ease-out 0.1s backwards`

## Чек-лист создания новой формы

### 1. Создать CSS файл (если новый модуль)

```css
/* styles/xx-form.css */
@import './form-base.css';

/* Только специфичные классы */
.xx-form-icon-header {
	/* ... */
}
```

### 2. Страница/компонент

- [ ] Импорт CSS: `$lib/styles/xx-form.css`
- [ ] Контейнер: `<div class="form-page">`
- [ ] Брендинг: `<div class="form-branding">` + `.form-title` + `.form-subtitle`
- [ ] Card: `variant="outlined"` + `class="form-card"`
- [ ] Header: `.form-card-header` + `.form-card-title` + `.form-card-subtitle`
- [ ] Форма: `<form class="form-fields">`
- [ ] Footer (если нужен): `.form-footer`

### 3. Для edit-страниц

- [ ] Состояния через `page-states.css`
- [ ] Cleanup в `$effect`

## Эталонные реализации

| Тип | Файлы |
|-----|-------|
| Auth Form | `routes/(auth)/login/+page.svelte`, `styles/auth.css` |
| Auth Form (register) | `routes/(auth)/register/+page.svelte`, `styles/auth.css` |
| Module Form | `modules/groups/GroupForm.svelte`, `styles/group-form.css` |
| Base styles | `styles/form-base.css` |

## Что НЕ делать

### ❌ Дублировать базовые стили

```css
/* НЕПРАВИЛЬНО — дублирование */
.xx-form-branding {
	display: flex;
	flex-direction: column;
	animation: fadeInUp 0.5s ease-out backwards;
}
```

```css
/* ПРАВИЛЬНО — использовать form-base.css */
@import './form-base.css';
/* только специфичные классы */
```

### ❌ Разные максимальные ширины

```css
/* НЕПРАВИЛЬНО */
.xx-form-card { max-width: 450px; }
```

```css
/* ПРАВИЛЬНО — использовать .form-card из base */
<Card class="form-card">
```

### ❌ Inline стили для layout

```svelte
<!-- НЕПРАВИЛЬНО -->
<Card style="max-width: 400px">
```

```svelte
<!-- ПРАВИЛЬНО -->
<Card class="form-card">
```

### ❌ Разные gap между полями

```css
/* НЕПРАВИЛЬНО */
.xx-form-fields { gap: var(--space-3); }
```

```css
/* ПРАВИЛЬНО — использовать .form-fields из base */
<form class="form-fields">
```
