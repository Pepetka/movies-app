# CSS Conventions

## Нейминг (BEM-подобный)

```css
/* Блок */
.ui-datepicker { }
.ui-button { }
.ui-input { }

/* Элемент */
.ui-datepicker-container { }
.ui-datepicker-label { }
.ui-datepicker-icon { }

/* Модификатор (через класс-флаг в parent) */
.ui-datepicker-wrapper.error { }
.ui-datepicker-wrapper.open { }
.ui-datepicker-wrapper.disabled { }

/* Состояния элемента */
.ui-datepicker-label.floating { }
.ui-datepicker-label.focused { }
```

## CSS переменные

```css
.ui-datepicker-container input {
  height: var(--input-md-height);
  padding: var(--input-md-padding);
  font-size: var(--text-base);
  color: var(--text-primary);
  background-color: var(--input-bg);
  border: var(--border-width-thin) solid var(--input-border);
  border-radius: var(--radius-input);
}
```

### Основные переменные

| Категория | Примеры |
| --------- | ------- |
| Colors    | `--color-primary`, `--color-error`, `--text-primary`, `--text-secondary` |
| Spacing   | `--space-1`, `--space-2`, `--input-md-padding` |
| Typography| `--text-sm`, `--text-base`, `--leading-normal` |
| Radius    | `--radius-sm`, `--radius-lg`, `--radius-input`, `--radius-xl` |
| Shadows   | `--shadow-sm`, `--shadow-lg` |
| Borders   | `--border-width-thin`, `--border-primary`, `--border-focus` |
| Z-index   | `--z-popover`, `--z-modal` |

## Порядок стилей

```css
/* 1. Базовые стили блока */
.ui-datepicker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  position: relative;
}

/* 2. Элементы */
.ui-datepicker-container { }
.ui-datepicker-label { }
.ui-datepicker-icon { }

/* 3. Состояния (hover, focus, disabled) */
@media (hover: hover) {
  .ui-datepicker-icon:hover:not(:disabled) { }
}
.ui-datepicker-container input:focus { }
.ui-datepicker-container input:disabled { }

/* 4. Модификаторы блока */
.ui-datepicker-wrapper.error { }
.ui-datepicker-wrapper.open { }

/* 5. Размеры */
.ui-datepicker-wrapper.sm { }
.ui-datepicker-wrapper.lg { }
```

## Hover pattern

Всегда оборачивать hover в `@media (hover: hover)`:

```css
/* Правильно */
@media (hover: hover) {
  .ui-button:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  .ui-datepicker-container input:hover:not(:focus) {
    border-color: var(--text-tertiary);
  }
}

/* Неправильно - hover сработает на touch устройствах */
.ui-button:hover {
  background-color: var(--color-primary-hover);
}
```

## Состояния

```css
/* Focus */
.ui-input:focus {
  border-color: var(--color-primary);
}

/* Focus visible (keyboard navigation) */
.ui-button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Disabled */
.ui-input:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

/* Error */
.ui-datepicker-wrapper.error .ui-input {
  border-color: var(--color-error);
}
```

## Размеры

```css
/* Base (md) */
.ui-datepicker-container input {
  height: var(--input-md-height);
  padding: var(--input-md-padding);
}

/* Small */
.ui-datepicker-wrapper.sm .ui-datepicker-container input {
  height: var(--input-sm-height);
  padding: var(--input-sm-padding);
  font-size: 14px;
}

/* Large */
.ui-datepicker-wrapper.lg .ui-datepicker-container input {
  height: var(--input-lg-height);
  padding: var(--input-lg-padding);
  font-size: 18px;
}
```

## Группировка свойств

```css
.ui-element {
  /* Layout */
  display: flex;
  position: relative;

  /* Box model */
  width: 100%;
  padding: 12px;
  margin: 0;

  /* Typography */
  font-size: var(--text-base);
  color: var(--text-primary);

  /* Visual */
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);

  /* Animation */
  transition: border-color 0.2s ease;
}
```
