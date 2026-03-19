// Helper для проксирования изображений через /api/proxy/image

/**
 * Проксирует URL изображения через внутренний API
 * @param url - Исходный URL изображения
 * @returns URL прокси /api/proxy/image?url=...
 */
export function proxyImageUrl(url: string): string {
  if (!url) return '';
  
  // Если это data URI или относительный путь, возвращаем как есть
  if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('#')) {
    return url;
  }
  
  // Проксируем все внешние URL
  const encodedUrl = encodeURIComponent(url);
  return `/api/proxy/image?url=${encodedUrl}`;
}

/**
 * Проксирует массив URL изображений
 */
export function proxyImageUrls(urls: string[]): string[] {
  return urls.map(proxyImageUrl);
}

/**
 * Создаёт fallback URL для изображений
 * @param urls - Массив URL для попытки загрузки
 * @returns Функция для обработки onError
 */
export function createImageFallback(urls: string[], onError: () => void) {
  let idx = 0;
  return () => {
    idx++;
    if (idx < urls.length) {
      onError();
    }
  };
}
