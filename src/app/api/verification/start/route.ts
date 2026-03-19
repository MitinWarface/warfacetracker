// src/app/api/verification/start/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken } from "@/services/auth.service";
import { startVerification } from "@/services/verification.service";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { warfaceNick } = body;

    if (!warfaceNick || !warfaceNick.trim()) {
      return NextResponse.json(
        { error: "Введите ник" },
        { status: 400 }
      );
    }

    const result = await startVerification(user.id, warfaceNick);

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        badges: result.badges,
        expiresAt: result.expiresAt,
      });
    }

    return NextResponse.json(
      { error: result.error || "Ошибка начала верификации" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verification start API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
