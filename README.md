# 🎯 Warface Tracker

**Расширенная статистика и аналитика для Warface**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-blue.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI/CD](https://github.com/YOUR_USERNAME/warface-tracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/warface-tracker/actions/workflows/ci-cd.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/warface-tracker)

---

## 📖 Описание

**Warface Tracker** — это мощный инструмент для отслеживания статистики игроков Warface с использованием официального API `api.warface.ru`. 

Проект предоставляет детальную аналитику PvP и PvE производительности, историю изменения K/D рейтинга, арсенал оружия, рейтинги игроков и кланов, а также множество других функций для глубокого анализа игрового прогресса.

### 🔥 Особенности

- ✅ **100% реальные данные** из официального API Warface
- ✅ **Детальная статистика** — PvP, PvE, по классам, по оружию
- ✅ **История сессий** — отслеживание прогресса во времени
- ✅ **Арсенал оружия** — статистика по каждому оружию с точностью и хедшотами
- ✅ **Рейтинги** — Top-100 игроков, рейтинг кланов, ежемесячный рейтинг
- ✅ **Достижения** — полный каталог с прогрессом игрока
- ✅ **Миссии** — актуальные PvE миссии и спецоперации
- ✅ **Сравнение игроков** — наглядное сравнение статистики
- ✅ **Золотое оружие** — прогресс получения золотых камуфляжей
- ✅ **PvE разряд** — система разрядов 1-7 для PvE сезонов
- ✅ **Кланы** — информация о кланах с детальным составом

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 20+ 
- **PostgreSQL** 14+
- **Redis** 7+

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/MitinWarface/http-warfacetracker.github.io.git
cd warface-tracker

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env с вашими данными

# Инициализация базы данных
npx prisma generate
npx prisma db push

# Запуск разработки
npm run dev
```

### Переменные окружения

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/warface_tracker"

# Redis
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_SECRET="your-secret-key-change-in-production"

# Rate limiting
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60

# Cache TTL (seconds)
CACHE_TTL_PLAYER=900
CACHE_TTL_CLAN=1800
```

---

## 📡 API Источники

Проект использует **официальный API Warface**:

| Endpoint | Описание |
|----------|----------|
| `http://api.warface.ru/user/stat/` | Статистика игрока |
| `http://api.warface.ru/user/achievements/` | Достижения игрока |
| `http://api.warface.ru/rating/top100` | Топ-100 игроков |
| `http://api.warface.ru/rating/clan` | Рейтинг кланов |
| `http://api.warface.ru/rating/monthly` | Ежемесячный рейтинг |
| `http://api.warface.ru/clan/members` | Информация о клане |
| `http://api.warface.ru/game/missions` | Активные миссии |
| `http://api.warface.ru/weapon/catalog` | Каталог оружия |
| `http://api.warface.ru/achievement/catalog` | Каталог достижений |

### Дополнительные источники

- **Wiki Warface:** https://ru.warface.com/wiki/
- **CDN изображений:** https://cdn.wfts.su/, https://wf.cdn.gmru.net/

---

## 🛠️ Технологии

### Frontend
- **Next.js 16** — React фреймворк с App Router
- **TypeScript** — типизация всего проекта
- **Tailwind CSS** — стилизация
- **Radix UI** — доступные компоненты
- **Recharts** — графики и диаграммы
- **Lucide React** — иконки

### Backend
- **Next.js API Routes** — серверная логика
- **Prisma** — ORM для PostgreSQL
- **Redis** — кэширование
- **Server Actions** — мутации данных

### Инфраструктура
- **PostgreSQL** — основная база данных
- **Redis** — кэш и сессии
- **Vercel / Docker** — деплой

---

## 📊 Структура проекта

```
warface-tracker/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── public/                     # Статические файлы
├── src/
│   ├── actions/               # Server Actions
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API endpoints
│   │   ├── profile/          # Страницы профиля
│   │   ├── ratings/          # Рейтинги
│   │   └── ...
│   ├── components/            # React компоненты
│   │   ├── profile/          # Компоненты профиля
│   │   ├── armory/           # Оружейная
│   │   └── ...
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Утилиты и конфиги
│   ├── services/              # Бизнес-логика
│   │   ├── wf-api.service.ts # Warface API клиент
│   │   ├── wiki-parser.service.ts # Wiki парсер
│   │   └── ...
│   └── types/                 # TypeScript типы
├── .env                       # Переменные окружения
├── .env.example              # Пример переменных
├── next.config.ts            # Next.js конфиг
├── tailwind.config.ts        # Tailwind конфиг
└── tsconfig.json             # TypeScript конфиг
```

---

## 🎮 Возможности

### Профиль игрока

- **Общая статистика** — K/D, победы, поражения, время в игре
- **PvP статистика** — раздельно по режимам
- **PvE статистика** — убийства, победы, разряд
- **Классы** — статистика по каждому классу
- **Оружие** — арсенал с kills, точностью, хедшотами
- **Достижения** — полученные и доступные
- **История** — изменение статистики во времени
- **Сезоны** — прогресс в ранговых сезонах

### Рейтинги

- **Top-100** — лучшие игроки по классам
- **Кланы** — рейтинг кланов с динамикой
- **Ежемесячный** — сезонный рейтинг кланов
- **PvE** — лучшие PvE игроки

### Оружейная

- **Каталог оружия** — все оружие из API
- **Статистика игрока** — kills, usage, playtime
- **Сравнение** — сравнение оружия по характеристикам

### Достижения

- **Каталог** — все достижения из API
- **Прогресс** — полученные достижения игрока
- **Категории** — значки, жетоны, нашивки, оружие

---

## 📈 Архитектура

### Поток данных

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Клиент    │────▶│  Next.js App │────▶│  Warface    │
│  (Browser)  │◀────│    Server    │◀────│    API      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │PostgreSQL│  │  Redis   │
              │   (DB)   │  │ (Cache)  │
              └──────────┘  └──────────┘
```

### Кэширование

| Данные | TTL | Хранилище |
|--------|-----|-----------|
| Статистика игрока | 15 мин | Redis + БД |
| Рейтинг кланов | 30 мин | Redis + БД |
| Миссии | 10 мин | Redis |
| Каталог оружия | 1 час | Redis |
| Достижения | 1 час | Redis |

---

## 🔧 Доступные команды

```bash
# Разработка
npm run dev              # Запуск dev сервера
npm run build            # Продакшен сборка
npm run start            # Запуск продакшен сервера
npm run lint             # ESLint проверка

# База данных
npm run db:push          # Prisma db push
npm run db:studio        # Prisma Studio GUI
npm run db:migrate       # Миграции БД
```

---

## 🌐 Деплой

### Vercel (рекомендуется)

#### 1. Подготовка базы данных

Vercel не включает встроенную базу данных, поэтому нужно подключить внешнюю:

**Вариант A: Vercel Postgres (рекомендуется)**
```bash
# В панели Vercel: Storage → Add Database → Create Database
# После создания получите переменные окружения
```

**Вариант B: Neon (бесплатно)**
1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект
3. Скопируйте Connection String из раздела Connection Details

**Вариант C: Supabase (бесплатно)**
1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Скопируйте URI подключения из Settings → Database

#### 2. Подготовка Redis

**Вариант A: Vercel KV (рекомендуется)**
```bash
# В панели Vercel: Storage → Add Database → Vercel KV
```

**Вариант B: Upstash (бесплатно)**
1. Зарегистрируйтесь на https://upstash.com
2. Создайте Redis базу
3. Скопируйте `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`

#### 3. Настройка переменных окружения

Скопируйте файл `.env.vercel.example` в `.env.local`:
```bash
cp .env.vercel.example .env.local
```

Заполните `.env.local` или добавьте переменные в Vercel Dashboard:

**Обязательные переменные в Vercel (Project Settings → Environment Variables):**

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `DIRECT_URL` | Прямой URL для миграций Prisma | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `REDIS_URL` | URL подключения к Redis | `redis://default:pass@xxx.upstash.io:6379` |
| `APP_SECRET` | Секретный ключ (мин. 32 символа) | `your-super-secret-key-min-32-chars` |
| `NEXT_PUBLIC_APP_URL` | URL вашего приложения | `https://your-app.vercel.app` |

#### 4. Инициализация базы данных

После первого деплоя выполните миграцию:

```bash
# Локально (если используете локальную БД)
npm run db:init

# Или вручную через Vercel CLI
vercel env pull
npx prisma generate
npx prisma migrate deploy
```

#### 5. Деплой

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Деплой
vercel

# Продакшен деплой
vercel --prod
```

Или подключите репозиторий GitHub в панели Vercel для автоматического деплоя.

---

### Docker

```bash
# Сборка образа
docker build -t warface-tracker .

# Запуск
docker run -p 3000:3000 --env-file .env warface-tracker
```

Или используйте Docker Compose:
```bash
docker-compose up -d
```

### Требования к хостингу

- **Node.js** 20+
- **PostgreSQL** 14+ (или managed: Supabase, Neon, Railway, Vercel Postgres)
- **Redis** 7+ (или managed: Upstash, Vercel KV, Redis Cloud)
- **Минимум 512MB RAM**

---

## 📝 База данных

### Основные таблицы

- **players** — игроки и их текущая статистика
- **stat_snapshots** — история изменений статистики
- **weapon_stats** — статистика по оружию
- **clans** — информация о кланах
- **users** — пользователи сайта
- **linked_players** — привязанные игроки
- **verification_sessions** — сессии верификации

[Полная схема](prisma/schema.prisma)

---

## 🔐 Безопасность

- **Rate Limiting** — ограничение запросов к API
- **CORS** — настройка разрешенных источников
- **Environment Variables** — секреты в .env
- **Input Validation** — валидация всех входных данных
- **SQL Injection Protection** — Prisma ORM

---

## 🤝 Вклад в проект

Приветствуются PR с улучшениями! 

### Как внести вклад

1. Fork репозиторий
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Правила кода

- Используйте TypeScript
- Следуйте существующему стилю кода
- Добавляйте типы для всех функций
- Тестируйте изменения локально

---

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE) для деталей.

---

## 🙏 Благодарности

- **Warface** — за отличный API
- **wfts.su** — за CDN изображений
- **Сообществу** — за поддержку

---

## ⭐ Поддержка проекта

Если вам нравится этот проект, пожалуйста:

1. Поставьте ⭐ звезду на GitHub
2. Поделитесь с друзьями
3. Внесите вклад через PR

---

**Сделано с ❤️ для сообщества Warface**

*Неофициальный проект. Не связан с Mail.Ru или разработчиками Warface.*
