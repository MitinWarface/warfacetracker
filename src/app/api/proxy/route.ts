// src/app/api/proxy/route.ts
// Универсальный прокси для обхода CORS к Warface API и Wiki

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TARGETS = [
  "api.warface.ru",
  "http://api.warface.ru",
  "https://api.warface.ru",
  "ru.warface.com",
  "https://ru.warface.com",
  "wf.cdn.gmru.net",
  "https://wf.cdn.gmru.net",
];

const CACHE_SECONDS = 300; // 5 минут для API данных

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Проверяем целевой URL
  let target: URL;
  try {
    target = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid target URL" }, { status: 400 });
  }

  // Разрешаем только определенные хосты
  const isAllowed = ALLOWED_TARGETS.some(
    (h) => target.hostname === h || target.hostname.endsWith(h) || target.href.startsWith(h)
  );

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Target host not allowed" },
      { status: 403 }
    );
  }

  try {
    // Определяем заголовки в зависимости от целевого хоста
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/html, */*",
    };

    // Для Wiki добавляем Referer
    if (target.hostname.includes("ru.warface.com") || target.hostname.includes("wf.cdn.gmru.net")) {
      headers["Referer"] = "https://ru.warface.com/wiki/index.php/";
    } else if (target.hostname.includes("api.warface.ru")) {
      headers["Referer"] = "https://api.warface.ru/";
    }

    const res = await fetch(target.toString(), {
      method: "GET",
      headers,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Target API returned ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    const data = await res.arrayBuffer();

    // Определяем Content-Type
    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType || "application/json",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
      "X-Proxied-By": "wftracker",
      "Access-Control-Allow-Origin": "*",
    };

    return new NextResponse(data, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[API Proxy] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from target" },
      { status: 500 }
    );
  }
}

// Поддержка POST запросов для API
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const body = await req.json().catch(() => null);

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid target URL" }, { status: 400 });
  }

  const isAllowed = ALLOWED_TARGETS.some(
    (h) => target.hostname === h || target.hostname.endsWith(h) || target.href.startsWith(h)
  );

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Target host not allowed" },
      { status: 403 }
    );
  }

  try {
    const res = await fetch(target.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
      next: { revalidate: 0 }, // Не кэшируем POST запросы
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Target API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Proxied-By": "wftracker",
      },
    });
  } catch (error: any) {
    console.error("[API Proxy POST] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from target" },
      { status: 500 }
    );
  }
}
