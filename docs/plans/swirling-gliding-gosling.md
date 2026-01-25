# План реализации: Changesets для автоматического версионирования

## Обзор

Настройка системы автоматического версионирования и управления релизами для монорепозитория movies-app с использованием Changesets.

**Текущее состояние:**
- Монорепозиторий с 6 пакетами (2 apps + 4 packages)
- Все пакеты private, версии 0.0.1
- Используются workspace:* зависимости
- Есть CI/CD (ci.yml, deploy.yml)
- Коммиты часто используют префиксы (feat:, fix:, chore:)

**Цель:**
- Автоматическое версионирование пакетов
- Генерация CHANGELOG.md
- Создание git тегов для версий (через команду `changeset tag`)
- Интеграция с GitHub Actions

---

## Файлы для создания/изменения

### Новые файлы:
1. `.changeset/config.json` - конфигурация Changesets
2. `.changeset/README.md` - документация для разработчиков
3. `.github/workflows/release.yml` - автоматизация релизов

### Изменяемые файлы:
1. `package.json` (root) - добавить скрипты и зависимость
2. `README.md` - документация по релизам
3. `.github/CONTRIBUTING.md` - инструкции для разработчиков (создать если нет)

---

## Пошаговая реализация

### Шаг 1: Установка зависимостей

**Файл:** `package.json` (root)

Добавить в `devDependencies`:
```json
"@changesets/cli": "^2.27.0"
```

Добавить в `scripts`:
```json
"changeset": "changeset",
"changeset:add": "changeset add",
"version-packages": "changeset version",
"release": "changeset tag && git push --follow-tags"
```

Затем выполнить:
```bash
pnpm install
```

### Шаг 2: Создание конфигурации Changesets

**Файл:** `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "privatePackages": {
    "version": true,
    "tag": true
  }
}
```

**Ключевые параметры:**
- `changelog` - встроенный генератор CHANGELOG
- `commit: false` - GitHub Actions сделает commit
- `access: "restricted"` - не публиковать в npm
- `updateInternalDependencies: "patch"` - автообновление workspace зависимостей
- `privatePackages.version: true` - версионировать private пакеты
- `privatePackages.tag: true` - разрешить создание git тегов (выполняется командой `changeset tag`)

### Шаг 3: Документация для разработчиков

**Файл:** `.changeset/README.md`

```markdown
# Changesets

Эта директория содержит changeset файлы для отслеживания изменений пакетов.

## Создание changeset

Когда вы вносите изменения, которые должны войти в релиз:

1. Выполните `pnpm changeset:add` из корня проекта
2. Выберите затронутые пакеты
3. Выберите тип версии (major, minor, patch)
4. Опишите изменения в редакторе
5. Закоммитьте созданный `.changeset/*.md` файл вместе с кодом

## Пример changeset файла

Название: `.changeset/blue-octopus-91.md`

\`\`\`markdown
---
"@repo/ui": patch
"web": patch
---

feat: add Button component with loading state
\`\`\`

## Release workflow

Когда changeset файлы мержатся в main:
- GitHub Actions создает PR с обновлением версий и CHANGELOG
- После мержа этого PR создаются git теги и коммит версионирования

## Best practices

- Один changeset на одно логическое изменение
- Описывайте ЧТО изменилось, а не КАК
- Используйте понятный формат описания изменений
```

### Шаг 4: Release Workflow

**Файл:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: release
  cancel-in-progress: false

jobs:
  release:
    name: Create Release PR or Publish Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9.0.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release PR or Publish Release
        id: changesets
        uses: changesets/action@v1
        with:
          version: pnpm version-packages
          publish: pnpm release
          commit: 'chore: version packages'
          title: 'chore(release): version packages'
          createGithubReleases: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Как работает:**

**Фаза 1: Создание Release PR**
1. При push в main с changeset файлами workflow запускается
2. changesets/action проверяет changeset файлы
3. Создает/обновляет PR "chore(release): version packages" с:
   - Обновленными версиями в package.json
   - Сгенерированными CHANGELOG.md
   - Удаленными changeset файлами

**Фаза 2: Создание и публикация тегов**
1. После мержа Release PR workflow запускается снова
2. changesets/action обнаруживает что версии изменились (нет changeset файлов)
3. Выполняет `publish` шаг: `pnpm release`
4. Скрипт `release` выполняет:
   - `changeset tag` - создает git теги для всех обновленных пакетов
   - `git push --follow-tags` - пушит коммиты и теги в удаленный репозиторий

**Важно:** Для private packages `changeset tag` только создает теги, не публикует в npm

### Шаг 5: Обновление документации

**Файл:** `README.md`

Добавить секцию после существующих команд:

```markdown
## Release Management

Проект использует [Changesets](https://github.com/changesets/changesets) для управления версиями.

### Создание changeset

При внесении изменений, которые должны войти в релиз:

1. Выполните из корня проекта:
   \`\`\`bash
   pnpm changeset:add
   \`\`\`

2. Выберите затронутые пакеты и тип версии (major, minor, patch)

3. Опишите изменения понятным языком

4. Закоммитьте `.changeset/*.md` файл вместе с кодом

### Процесс релиза

После мержа changeset в `main`:

1. GitHub Actions создает "Release PR" с:
   - Обновленными версиями пакетов
   - Сгенерированными CHANGELOG записями
   - Сводкой всех изменений

2. После ревью и мержа Release PR:
   - Создается коммит версионирования
   - Создаются git теги для каждого пакета
   - Обновляются версии пакетов

### Стратегия версионирования

- **Major (breaking changes):** Удаление/изменение API, крупные рефакторинги
- **Minor (features):** Новые функции, значительные улучшения
- **Patch (fixes):** Исправления багов, мелкие улучшения, документация

Все пакеты `private` и не публикуются в npm.
```

**Файл:** `.github/CONTRIBUTING.md` (создать если не существует)

```markdown
# Contributing

## Создание Changesets

Для изменений, которые должны войти в релиз:

1. Выполните `pnpm changeset:add`
2. Следуйте подсказкам
3. Описывайте ЧТО изменилось, а не КАК

Это обеспечивает автоматическое версионирование и генерацию changelog.

## Pull Request процесс

1. Создайте feature branch
2. Внесите изменения
3. Создайте changeset (если нужен релиз)
4. Создайте PR с понятным описанием
5. Дождитесь ревью и прохождения CI
6. Мержите в main
```

---

## Особенности для private monorepo

### Автоматическое обновление зависимостей

При изменении базовых пакетов (например, `@repo/typescript-config`):
- Changesets автоматически обновит все зависимые пакеты (patch bump)
- Это управляется параметром `updateInternalDependencies: "patch"`

**Пример:** Если обновить `@repo/typescript-config` с 0.0.1 → 0.0.2, то автоматически обновятся:
- `@repo/eslint-config`
- `@repo/ui`
- `web`
- `api`

### Git теги

После релиза создаются теги вида:
```
api@0.0.2
web@0.0.2
@repo/ui@0.0.2
@repo/eslint-config@0.0.1
@repo/typescript-config@0.0.2
```

Это полезно для:
- Быстрого поиска по версиям
- Деплоя определенной версии
- Отката к конкретной версии

---

## Верификация

### После реализации проверить:

1. **Установка работает:**
   ```bash
   pnpm install
   pnpm changeset --help  # должна работать команда
   ```

2. **Локальное тестирование:**
   ```bash
   # Создать тестовый changeset
   pnpm changeset:add
   # Выбрать: web, patch, "test: verify changeset setup"

   # Применить версионирование (локально)
   pnpm version-packages

   # Проверить изменения
   git status  # должны быть изменения в package.json и CHANGELOG.md

   # Откатить для чистоты
   git checkout .
   git clean -fd .changeset/
   ```

3. **Тестирование release workflow:**
   ```bash
   # Создать feature branch
   git checkout -b test/changesets

   # Внести минимальное изменение
   echo "// test changeset" >> apps/api/src/main.ts

   # Создать changeset
   pnpm changeset:add
   # Выбрать: api, patch, "test: verify changesets workflow"

   # Закоммитить и запушить
   git add .changeset/*.md apps/api/src/main.ts
   git commit -m "test: verify changesets workflow"
   git push origin test/changesets

   # Создать PR и смержить в main
   ```

4. **Проверить результаты workflow (после первого push):**
   - [ ] GitHub Actions запустил release.yml
   - [ ] Создался PR с названием "chore(release): version packages"
   - [ ] В PR обновлены package.json (api@0.0.2)
   - [ ] В PR обновлен CHANGELOG.md
   - [ ] Changeset файл удален из .changeset/

5. **Смержить Release PR и проверить:**
   ```bash
   # Дождаться завершения workflow после мержа
   # Проверить что workflow завершился успешно в GitHub Actions

   # Затем локально:
   git pull origin main
   git tag -l  # должны быть теги типа api@0.0.2
   git log --oneline  # коммит "chore: version packages"
   ```

### Чеклист реализации:

**Установка и конфигурация:**
- [ ] Установлен @changesets/cli в devDependencies
- [ ] Добавлены скрипты в root package.json (changeset, changeset:add, version-packages, release)
- [ ] Создан .changeset/config.json с правильной конфигурацией
- [ ] Создан .changeset/README.md с инструкциями
- [ ] Создан .github/workflows/release.yml
- [ ] Обновлен README.md с секцией Release Management
- [ ] Создан/обновлен .github/CONTRIBUTING.md

**Локальное тестирование:**
- [ ] Работает `pnpm changeset --help`
- [ ] Работает `pnpm changeset:add` (создает changeset файл)
- [ ] Работает `pnpm version-packages` (обновляет версии и CHANGELOG)
- [ ] Работает `changeset tag` напрямую (создает теги локально без пуша)

**Workflow тестирование:**
- [ ] Release workflow успешно запускается на push в main
- [ ] Release workflow создает PR с версионированием
- [ ] После мержа Release PR workflow создает git теги через `pnpm release`
- [ ] Теги автоматически пушатся в удаленный репозиторий
- [ ] CHANGELOG.md корректно генерируется

---

## Критические файлы

1. `package.json` (root) - скрипты и зависимости
2. `.changeset/config.json` - основная конфигурация
3. `.github/workflows/release.yml` - автоматизация релизов
4. `.changeset/README.md` - документация для команды
5. `README.md` - обновленная документация проекта

---

## Дополнительные рекомендации

### Для команды:

- Создавайте changeset для каждого PR с изменениями кода
- Для изменений только в docs/ changeset не требуется
- Используйте понятные описания в changeset файлах
- Один changeset = одно логическое изменение

### Workflow в команде:

1. Разработчик создает feature branch
2. Вносит изменения
3. Перед PR запускает `pnpm changeset:add`
4. Создает PR с кодом + changeset файлом
5. После ревью - мержит в main
6. Release workflow создает Release PR автоматически
7. Maintainer ревьюит Release PR и мержит
8. Теги и версии создаются автоматически
