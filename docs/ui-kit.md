# Movies App - UI Kit

Документ описывает компоненты интерфейса для mobile-first приложения.

> Все компоненты разрабатываются с приоритетом на мобильные устройства (320px - 480px baseline), с адаптацией для tablet/desktop.

---

## Contents

- [Component Location Legend](#component-location-legend)
- [Design Tokens](#design-tokens)
- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Z-Index](#z-index)
- [Transitions](#transitions)
- [Scrollbar](#scrollbar)
- [Status Indicator](#status-indicator)
- [Navigation](#navigation)
- [Buttons](#buttons)
- [Form Elements](#form-elements)
- [Cards](#cards)
- [Lists](#lists)
- [Feedback](#feedback)
- [Media](#media)
- [Badges & Chips](#badges--chips)
- [Layout](#layout)

---

## Component Location Legend

| Marker | Location | Description |
| ------ | -------- | ----------- |
| ✅ **UI Kit** • ✅ **done** | `packages/ui/` | Реализован в UI Kit |
| ✅ **UI Kit** | `packages/ui/` | Планируется в UI Kit (переиспользуемый) |
| 📱 **App** | `apps/web/` | В приложении (доменно-специфичный) |

---

## Design Tokens

Все дизайн-токены определены как CSS custom properties и доступны глобально.

```css
/* Использование */
padding: var(--space-4);
background: var(--bg-primary);
border-radius: var(--radius-lg);
```

---

## Colors

### Primary Colors

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `--color-primary` | #3B82F6 | #60A5FA | Primary actions, links |
| `--color-primary-hover` | #2563EB | #3B82F6 | Primary hover |
| `--color-primary-active` | #1D4ED8 | #2563EB | Primary active/pressed |

### Semantic Colors

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `--color-secondary` | #6B7280 | #9CA3AF | Secondary text, icons |
| `--color-success` | #22C55E | #4ADE80 | Success states, "watched" |
| `--color-warning` | #F59E0B | #FBBF24 | Warning, "planned" |
| `--color-error` | #EF4444 | #F87171 | Error, destructive |
| `--color-info` | #3B82F6 | #60A5FA | Info, "tracking" |

### Background Colors

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `--bg-primary` | #FFFFFF | #111827 | Main background |
| `--bg-secondary` | #F9FAFB | #1F2937 | Cards, sections |
| `--bg-tertiary` | #F3F4F6 | #374151 | Inputs, disabled |
| `--bg-inverse` | #111827 | #F9FAFB | Inverse background |
| `--bg-overlay` | rgba(0,0,0,0.5) | rgba(0,0,0,0.7) | Modal overlay |

### Text Colors

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `--text-primary` | #111827 | #F9FAFB | Main text |
| `--text-secondary` | #6B7280 | #9CA3AF | Secondary text |
| `--text-tertiary` | #9CA3AF | #6B7280 | Placeholder, hints |
| `--text-inverse` | #FFFFFF | #111827 | On primary bg |
| `--text-link` | #3B82F6 | #60A5FA | Links |

### Border Colors

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `--border-primary` | #E5E7EB | #374151 | Primary borders |
| `--border-secondary` | #D1D5DB | #4B5563 | Secondary borders |
| `--border-focus` | #3B82F6 | #60A5FA | Focus state |

### Status Colors

| Token | Light BG | Light Text | Dark BG | Dark Text | Usage |
| ----- | -------- | ---------- | ------- | --------- | ----- |
| `--status-tracking-*` | #F3F4F6 | #6B7280 | #374151 | #9CA3AF | "Tracking" status |
| `--status-planned-*` | #DBEAFE | #1D4ED8 | #1E3A5F | #60A5FA | "Planned" status |
| `--status-watched-*` | #DCFCE7 | #16A34A | #14532D | #4ADE80 | "Watched" status |

### Component Colors

| Token | Description |
| ----- | ----------- |
| `--card-bg` | Card background |
| `--card-shadow` | Card shadow |
| `--input-bg` | Input background |
| `--input-border` | Input border |
| `--bottom-nav-bg` | Bottom nav background |
| `--bottom-nav-border` | Bottom nav border |

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Token | Size (rem/px) | Weight | Line Height | Usage |
| ----- | ------------ | ------ | ----------- | ----- |
| `text-xs` | 0.75rem / 12px | 400 | - | Captions, badges |
| `text-sm` | 0.875rem / 14px | 400 | - | Body small, meta |
| `text-base` | 1rem / 16px | 400 | - | Body default |
| `text-lg` | 1.125rem / 18px | 500 | - | Emphasis |
| `text-xl` | 1.25rem / 20px | 600 | - | Card titles |
| `text-2xl` | 1.5rem / 24px | 700 | - | Page titles |
| `text-3xl` | 1.875rem / 30px | 700 | - | Hero, large titles |
| `text-4xl` | 2.25rem / 36px | 700 | - | Hero, large titles |

### Font Weights

| Token | Value | Usage |
| ----- | ----- | ----- |
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Medium emphasis |
| `font-semibold` | 600 | Semi-bold |
| `font-bold` | 700 | Bold, headings |

### Line Heights

| Token | Value | Usage |
| ----- | ----- | ----- |
| `leading-tight` | 1.25 | Tight spacing |
| `leading-normal` | 1.5 | Default spacing |
| `leading-relaxed` | 1.625 | Relaxed spacing |

---

## Spacing

### Base Unit: 4px

| Token | Value | Usage |
| ----- | ----- | ----- |
| `space-0` | 0 | No spacing |
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Icon padding, gaps |
| `space-3` | 12px | Button padding (horizontal) |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 20px | List item padding |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Extra large gaps |
| `space-12` | 48px | Page sections |
| `space-16` | 64px | Hero sections |
| `space-20` | 80px | Large spacing |
| `space-24` | 96px | Extra large spacing |

---

## Border Radius

| Token | Value | Usage |
| ----- | ----- | ----- |
| `radius-sm` | 4px | Small radius, buttons |
| `radius-md` | 6px | Medium radius |
| `radius-lg` | 8px | Large radius, cards |
| `radius-xl` | 12px | Extra large radius |
| `radius-2xl` | 16px | 2X large radius |
| `radius-3xl` | 24px | 3X large radius, modals |
| `radius-full` | 9999px | Pill shape, circle |

---

## Shadows

| Token | Value | Usage |
| ----- | ----- | ----- |
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| `shadow-md` | 0 4px 6px -1px rgba(0,0,0,0.1) | Medium elevation |
| `shadow-lg` | 0 10px 15px -3px rgba(0,0,0,0.1) | Large elevation |
| `shadow-xl` | 0 20px 25px -5px rgba(0,0,0,0.1) | Extra large elevation |

---

## Z-Index

| Token | Value | Usage |
| ----- | ----- | ----- |
| `z-dropdown` | 1000 | Dropdowns |
| `z-sticky` | 1020 | Sticky elements |
| `z-fixed` | 1030 | Fixed elements |
| `z-modal-backdrop` | 1040 | Modal backdrop |
| `z-modal` | 1050 | Modals |
| `z-popover` | 1060 | Popovers |
| `z-tooltip` | 1070 | Tooltips |

---

## Transitions

| Token | Value | Usage |
| ----- | ----- | ----- |
| `transition-fast` | 150ms | Fast transitions |
| `transition-base` | 200ms | Base transitions |
| `transition-slow` | 300ms | Slow transitions |
| `ease-in` | cubic-bezier(0.4, 0, 1, 1) | Ease in |
| `ease-out` | cubic-bezier(0, 0, 0.2, 1) | Ease out |
| `ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Ease in out |

---

## Scrollbar

### Scrollbar Dimensions

| Property | Value |
| -------- | ----- |
| Width | 8px |
| Height | 8px |
| Track border-radius | 4px |

### Scrollbar Colors

| Token | Usage |
| ----- | ----- |
| `--bg-secondary` | Track background |
| `--border-secondary` | Thumb background |
| `--text-tertiary` | Thumb hover |

---

## Status Indicator

| Token | Value | Usage |
| ----- | ----- | ----- |
| `status-dot-size` | 8px | Default dot size |
| `status-dot-sm` | 6px | Small dot size |
| `status-dot-lg` | 10px | Large dot size |

---

## Navigation

### BottomNav
✅ **UI Kit** • ✅ **done**

Нижняя навигация (таб-бар).

```
┌──────────┬──────────┬──────────┐
│    🏠    │    👤    │     ⚙️   │
│  Группы  │  Профиль │   Админ  │
└──────────┴──────────┴──────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| items | `NavItem[]` | required | Массив элементов |
| active | `string` | - | ID активного таба |

**NavItem:**
```typescript
interface NavItem {
  id: string;
  label: string;
  icon: string;      // Icon name
  href: string;
  badge?: number;    // Optional notification badge
  hidden?: boolean;  // Conditionally hide (e.g., admin only)
}
```

**Behavior:**
- Fixed bottom, safe-area-inset-bottom
- Active state: primary color icon + label
- Inactive: secondary color
- Height: 56px (iOS) / 80px (Android with gesture bar)

---

### TopBar
✅ **UI Kit** • ✅ **done**

Верхняя панель для вложенных страниц.

```
┌─────────────────────────────────────────┐
│  ←   Название страницы                  │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title | `string` | - | Заголовок |
| showBack | `boolean` | `true` | Показывать кнопку назад |
| backHref | `string` | - | Кастомный URL для назад |
| actions | `Action[]` | - | Кнопки справа |

**Action:**
```typescript
interface Action {
  icon: string;
  label: string;
  onClick: () => void;
}
```

**Behavior:**
- Sticky top
- Height: 56px
- Back button: chevron-left icon
- Title: truncated if too long

---

### Tabs
✅ **UI Kit** • ✅ **done**

Горизонтальные табы для фильтрации.

```
┌────────┬────────────┬─────────┬───────────┐
│  Все   │ К просмотру│  План   │ Смотрели  │
└────────┴────────────┴─────────┴───────────┘
          ▔▔▔▔▔▔▔▔▔▔▔▔
            indicator
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| tabs | `Tab[]` | required | Массив табов |
| active | `string` | - | ID активного таба |
| scrollable | `boolean` | `true` | Horizontal scroll |

**Tab:**
```typescript
interface Tab {
  id: string;
  label: string;
  count?: number;  // Optional badge count
}
```

**Behavior:**
- Horizontal scroll on overflow
- Animated indicator under active tab
- Tap switches tab

---

## Buttons

### Button
✅ **UI Kit** • ✅ **done**

Основная кнопка.

```
┌─────────────────────────┐
│      Button Label       │
└─────────────────────────┘
```

**Variants:**
| Variant | Usage |
| ------- | ----- |
| `primary` | Main actions (submit, save) |
| `secondary` | Secondary actions (cancel) |
| `ghost` | Tertiary actions |
| `destructive` | Dangerous actions (delete) |

**Sizes:**
| Size | Height | Padding | Font | Icon Size |
| ---- | ------ | ------- | ---- | --------- |
| `sm` | 32px | space-2 space-3 (8px 12px) | text-sm (14px) | 16px |
| `md` | 40px | space-3 space-4 (12px 16px) | text-base (16px) | 20px |
| `lg` | 48px | space-4 space-6 (16px 24px) | text-lg (18px) | 24px |
| `full` | 48px | space-4 space-6 (16px 24px) | text-lg (18px) | 24px |

> **Design Tokens:** `--btn-sm-*`, `--btn-md-*`, `--btn-lg-*`

**States:**
- Default
- Hover (desktop only)
- Active / Pressed
- Disabled
- Loading (spinner)

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| variant | `string` | `primary` | Внешний вид |
| size | `string` | `md` | Размер |
| disabled | `boolean` | `false` | Заблокирована |
| loading | `boolean` | `false` | Показать spinner |
| icon | `string` | - | Icon name (optional) |
| iconPosition | `string` | `left` | left / right |
| fullWidth | `boolean` | `false` | Растянуть на всю ширину |

---

### IconButton
✅ **UI Kit** • ✅ **done**

Кнопка только с иконкой.

```
┌──────┐
│  +   │
└──────┘
```

**Sizes:**
| Size | Dimensions |
| ---- | ---------- |
| `sm` | 32x32 |
| `md` | 40x40 |
| `lg` | 48x48 |

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| icon | `string` | required | Icon name |
| size | `string` | `md` | Размер |
| variant | `string` | `ghost` | primary / secondary / ghost |
| label | `string` | required | Accessibility label |

---

### FAB (Floating Action Button)
✅ **UI Kit** • ✅ **done**

Плавающая кнопка действия.

```
    ┌──────┐
    │  +   │  ← FAB
    └──────┘
├─────────────────────────┤
│    Bottom Navigation    │
└─────────────────────────┘
```

**Sizes:**
| Size | Dimensions | Usage |
| ---- | ---------- | ----- |
| `default` | 56x56 | Standard FAB |
| `mini` | 40x40 | Compact FAB |
| `extended` | 48h, auto-width | FAB with label |

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| icon | `string` | required | Icon name |
| label | `string` | - | Text label (extended) |
| size | `string` | `default` | default / mini / extended |
| position | `string` | `bottom-right` | Position on screen |

**Behavior:**
- Fixed position, above BottomNav
- Margin: 16px from edges
- Elevation: shadow-lg
- Optional: hide on scroll

---

## Form Elements

### Input
✅ **UI Kit**

Текстовое поле ввода.

```
┌─────────────────────────────────────────┐
│ Label                                   │  ← Optional label
├─────────────────────────────────────────┤
│ Placeholder text                    👁  │  ← Input with optional icon
└─────────────────────────────────────────┘
│ Helper text or error message            │  ← Helper / error
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type | `string` | `text` | text / email / password / number |
| label | `string` | - | Label above input |
| placeholder | `string` | - | Placeholder text |
| value | `string` | - | Controlled value |
| error | `string` | - | Error message |
| helper | `string` | - | Helper text |
| disabled | `boolean` | `false` | Disabled state |
| icon | `string` | - | Right icon (e.g., eye for password) |
| iconAction | `function` | - | On icon click |

**States:**
- Default
- Focused (primary border)
- Filled
- Error (red border + message)
- Disabled (grey background)

---

### Textarea
✅ **UI Kit**

Многострочное текстовое поле.

```
┌─────────────────────────────────────────┐
│ Label                                   │
├─────────────────────────────────────────┤
│                                         │
│  Multi-line text input...               │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| rows | `number` | `3` | Visible rows |
| maxLength | `number` | - | Max characters |
| autoGrow | `boolean` | `true` | Auto-resize height |

---

### Select
✅ **UI Kit**

Выпадающий список.

```
┌─────────────────────────────────────────┐
│ Label                                   │
├─────────────────────────────────────────┤
│ Selected option                     ▼   │
└─────────────────────────────────────────┘
```

**Mobile Behavior:**
- Tap открывает Bottom Sheet с опциями
- Или нативный `<select>` на iOS/Android

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| options | `Option[]` | required | Массив опций |
| value | `string` | - | Selected value |
| placeholder | `string` | - | Placeholder |

**Option:**
```typescript
interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}
```

---

### Toggle / Switch
✅ **UI Kit**

Переключатель.

```
┌─────────────────────────────────┐
│ Label                      ⬤──  │  ← On
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Label                      ─⬤   │  ← Off
└─────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| checked | `boolean` | `false` | State |
| label | `string` | required | Label text |
| disabled | `boolean` | `false` | Disabled |

---

## Cards

### Card
✅ **UI Kit**

Базовая карточка.

```
┌─────────────────────────────────────────┐
│                                         │
│              Card Content               │
│                                         │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| padding | `string` | `4` | Padding (space-4) |
| shadow | `boolean` | `true` | Show shadow |
| clickable | `boolean` | `false` | Hover/active states |
| onClick | `function` | - | Click handler |

---

### GroupCard
📱 **App**

Карточка группы.

```
┌─────────────────────────────────────────┐
│ ┌──────┐ Название группы                │
│ │ Фото │ Описание группы которое мо...  │
│ └──────┘ 👥 12  🎬 45         [admin]   │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | `number` | Group ID |
| avatar | `string` | Avatar URL |
| name | `string` | Group name |
| description | `string` | Description |
| membersCount | `number` | Members count |
| moviesCount | `number` | Movies count |
| role | `string` | User's role in group |
| onClick | `function` | Card click |

---

### MovieCard
📱 **App**

Карточка фильма (grid).

```
┌─────────────┐
│   [Poster]  │
│             │
├─────────────┤
│ Название    │
│ 2024        │
│ [badge]     │
└─────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | `number` | Movie ID |
| poster | `string` | Poster URL |
| title | `string` | Movie title |
| year | `number` | Release year |
| status | `string` | tracking / planned / watched |
| onClick | `function` | Card click |

**Sizes:**
| Size | Width | Usage |
| ---- | ----- | ----- |
| `sm` | 100px | Compact lists |
| `md` | 140px | Default grid |
| `lg` | 180px | Featured |

---

### MovieCardHorizontal
📱 **App**

Карточка фильма (list).

```
┌─────────────────────────────────────────┐
│ ┌──────┐ Матрица                   [+]  │
│ │      │ 1999 • 8.7                     │
│ └──────┘                                │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | `number` | Movie ID |
| poster | `string` | Poster URL |
| title | `string` | Movie title |
| year | `number` | Release year |
| rating | `number` | Rating |
| added | `boolean` | Already in group |
| onAdd | `function` | Add button click |

---

### UserCard
📱 **App**

Карточка пользователя.

```
┌─────────────────────────────────────────┐
│ ┌──────┐ Иван Петров               [⋮]  │
│ │ 👤   │ ivan@mail.com                  │
│ └──────┘                        [admin] │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| id | `number` | User ID |
| avatar | `string` | Avatar URL |
| name | `string` | User name |
| email | `string` | Email |
| role | `string` | Role (USER/ADMIN or group role) |
| showMenu | `boolean` | Show action menu |
| menuItems | `MenuItem[]` | Menu items |

---

## Lists

### List
✅ **UI Kit**

Контейнер для списка.

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ List Item 1                       ▶ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ List Item 2                       ▶ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| items | `ListItem[]` | List items |
| dividers | `boolean` | Show dividers |

---

### ListItem
✅ **UI Kit**

Элемент списка.

**Variants:**
- Basic (text only)
- With icon/avatar
- With action (button/link)
- With trailing text

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| leading | `VNode` | Avatar, icon, image |
| title | `string` | Primary text |
| subtitle | `string` | Secondary text |
| trailing | `VNode` | Badge, action, chevron |
| onClick | `function` | Click handler |

---

## Feedback

### Toast / Snackbar
✅ **UI Kit**

Краткое уведомление.

```
┌─────────────────────────────────────────┐
│ ✓ Успешно сохранено               [x]   │
└─────────────────────────────────────────┘
```

**Types:**
| Type | Icon | Color |
| ---- | ---- | ----- |
| `success` | check | green |
| `error` | x-circle | red |
| `info` | info | blue |
| `warning` | alert | yellow |

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| message | `string` | required | Message text |
| type | `string` | `info` | Type |
| duration | `number` | `3000` | Auto-hide ms |
| action | `string` | - | Action button text |
| onAction | `function` | - | Action click |

**Behavior:**
- Position: bottom, above BottomNav
- Queue: show one at a time
- Swipe to dismiss

---

### Modal
✅ **UI Kit**

Модальное окно (fullscreen на mobile).

```
┌─────────────────────────────────────────┐
│ Заголовок                          [×]  │
├─────────────────────────────────────────┤
│                                         │
│              Modal Content              │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│            [Action Buttons]             │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title | `string` | - | Modal title |
| open | `boolean` | required | Open state |
| closable | `boolean` | `true` | Show close button |
| fullScreen | `boolean` | `false` | Fullscreen on mobile |

---

### BottomSheet
✅ **UI Kit**

Лист снизу экрана.

```
│                                         │
│              Page Content               │
│                                         │
├─────────────────────────────────────────┤
│ ──────                                  │  ← Handle
│ Sheet Title                             │
│ ─────────────────────────────────────── │
│ Option 1                                │
│ ─────────────────────────────────────── │
│ Option 2                                │
│ ─────────────────────────────────────── │
│ Cancel                                  │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title | `string` | - | Sheet title |
| open | `boolean` | required | Open state |
| snapPoints | `number[]` | - | Snap heights |

**Behavior:**
- Drag handle to resize/dismiss
- Snap to points
- Backdrop tap to close

---

### ConfirmDialog
✅ **UI Kit**

Диалог подтверждения.

```
┌─────────────────────────────────────────┐
│                                         │
│  ⚠️ Удалить группу?                     │
│                                         │
│  Это действие нельзя отменить.          │
│                                         │
├─────────────────────────────────────────┤
│         [Отмена]    [Удалить]           │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| title | `string` | Dialog title |
| message | `string` | Description |
| confirmText | `string` | Confirm button text |
| cancelText | `string` | Cancel button text |
| destructive | `boolean` | Red confirm button |

---

### Loading
✅ **UI Kit**

Индикатор загрузки.

**Spinner:**
```
    ◠◡◝
   ◜   ◝
   ◞   ◟
    ◡◠◟
```

**Skeleton:**
```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                          │
│ ▓▓▓▓▓▓▓▓▓▓                              │
│ ▓▓▓▓▓▓                                  │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| type | `string` | spinner / skeleton |
| size | `string` | sm / md / lg |
| rows | `number` | Skeleton rows |

---

### EmptyState
✅ **UI Kit**

Пустое состояние.

```
┌─────────────────────────────────────────┐
│                                         │
│              [Illustration]             │
│                                         │
│                 Нет групп               │
│    Создайте первую группу для начала    │
│                                         │
│             [Создать группу]            │
│                                         │
└─────────────────────────────────────────┘
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| illustration | `string` | Illustration name |
| title | `string` | Title text |
| description | `string` | Description |
| action | `string` | CTA button text |
| onAction | `function` | CTA click |

---

## Media

### Avatar
✅ **UI Kit** • ✅ **done**

Аватар пользователя или группы.

```
   ┌──────┐
   │  👤  │
   └──────┘
```

**Sizes:**
| Size | Dimensions | Usage |
| ---- | ---------- | ----- |
| `xs` | 24x24 | Inline, compact |
| `sm` | 32x32 | Lists |
| `md` | 48x48 | Cards, list items |
| `lg` | 64x64 | Headers |
| `xl` | 96x96 | Profile pages |

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| src | `string` | Image URL |
| name | `string` | Name (for initials fallback) |
| size | `string` | Avatar size |

**Fallback:**
- First letter(s) of name
- Background color based on name hash

---

### Image / Poster
✅ **UI Kit**

Изображение с lazy loading.

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| src | `string` | Image URL |
| alt | `string` | Alt text |
| ratio | `string` | Aspect ratio (2/3 for posters) |
| skeleton | `boolean` | Show skeleton while loading |

---

## Badges & Chips

### Badge
✅ **UI Kit** • ✅ **done**

Статусный бейдж.

```
[admin]  [moderator]  [member]
```

**Variants:**
| Variant | Color | Usage |
| ------- | ----- | ----- |
| `default` | gray | Neutral |
| `primary` | blue | Primary |
| `success` | green | Success, admin role |
| `warning` | yellow | Warning, moderator |
| `error` | red | Error |

**Sizes:**
| Size | Font | Padding |
| ---- | ---- | ------- |
| `sm` | 10px | 2px 6px |
| `md` | 12px | 4px 8px |

---

### StatusBadge
📱 **App**

Бейдж статуса фильма.

```
[К просмотру]  [План]  [Смотрели]
    серый       синий    зелёный
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| status | `string` | tracking / planned / watched |

---

### Chip
✅ **UI Kit**

Кнопка-фильтр или тег.

```
[✓ Выбрано]  [Не выбрано]
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| label | `string` | Chip text |
| selected | `boolean` | Selected state |
| icon | `string` | Optional icon |

---

## Layout

### Container
✅ **UI Kit**

Контейнер с максимальной шириной.

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| maxWidth | `string` | `480px` | Max width |
| padding | `boolean` | `true` | Horizontal padding |

---

### Grid
✅ **UI Kit**

Сетка для карточек.

**Props:**
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| cols | `number` | `2` | Columns |
| gap | `string` | `3` | Gap size |

**Responsive:**
- Mobile (320px): 2 cols
- Mobile (375px): 2 cols
- Tablet (768px): 3 cols
- Desktop (1024px+): 4 cols

---

### Divider
✅ **UI Kit**

Разделитель.

```
──────────────────────────────────────────
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| inset | `boolean` | Indented from edges |
| vertical | `boolean` | Vertical orientation |

---

### Spacer
✅ **UI Kit**

Отступ.

```html
<Spacer size="4" />
```

**Props:**
| Prop | Type | Description |
| ---- | ---- | ----------- |
| size | `string` | space-1 to space-12 |

---

## Icons

Используем Lucide Icons или Heroicons.

**Часто используемые:**
| Icon | Name | Usage |
| ---- | ---- | ----- |
| 🏠 | `home` | Groups tab |
| 👤 | `user` | Profile tab |
| ⚙️ | `settings` | Settings, Admin tab |
| ← | `chevron-left` | Back |
| → | `chevron-right` | Forward |
| + | `plus` | Add, FAB |
| × | `x` | Close |
| ⋮ | `more-vertical` | Menu |
| 🔍 | `search` | Search |
| 👁 | `eye` / `eye-off` | Password visibility |
| ✓ | `check` | Success, selected |
| 🚪 | `log-out` | Logout |
| 🗑️ | `trash-2` | Delete |
| ✓ | `check-circle` | Toast success |
| ⚠️ | `alert-circle` | Toast error |
| 📷 | `camera` | Upload avatar |
| 👥 | `users` | Members count |
| 🎬 | `film` | Movies count |

---

## Form Validation

### Validation Rules

| Field | Rules |
| ----- | ----- |
| Name | required, 2-256 chars |
| Email | required, valid email format |
| Password | required, min 8 chars |
| Group name | required, 1-256 chars |
| Group description | optional, max 1000 chars |

### Error Messages

```typescript
const errorMessages = {
  required: 'Обязательное поле',
  email: 'Некорректный email',
  minLength: (min) => `Минимум ${min} символов`,
  maxLength: (max) => `Максимум ${max} символов`,
  passwordMatch: 'Пароли не совпадают',
};
```

---

## Accessibility

### Focus States

- Visible focus ring (2px primary outline)
- Focus trap in modals
- Skip links for keyboard navigation

### ARIA

- `aria-label` for icon-only buttons
- `aria-live="polite"` for toasts
- `role="dialog"` for modals
- `role="alert"` for errors

### Touch Targets

- Minimum 44x44px touch target
- Adequate spacing between interactive elements
