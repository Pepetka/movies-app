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

```markdown
---
"@repo/ui": patch
"web": patch
---

feat: add Button component with loading state
```

## Release workflow

Когда changeset файлы мержатся в main:
- GitHub Actions создает PR с обновлением версий и CHANGELOG
- После мержа этого PR создаются git теги и коммит версионирования

## Best practices

- Один changeset на одно логическое изменение
- Описывайте ЧТО изменилось, а не КАК
- Используйте понятный формат описания изменений
