# UI (Svelte 5 Components)

## Структура компонента

```svelte
<script lang="ts">
  // 1. Внешние импорты
  import { Calendar, X } from '@lucide/svelte';

  // 2. Локальные импорты
  import { useDateFormatter } from './hooks';
  import type { IProps } from './DatePicker.types.svelte';

  // 3. Props деструктуризация
  let {
    label,
    value = $bindable(null),
    size = 'md',
    disabled = false,
    error = false,
    errorMessage,
    helper,
    class: className,
    ...restProps
  }: IProps = $props();

  // 4. Константы (ID для accessibility)
  const inputId = crypto.randomUUID();
  const errorId = crypto.randomUUID();

  // 5. Реактивное состояние
  let isOpen = $state(false);
  let isFocused = $state(false);
  let containerRef = $state.raw<HTMLDivElement | null>(null);

  // 6. Derived state
  let hasValue = $derived(value !== null && value !== undefined);
  let isLabelFloating = $derived(isFocused || isOpen || hasValue);

  // 7. Effects
  $effect(() => {
    if (isOpen) {
      const controller = new AbortController();
      document.addEventListener('click', handler, { signal: controller.signal });
      return () => controller.abort();
    }
  });

  // 8. Функции-обработчики
  const toggle = () => {
    if (disabled) return;
    isOpen = !isOpen;
  };
</script>

<!-- Markup -->

<style>
  /* Стили */
</style>
```

## Props

```typescript
// Деструктуризация с defaults
let {
  label,                    // Обязательный
  value = $bindable(null),  // Двусторонняя привязка
  size = 'md',              // Default value
  disabled = false,
  class: className,         // Переименование
  ...restProps              // Остальные HTML атрибуты
}: IProps = $props();
```

## Types

```typescript
// Union types → type
export type DatePickerSize = 'sm' | 'md' | 'lg';

// Props → interface с расширением HTML атрибутов
export interface IProps extends Omit<HTMLInputAttributes, 'size' | 'value'> {
  label: string;
  value?: Date | null;
  size?: DatePickerSize;
  disabled?: boolean;
  onChange?: (value: Date | null) => void;
}
```

## Организация файлов компонента

```
DatePicker/
  DatePicker.svelte           # Основной компонент
  DatePicker.types.svelte.ts  # Типы (.svelte.ts для $lib алиаса)
  DatePicker.stories.svelte   # Storybook stories
  hooks/
    useDateFormatter.ts
    useCalendarLogic.ts
  components/
    DatePickerDay.svelte
    DatePickerGrid.svelte
```

## Приватные поля

```typescript
// Приватные поля с _префиксом (не в $state, если не нужны в template)
let containerRef = $state.raw<HTMLDivElement | null>(null);

// Или обычные приватные поля
let _abortController: AbortController | null = null;
```
