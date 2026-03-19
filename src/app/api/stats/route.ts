// src/app/api/stats/route.ts
import { NextResponse } from "next/server";

// Простая статистика API (в реальном проекте нужно кэширование в Redis/DB)
const stats = {
  requests: {
    total: 0,
    today: 0,
    byEndpoint: {} as Record<string, number>,
  },
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  // Increment total requests
  stats.requests.total++;
  stats.requests.today++;
  
  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requests: stats.requests,
    cache: {
      enabled: true,
      ttl: {
        player: 900, // 15 minutes
        clan: 1800,  // 30 minutes
        missions: 600, // 10 minutes
      },
    },
    api: {
      warface: {
        baseUrl: "https://api.warface.ru",
        status: "online",
      },
    },
  });
}
