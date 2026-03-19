# 🚀 Инструкция по деплою на Vercel

## Быстрый старт

### Шаг 1: Подготовка репозитория

```bash
# Убедитесь, что код в git
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Шаг 2: Создание базы данных

#### Вариант A: Vercel Postgres (рекомендуется)

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Storage** → **Add Database** → **Create Database**
3. Выберите регион (например, `fra1` для Европы)
4. После создания скопируйте переменные окружения

#### Вариант B: Neon (бесплатно)

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. В разделе **Connection Details** скопируйте **Connection String**
4. Формат: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

#### Вариант C: Supabase (бесплатно)

1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Перейдите в **Settings** → **Database**
4. Скопируйте **URI** подключения

### Шаг 3: Создание Redis

#### Вариант A: Vercel KV (рекомендуется)

1. В Vercel Dashboard: **Storage** → **Add Database** → **Vercel KV**
2. Создайте базу в нужном регионе
3. Переменные окружения добавятся автоматически

#### Вариант B: Upstash (бесплатно)

1. Зарегистрируйтесь на [upstash.com](https://upstash.com)
2. Создайте Redis базу
3. Скопируйте:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. В Vercel добавьте переменную:
   ```
   REDIS_URL="redis://default:TOKEN@HOST:PORT"
   ```

### Шаг 4: Настройка проекта в Vercel

1. **Импортируйте проект:**
   - Vercel Dashboard → **Add New Project**
   - Выберите **Import Git Repository**
   - Подключите ваш GitHub репозиторий

2. **Настройте переменные окружения:**
   
   Перейдите в **Project Settings** → **Environment Variables** и добавьте:

   | Переменная | Значение |
   |------------|----------|
   | `DATABASE_URL` | Ваш PostgreSQL URL |
   | `DIRECT_URL` | Тот же PostgreSQL URL (для миграций) |
   | `REDIS_URL` | Ваш Redis URL |
   | `APP_SECRET` | Случайная строка 32+ символов |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
   | `RATE_LIMIT_MAX` | `10` |
   | `RATE_LIMIT_WINDOW` | `60` |
   | `CACHE_TTL_PLAYER` | `900` |
   | `CACHE_TTL_CLAN` | `1800` |
   | `CACHE_TTL_MISSIONS` | `600` |
   | `CACHE_TTL_RATINGS` | `300` |

   **Как сгенерировать APP_SECRET:**
   ```bash
   # macOS/Linux
   openssl rand -base64 32
   
   # Или используйте любой генератор паролей
   ```

3. **Настройте Build Command:**
   
   В **Project Settings** → **Build & Development Settings**:
   - **Build Command:** `npm run vercel:build`
   - **Output Directory:** `.next` (по умолчанию)
   - **Install Command:** `npm install`

### Шаг 5: Инициализация базы данных

После первого деплоя нужно создать таблицы:

#### Способ A: Через Vercel CLI (рекомендуется)

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Скачайте переменные окружения
vercel env pull

# Сгенерируйте Prisma Client
npx prisma generate

# Примените миграции
npx prisma migrate deploy
```

#### Способ B: Локально с подключением к продакшен БД

```bash
# Скопируйте DATABASE_URL из Vercel в .env
# Затем выполните:
npx prisma generate
npx prisma migrate deploy
```

### Шаг 6: Проверка деплоя

1. Откройте URL вашего приложения (например, `https://your-app.vercel.app`)
2. Проверьте логи в **Deployments** → **View Build Logs**
3. Протестируйте основные функции:
   - Поиск игрока
   - Просмотр профиля
   - Рейтинги

---

## Автоматический деплой

Для настройки автоматического деплоя при push в main ветку:

1. Подключите GitHub репозиторий в Vercel
2. Перейдите в **Project Settings** → **Git**
3. Включите **Preview Deployments** для pull request'ов
4. Включите **Production Deployments** для main ветки

Теперь каждый push в main будет автоматически деплоиться!

---

## Решение проблем

### Ошибка: "Can't reach database server"

**Причина:** Неправильный DATABASE_URL или проблемы с SSL

**Решение:**
1. Убедитесь, что URL содержит `?sslmode=require`
2. Проверьте, что база данных доступна из интернета
3. Для Neon/Supabase убедитесь, что IP не заблокирован

### Ошибка: "Direct URL is required"

**Причина:** Prisma требует DIRECT_URL для миграций

**Решение:** Добавьте переменную `DIRECT_URL` с тем же значением, что и `DATABASE_URL`

### Ошибка: "Prisma Client not generated"

**Причина:** Не сгенерирован Prisma Client перед билдом

**Решение:** Убедитесь, что `buildCommand` в `vercel.json` содержит `prisma generate`

### Ошибка: "Redis connection failed"

**Причина:** Неправильный REDIS_URL или Redis недоступен

**Решение:**
1. Проверьте формат URL: `redis://default:TOKEN@HOST:PORT`
2. Убедитесь, что Redis сервис активен
3. Для Upstash используйте REST URL

---

## Полезные команды

```bash
# Просмотр логов деплоя
vercel logs

# Скачивание переменных окружения
vercel env pull

# Добавление переменной окружения
vercel env add APP_SECRET

# Деплой в продакшен
vercel --prod

# Открыть проект в браузере
vercel open
```

---

## Оптимизация производительности

### Включите Edge Caching

В `vercel.json` уже настроен регион `fra1` (Франкфурт) для лучшей производительности в Европе.

### Настройте кэширование

Убедитесь, что Redis кэш работает корректно:
- Статистика игрока: 15 мин
- Рейтинги: 5-30 мин
- Миссии: 10 мин

### Мониторинг

Используйте **Vercel Analytics** для отслеживания:
- Core Web Vitals
- Время ответа API
- Ошибки сервера

---

## Стоимость

### Vercel Hobby (бесплатно)
- ✅ Неограниченные деплои
- ✅ 100GB bandwidth в месяц
- ✅ Автоматический HTTPS
- ❌ Нет встроенной БД

### Дополнительные сервисы (бесплатные тарифы)
- **Neon:** 0.5 GB storage, бесплатно
- **Supabase:** 500 MB storage, бесплатно
- **Upstash:** 10,000 команд в день, бесплатно

**Итого:** Можно развернуть полностью бесплатно!

---

## Поддержка

При возникновении проблем:
1. Проверьте [документацию Vercel](https://vercel.com/docs)
2. Посмотрите логи деплоя
3. Убедитесь, что все переменные окружения настроены

**Успешного деплоя! 🎉**
