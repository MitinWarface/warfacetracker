# 💾 Как получить REDIS_URL из Upstash

## 📋 Пошаговая инструкция

### Шаг 1: Зарегистрируйтесь в Upstash

```
1. Перейдите на https://upstash.com
2. Нажмите "Get Started" или "Sign Up"
3. Войдите через GitHub (рекомендуется) или создайте аккаунт
```

---

### Шаг 2: Создайте Redis базу

```
1. Нажмите "Create Database"
2. Выберите регион (ближайший к вам):
   - Europe → eu-central-1 (Frankfurt)
   - US East → us-east-1 (Virginia)
   - Asia → ap-southeast-1 (Singapore)
3. Введите название (например: warface-tracker)
4. Нажмите "Create"
```

---

### Шаг 3: Скопируйте REDIS_URL

После создания базы вы увидите:

```
REST API
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

Redis CLI
UPSTASH_REDIS_URL="redis://..."
```

**Скопируйте значение `UPSTASH_REDIS_URL`**

Пример:
```bash
REDIS_URL="redis://default:AAkCyzNjY2M3ODEtYjY3Ni00...@eu-central-1.upstash.io:6379"
```

---

### Шаг 4: Вставьте в .env.local

Откройте `e:\Warface\.env.local` и замените:

```bash
# Было (заглушка для локальной разработки)
REDIS_URL="redis://localhost:6379"

# Стало (ваш Upstash URL)
REDIS_URL="redis://default:AAkCyz...@eu-central-1.upstash.io:6379"
```

---

## 💰 Тарифы Upstash

### Бесплатный план (Hobby):
```
✅ 10,000 команд в день
✅ 256 MB памяти
✅ Бесплатно навсегда
✅ Достаточно для начала
```

### План Pro ($9.99/мес):
```
✅ 1 миллион команд в день
✅ 1 GB памяти
✅ Приоритетная поддержка
```

---

## 🔍 Проверка подключения

### 1. Через Upstash Data Browser:
```
Upstash Dashboard → Ваша база → Data Browser
→ Вы увидите пустую базу (это нормально)
```

### 2. Через код:
После добавления REDIS_URL в .env.local:

```bash
npm run dev
```

Откройте http://localhost:3000 и проверьте логи консоли.

---

## 📊 Мониторинг использования

### Upstash Dashboard:
```
Dashboard → Metrics
→ Видите использование команд за день
→ Лимит сбрасывается каждые 24 часа
```

### Советы:
- Кэширование снижает количество запросов
- 10K команд/день ≈ 1000-2000 запросов к API
- Для продакшена рассмотрите платный план

---

## 🚨 Если проблемы

### Ошибка "Connection refused":
- Проверьте что REDIS_URL правильный
- Убедитесь что база активна в Upstash

### Ошибка "ERR AUTH":
- Скопируйте полный URL включая пароль
- Не копируйте кавычки из Upstash

### Лимит превышен:
- Подождите сброса (24 часа)
- Или обновитесь до Pro плана

---

## ✅ Готово!

После добавления REDIS_URL:

1. Перезапустите сервер разработки
2. Проверьте что кэширование работает
3. Для Vercel добавьте переменную в Environment Variables

**Ваш REDIS_URL уже готов к использованию!** 🎉
