# @repo/ui

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
