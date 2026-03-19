// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { register } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, пароль и имя пользователя обязательны" },
        { status: 400 }
      );
    }

    const result = await register({ email, password, username });

    if (result.success && result.token) {
      const response = NextResponse.json({
        success: true,
        user: result.user,
      });

      // Set cookie
      response.cookies.set("auth_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: result.error || "Ошибка регистрации" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
