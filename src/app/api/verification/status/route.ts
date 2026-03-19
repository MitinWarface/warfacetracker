// src/app/api/verification/status/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken } from "@/services/auth.service";
import { getActiveVerification } from "@/services/verification.service";

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

    const session = await getActiveVerification(user.id);

    if (!session) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      sessionId: session.id,
      warfaceNick: session.warfaceNick,
      badges: session.badges,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Verification status API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
