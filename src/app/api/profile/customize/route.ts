// src/app/api/profile/customize/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken, updateProfile } from "@/services/auth.service";

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
    const { avatarUrl, bannerUrl, bgColor, accentColor, bio, backgroundPreset, bannerPreset } = body;

    const result = await updateProfile(user.id, {
      avatarUrl,
      bannerUrl,
      bgColor,
      accentColor,
      bio,
      backgroundPreset,
      bannerPreset,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || "Ошибка обновления" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Profile customize API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
