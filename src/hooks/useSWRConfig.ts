// src/hooks/useSWRConfig.ts
// Клиентское кэширование для слабого интернета

import { SWRConfiguration } from 'swr';

// Настройки для слабого интернета
export const slowInternetConfig: SWRConfiguration = {
  // Кэш хранится 5 минут
  dedupingInterval: 5 * 60 * 1000,
  
  // Повторные запросы при ошибке
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  
  // Максимум 3 попытки
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  
  // Timeout для запросов (10 секунд для слабого интернета)
  fetcher: async (url: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      return res.json();
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  },
};

// Настройки для очень слабого интернета (2G/3G)
export const verySlowInternetConfig: SWRConfiguration = {
  ...slowInternetConfig,
  dedupingInterval: 10 * 60 * 1000, // 10 минут
  errorRetryCount: 5,
  errorRetryInterval: 2000,
};

// Стандартные настройки (для нормального интернета)
export const normalInternetConfig: SWRConfiguration = {
  dedupingInterval: 2 * 60 * 1000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
};
