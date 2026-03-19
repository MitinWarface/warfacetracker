// src/app/api/warface/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const classId = searchParams.get("class");
  const league = searchParams.get("league");
  const page = searchParams.get("page");
  const clan = searchParams.get("clan");
  const name = searchParams.get("name");
  
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }
  
  try {
    // Добавляем параметры
    const url = new URL(`http://api.warface.ru${endpoint}`);
    if (classId) url.searchParams.set("class", classId);
    if (league) url.searchParams.set("league", league);
    if (page) url.searchParams.set("page", page);
    if (clan) url.searchParams.set("clan", clan);
    if (name) url.searchParams.set("name", name);
    
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      // Кэш на 5 минут
      next: { revalidate: 300 },
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { error: `API returned ${res.status}` },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch from Warface API" },
      { status: 500 }
    );
  }
}
