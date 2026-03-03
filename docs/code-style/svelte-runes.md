# Svelte 5 Runes

## Обзор

| Rune         | Использование                          |
| ------------ | -------------------------------------- |
| `$state()`   | Реактивное состояние                   |
| `$state.raw()` | Без глубокой реактивности (DOM refs) |
| `$derived()` | Вычисляемое значение                   |
| `$effect()`  | Побочные эффекты, подписки            |
| `$props()`   | Входные параметры компонента          |
| `$bindable()` | Двусторонняя привязка в props        |

## $state

```typescript
// Реактивное состояние
let isOpen = $state(false);
let items = $state<Item[]>([]);

// Без глубокой реактивности (для DOM refs, больших объектов)
let containerRef = $state.raw<HTMLDivElement | null>(null);
let _cache = $state.raw<Map<string, Data>>(new Map());
```

## $derived

```typescript
// Простое вычисление
let hasValue = $derived(value !== null && value !== undefined);
let isLabelFloating = $derived(isFocused || isOpen || hasValue);

// С зависимостями (автоматически отслеживаются)
let filteredItems = $derived(items.filter(item => item.active));
let formattedDate = $derived(value ? formatDate(value, locale) : '');
```

## $effect

```typescript
// Базовый эффект
$effect(() => {
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
});

// С cleanup
$effect(() => {
  if (isOpen) {
    const controller = new AbortController();
    document.addEventListener('click', handleClickOutside, { signal: controller.signal });
    return () => controller.abort();
  }
});

// Реактивность к изменениям
$effect(() => {
  // Выполнится при изменении userId или groupId
  void fetchMemberData(userId, groupId);
});
```

## $props

```typescript
// Деструктуризация с defaults
let {
  label,
  value = $bindable(null),
  size = 'md',
  disabled = false,
  error = false,
  class: className,
  ...restProps
}: IProps = $props();
```

## $bindable

```typescript
// В типах
export interface IProps {
  value?: Date | null;
}

// В компоненте - двусторонняя привязка
let { value = $bindable(null) }: IProps = $props();

// Использование родителем
<DatePicker bind:value={selectedDate} />
```

## Паттерны

### Состояние + Derived

```typescript
let isOpen = $state(false);
let isFocused = $state(false);
let hasValue = $derived(value !== null);

let showClearIcon = $derived(
  clearable && hasValue && (isHovered || isOpen) && !disabled
);
```

### Effect с условием

```typescript
$effect(() => {
  if (!isOpen) return;

  const controller = new AbortController();
  document.addEventListener('click', handleOutsideClick, { signal: controller.signal });

  return () => controller.abort();
});
```

### Реактивные вычисления

```typescript
let currentMonth = $state(today.getMonth());
let currentYear = $state(today.getFullYear());

const weeks = $derived(calendarLogic.getCalendarGrid(currentYear, currentMonth));
const monthTitle = $derived(dateFormatter.formatMonthYear(currentYear, currentMonth));
```
