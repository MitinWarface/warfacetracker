#!/usr/bin/env node

/**
 * Скрипт для инициализации БД при деплое на Vercel
 * Запускается автоматически после деплоя через Vercel Build Command
 */

const { execSync } = require('child_process');

async function main() {
  console.log('🚀 Инициализация базы данных...');

  try {
    // Генерируем Prisma Client
    console.log('📦 Генерация Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Применяем миграции (или создаем если их нет)
    console.log('🗄️  Применение миграций...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('✅ База данных успешно инициализирована!');
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error.message);
    process.exit(1);
  }
}

main();
