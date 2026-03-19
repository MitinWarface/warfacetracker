// src/app/api/verification/cancel/route.ts
import { NextResponse } from "next/server";
import { cancelVerification } from "@/services/verification.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Неверные параметры" },
        { status: 400 }
      );
    }

    const success = await cancelVerification(sessionId);

    if (success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Ошибка отмены" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verification cancel API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
