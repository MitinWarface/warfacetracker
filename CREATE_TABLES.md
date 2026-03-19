# 🗄️ Создание таблиц в Supabase

## 📋 Инструкция

### 1. Зайдите в Supabase SQL Editor

```
https://supabase.com → Ваш проект → SQL Editor
```

### 2. Создайте новый запрос

```
+ New query
```

### 3. Скопируйте и выполните SQL

Откройте файл `e:\Warface\database.sql`, скопируйте всё содержимое и вставьте в SQL Editor.

Нажмите **Run** (или Ctrl+Enter).

---

## ✅ Проверка успеха

После выполнения вы увидите сообщение:
```
Success. No rows returned
```

Или список созданных таблиц:
- players
- clans
- stat_snapshots
- weapon_stats
- users
- user_sessions
- linked_players
- user_activity
- verification_sessions

---

## 🔍 Проверка таблиц

### 1. Через Table Editor:
```
Table Editor (слева) → Вы увидите все 9 таблиц
```

### 2. Через SQL:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 📊 Структура таблиц

### players
- Хранит информацию об игроках Warface
- Связь с clans через clan_id

### clans
- Информация о кланах
- Рейтинг, очки, количество участников

### stat_snapshots
- Временные ряды статистики игроков
- K/D, победы, поражения, PvE статистика

### weapon_stats
- Статистика по оружию
- Убийства, точность, голд прогресс

### users
- Пользователи приложения
- Email, пароль, настройки профиля

### user_sessions
- Активные сессии пользователей
- JWT токены

### linked_players
- Привязанные Warface аккаунты к пользователям

### user_activity
- Лог активности пользователей

### verification_sessions
- Сессии верификации аккаунтов

---

## 🚀 Следующие шаги

### 1. Создайте `.env.local`:
```bash
DATABASE_URL="postgresql://postgres.rrhkcxauserjtioyarui:IqLIJ6bdzDQsYIVh@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rrhkcxauserjtioyarui:IqLIJ6bdzDQsYIVh@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
REDIS_URL="redis://localhost:6379"
APP_SECRET="xK9#mP2$vL5@nQ8&wR3^tY6*uI1!oA4%sD7"
JWT_SECRET="jH8#kL3$mN6@pQ1&rS9^tV2*wX5!yB0%cE4"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Запустите проект:
```bash
npm run dev
```

### 3. Проверьте подключение:
Откройте http://localhost:3000

---

## 📞 Если ошибки

### Ошибка "relation already exists":
Таблицы уже созданы. Это нормально.

### Ошибка "permission denied":
Проверьте что у вас есть права на создание таблиц в Supabase.

### Ошибка "syntax error":
Убедитесь что скопировали весь SQL файл полностью.
