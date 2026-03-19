// src/app/api/clan-wars/route.ts
import { NextResponse } from "next/server";
import { compareClans } from "@/services/clan-wars.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clan1 = searchParams.get("clan1");
    const clan2 = searchParams.get("clan2");

    if (!clan1 || !clan2) {
      return NextResponse.json({ error: "Both clans required" }, { status: 400 });
    }

    const comparison = await compareClans(clan1, clan2);
    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Ошибка clan-wars:", error);
    return NextResponse.json({ error: "Failed to compare" }, { status: 500 });
  }
}
