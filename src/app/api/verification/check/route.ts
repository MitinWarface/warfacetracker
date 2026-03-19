// src/app/api/verification/check/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken } from "@/services/auth.service";
import { checkVerification } from "@/services/verification.service";

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
    const { sessionId, warfaceNick } = body;

    if (!sessionId || !warfaceNick) {
      return NextResponse.json(
        { error: "Неверные параметры" },
        { status: 400 }
      );
    }

    const result = await checkVerification(sessionId, warfaceNick, user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        verified: result.verified,
        equipped: result.equipped,
        missing: result.missing,
      });
    }

    return NextResponse.json(
      { error: result.error || "Ошибка проверки" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verification check API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
