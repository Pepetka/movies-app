# Production Deployment

Руководство по развёртыванию Movies App на production сервере.

## Требования

- Docker и Docker Compose
- Домен с настроенными DNS записями (A-запись указывает на IP сервера)
- Открытые порты 80 (HTTP) и 443 (HTTPS)

## Шаги развёртывания

### 1. Подготовка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd movies-app

# Создать файл переменных окружения
cp .env.example .env
```

### 2. Настройка переменных окружения

Отредактируйте `.env` файл:

| Переменная | Описание | Пример |
|------------|----------|--------|
| `NODE_ENV` | Окружение | `production` |
| `PORT` | Порт API сервера | `3000` |
| `WEB_URL` | URL фронтенда | `https://yourdomain.com` |
| `API_URL` | URL API | `https://yourdomain.com/api` |
| `COOKIE_SECRET` | Секрет для cookies (мин. 32 символа) | см. ниже |
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgresql://user:pass@db:5432/movies` |
| `POSTGRES_USER` | Пользователь PostgreSQL | `movies` |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | `<strong-password>` |
| `POSTGRES_DB` | Имя базы данных | `movies` |
| `DOMAIN` | Домен (без протокола) | `yourdomain.com` |
| `CERTBOT_EMAIL` | Email для Let's Encrypt | `admin@yourdomain.com` |

Генерация `COOKIE_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Получение SSL сертификата

Используйте скрипт `init-letsencrypt.sh` для автоматического получения сертификата:

```bash
# Для тестирования (staging сертификат, не доверенный браузерами)
./scripts/init-letsencrypt.sh --staging

# Для production (настоящий сертификат)
./scripts/init-letsencrypt.sh
```

Скрипт автоматически:
- Скачивает рекомендуемые TLS параметры
- Создаёт временный сертификат для запуска nginx
- Запрашивает сертификат Let's Encrypt через ACME challenge
- Перезагружает nginx с новым сертификатом

> **Важно:** Сначала запустите с `--staging` для проверки настроек. Let's Encrypt имеет лимиты на количество запросов сертификатов.

### 4. Запуск приложения

```bash
# Запустить все сервисы
docker compose up -d

# Проверить статус
docker compose ps
```

После запуска приложение будет доступно по адресу `https://yourdomain.com`.

### 5. Обслуживание

#### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
```

#### Обновление приложения

```bash
# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker compose up -d --build
```

#### SSL сертификаты

Сертификаты обновляются автоматически — certbot контейнер настроен на периодическую проверку и обновление.

Ручное обновление при необходимости:

```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

## Устранение проблем

### Сертификат не получен

1. Проверьте DNS записи: `nslookup yourdomain.com`
2. Убедитесь что порты 80/443 открыты
3. Проверьте логи certbot: `docker compose logs certbot`

### Nginx не запускается

```bash
# Проверить конфигурацию
docker compose exec nginx nginx -t

# Посмотреть логи
docker compose logs nginx
```

### База данных недоступна

```bash
# Проверить статус контейнера
docker compose ps db

# Проверить логи
docker compose logs db
```
