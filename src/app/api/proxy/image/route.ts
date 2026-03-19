// src/app/api/proxy/image/route.ts
// Proxies images from external CDNs to avoid CORS/Referer issues on the client.

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "api.wf.mail.ru",
  "cdn.warface.com",
  "wf.mail.ru",
  "cdn.wfts.su",
  "wfts.su",
  "wf.cdn.gmru.net",
  "ru.warface.com",
  "api.warface.ru",
  "warface.com",
];

const CACHE_SECONDS = 86_400; // 24 h — images rarely change

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Validate the upstream URL
  let upstream: URL;
  try {
    upstream = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.some((h) => upstream.hostname.endsWith(h) || upstream.hostname.includes(h))) {
    return NextResponse.json(
      { error: "Upstream host not allowed" },
      { status: 403 }
    );
  }

  // Fetch the image
  let res: Response;
  try {
    // Determine Referer based on upstream host
    let referer = "https://warface.com/";
    if (upstream.hostname.includes("wf.cdn.gmru.net") || upstream.hostname.includes("warface.com") || upstream.hostname.includes("ru.warface.com")) {
      referer = "https://ru.warface.com/wiki/index.php/";
    } else if (upstream.hostname.includes("cdn.wfts.su") || upstream.hostname.includes("wfts.su")) {
      referer = "https://wfts.su/";
    } else if (upstream.hostname.includes("api.warface.ru")) {
      referer = "http://api.warface.ru/";
    }

    res = await fetch(upstream.toString(), {
      headers: {
        Referer: referer,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
      next: { revalidate: CACHE_SECONDS },
    });
  } catch (error) {
    // Return 404 placeholder for failed fetches
    console.error("[Image Proxy] Fetch error:", error);
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  if (!res.ok) {
    // Return 404 for missing images (not 502)
    return NextResponse.json({ error: "Image not found" }, { status: res.status === 404 ? 404 : 502 });
  }

  const contentType = res.headers.get("content-type") ?? "image/png";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Not an image" }, { status: 415 });
  }

  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":  contentType,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
      "X-Proxied-By":  "wftracker",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
