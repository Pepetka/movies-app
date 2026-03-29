# @repo/ui

## 0.8.0

### Minor Changes

- 3413244: Enhanced toast notifications with richer interaction
  - Added progress bar, vertical swipe-to-dismiss, and pause-on-hover to toast
  - Fixed pending requestAnimationFrame cancellation on toast dismiss

## 0.7.3

### Patch Changes

- 7656a50: DatePicker inline mode and textarea improvements
  - Added inline prop to DatePicker for embedded calendar without popover
  - Fixed TopBar overflow on mobile devices
  - Textarea auto-resize now triggers on programmatic value changes

## 0.7.2

### Patch Changes

- d06ef76: Image component improvements
  - Added fallback prop for placeholder when image fails to load
  - Better error handling for broken image URLs

## 0.7.1

### Patch Changes

- 79e7d31: Input and Textarea improvements for better form UX
  - Floating labels now correctly detect browser autofill via CSS animation events
  - Unified icon positioning across Input component sizes (sm/md/lg/responsive)

## 0.7.0

### Minor Changes

- 7c5ee4b: Enhanced Divider and Textarea components with new props and fixes
  - Added label prop to Divider component for section headers
  - Fixed disabled state handling in Textarea component
  - Fixed restProps spreading in Divider for proper attribute passthrough

## 0.6.0

### Minor Changes

- 9d0903a: Add contained mode for consistent component positioning within containers
  - TopBar, BottomNav, FAB — support contained prop for relative positioning
  - Input, Select, Button, Chip, IconButton, ListItem, Skeleton, Spinner — contained mode support
  - Updated theme.css with container-related CSS variables

## 0.5.0

### Minor Changes

- 3a1af9d: Button and Card component improvements
  - Button: add `href` prop — renders as `<a>` when href is provided, `<button>` otherwise
  - Button: reorganize Storybook stories (Variants, States, Link Buttons, In Context)
  - Card: add `header` and `footer` snippets for structured content
  - Card: add `responsive` size — sm on mobile (<480px), md on desktop
  - Card: update Storybook stories with better examples
  - Input, Checkbox, Select, Textarea: minor improvements
  - Move `@lucide/svelte` to peerDependencies

## 0.4.0

### Minor Changes

- d904192: Created comprehensive UI Kit with 30+ components and Storybook
  - Added components: Button, Input, Select, Textarea, Checkbox, Switch, DatePicker, Tabs, Modal, Drawer, Toast, Card, Grid, Container, Avatar, Badge, Chip, FAB, IconButton, List, Skeleton, Spinner, Divider, Spacer, EmptyState, StatusIndicator, Image, TopBar, BottomNav, ThemeToggle, ThemeButton
  - Implemented theming system via CSS variables (tokens.css, theme.css, typography.css)
  - Configured Storybook with theme decorators and side-by-side preview
  - Added utilities: size helpers, avatar-size
  - Documentation: ui-kit-quality-criteria.md, ui-kit-review.md
  - Touch UX: :active states, @media (hover: hover), passive event listeners
  - A11y: aria attributes, keyboard navigation, focus trap

## 0.3.0

### Minor Changes

- baf3206: Feat: JWT Authentication with User Management
  - JWT authentication with access & refresh tokens
  - User CRUD module (create, read, update, delete)
  - Role-based access control (ADMIN, MEMBER)
  - CSRF protection
  - Password validation & hashing (bcrypt)
  - Comprehensive test coverage (unit + e2e)
  - Developer tooling: husky, lint-staged
  - Database migrations for auth tables

## 0.2.0

### Minor Changes

- 50c9de1: - Fixed environment configuration
  - Added health check functionality

## 0.1.0

### Minor Changes

- 8bc700f: - Настроены приложения и базовая инфраструктура (API, Web, общие пакеты).
  - Добавлены Docker/Compose конфиги, nginx + Let's Encrypt, пример `.env`, инструкции по прод-развёртыванию.
  - Подключены миграции БД и образы из GHCR; улучшена надёжность деплоя.
  - Полностью настроены CI/CD в GitHub Actions: CI для PR, deploy на VPS, Changesets для версионирования.
  - Улучшены release/deploy workflows: защита от дублей тегов, связка релиза и деплоя, проверка тегов, поддержка кастомного SSH порта.
  - Документация актуализирована под новые процессы.
