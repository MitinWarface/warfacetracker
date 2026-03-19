// src/components/shared/ConnectionStatus.tsx
// Индикатор плохого соединения

"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, WifiHsp } from "lucide-react";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    // Проверка онлайн статуса
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Проверка скорости соединения
    const checkConnectionSpeed = async () => {
      if ("connection" in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          // 2G или slow-3g считаем медленным
          setIsSlow(conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
        }
      }
    };

    updateOnlineStatus();
    checkConnectionSpeed();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    const interval = setInterval(checkConnectionSpeed, 30000); // Проверка каждые 30 сек

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  // Не показываем если всё хорошо
  if (isOnline && !isSlow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-pulse">
      {isSlow && (
        <div className="bg-amber-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <WifiHsp className="w-4 h-4" />
          <span>Медленное соединение</span>
        </div>
      )}

      {!isOnline && (
        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>Нет соединения</span>
        </div>
      )}
    </div>
  );
}
