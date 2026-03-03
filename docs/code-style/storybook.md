# Storybook

## Базовая структура

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DatePicker from './DatePicker.svelte';

  const { Story } = defineMeta({
    title: 'Components/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
    argTypes: {
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg']
      }
    }
  });

  // Реактивное состояние для интерактивных stories
  let selectedDate = $state<Date | null>(null);
</script>

<Story name="Playground" args={{ label: 'Дата', size: 'md' }} />
```

## Виды Stories

### Playground (базовый)

```svelte
<Story name="Playground" args={{ label: 'Дата', placeholder: 'Выберите дату', size: 'md' }} />
```

### All Sizes / All States

```svelte
<Story name="All Sizes">
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <DatePicker size="sm" label="Small" />
      <DatePicker size="md" label="Medium" />
      <DatePicker size="lg" label="Large" />
    </div>
  {/snippet}
</Story>

<Story name="All States">
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <DatePicker label="Default" />
      <DatePicker label="With value" value={new Date()} />
      <DatePicker label="Disabled" disabled />
      <DatePicker label="Error" error errorMessage="Обязательно" />
    </div>
  {/snippet}
</Story>
```

### Interactive (с состоянием)

```svelte
<Story name="Interactive">
  {#snippet template()}
    <div style="max-width: 300px;">
      <DatePicker
        bind:value={selectedDate}
        label="Выберите дату"
        clearable
      />
      {#if selectedDate}
        <p>Выбрано: {selectedDate.toLocaleDateString('ru-RU')}</p>
      {/if}
    </div>
  {/snippet}
</Story>
```

### In Context (в реальном UI)

```svelte
<Story name="In Context">
  {#snippet template()}
    <div style="max-width: 400px; padding: 32px; background: var(--bg-secondary); border-radius: var(--radius-xl);">
      <h2 style="margin-bottom: 24px;">Бронирование</h2>
      <form style="display: flex; flex-direction: column; gap: 16px;">
        <DatePicker bind:value={checkInDate} label="Заезд" />
        <DatePicker bind:value={checkOutDate} label="Выезд" />
        <Button type="submit">Забронировать</Button>
      </form>
    </div>
  {/snippet}
</Story>
```

## Snippets

Все stories с кастомным markup используют `#snippet template()`:

```svelte
<Story name="Custom">
  {#snippet template()}
    <!-- Кастомный markup -->
  {/snippet}
</Story>
```

## Styling в Stories

```svelte
<!-- Inline стили для layout -->
<div style="display: flex; flex-direction: column; gap: 16px;">
  ...
</div>

<!-- CSS переменные для темизации -->
<div style="background: var(--bg-secondary); padding: var(--space-4);">
  ...
</div>
```

## Best Practices

1. **Одна story - одна концепция** (All Sizes, All States, Interactive)
2. **Описание через label** - что демонстрирует story
3. **Реальные данные** - правдоподобные примеры
4. **Accessibility** - демонстрация keyboard navigation
5. **Ограничение ширины** - `max-width: 300px` для form components
