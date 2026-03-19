// src/app/api/wfs/route.ts
// Proxy for WFS API to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

const WFS_BASE_URL = "https://wfs.globalart.dev/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing endpoint parameter" },
      { status: 400 }
    );
  }

  try {
    const url = `${WFS_BASE_URL}${endpoint}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `WFS API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error: any) {
    console.error("[WFS Proxy] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from WFS API" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");
  const body = await req.json().catch(() => null);

  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing endpoint parameter" },
      { status: 400 }
    );
  }

  try {
    const url = `${WFS_BASE_URL}${endpoint}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `WFS API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[WFS Proxy POST] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from WFS API" },
      { status: 500 }
    );
  }
}
