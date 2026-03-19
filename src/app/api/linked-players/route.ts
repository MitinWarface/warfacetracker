// src/app/api/linked-players/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken } from "@/services/auth.service";
import { getLinkedPlayers, getUserActivity } from "@/services/verification.service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    const user = await validateToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Неверный токен" },
        { status: 401 }
      );
    }

    const [linkedPlayers, activity] = await Promise.all([
      getLinkedPlayers(user.id),
      getUserActivity(user.id, 20),
    ]);

    return NextResponse.json({
      linkedPlayers,
      activity,
    });
  } catch (error) {
    console.error("Linked players API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
