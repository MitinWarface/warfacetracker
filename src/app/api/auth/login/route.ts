// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { login } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    const result = await login({ email, password });

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
      { error: result.error || "Ошибка входа" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
