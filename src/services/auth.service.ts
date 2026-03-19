// src/services/auth.service.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Проверка что JWT_SECRET установлен в production
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error('❌ JWT_SECRET is not set! Please set it in environment variables.');
  console.error('Generate one with: openssl rand -base64 32');
}

const SAFE_JWT_SECRET = JWT_SECRET || "warface-tracker-secret-key-2024";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    backgroundPreset?: string | null;
    bannerPreset?: string | null;
    bgColor: string;
    accentColor: string;
    bio?: string | null;
    isVerified: boolean;
  };
  error?: string;
}

export async function register(data: RegisterInput): Promise<AuthResult> {
  try {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      return { success: false, error: "Email уже зарегистрирован" };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      return { success: false, error: "Имя пользователя занято" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        username: data.username,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    // Create session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_DURATION),
      },
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
        bgColor: user.bgColor,
        accentColor: user.accentColor,
        bio: user.bio,
        isVerified: user.isVerified,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Ошибка регистрации" };
  }
}

export async function login(data: LoginInput): Promise<AuthResult> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Неверный email или пароль" };
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      return { success: false, error: "Неверный email или пароль" };
    }

    // Generate token
    const token = generateToken(user.id);

    // Create session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_DURATION),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
        bgColor: user.bgColor,
        accentColor: user.accentColor,
        bio: user.bio,
        isVerified: user.isVerified,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Ошибка входа" };
  }
}

export async function logout(token: string): Promise<boolean> {
  try {
    await prisma.userSession.deleteMany({
      where: { token },
    });
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function validateToken(token: string): Promise<AuthResult["user"] | null> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Check session
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      avatarUrl: session.user.avatarUrl,
      bannerUrl: session.user.bannerUrl,
      backgroundPreset: session.user.backgroundPreset,
      bannerPreset: session.user.bannerPreset,
      bgColor: session.user.bgColor,
      accentColor: session.user.accentColor,
      bio: session.user.bio,
      isVerified: session.user.isVerified,
    };
  } catch (error) {
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: {
    avatarUrl?: string;
    bannerUrl?: string;
    bgColor?: string;
    accentColor?: string;
    bio?: string;
    backgroundPreset?: string;
    bannerPreset?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Ошибка обновления профиля" };
  }
}

export async function getUserProfileSettingsByNickname(nickname: string) {
  try {
    const normalizedNickname = nickname.toLowerCase();
    
    // Find user by linked Warface nickname
    const linkedPlayer = await prisma.linkedPlayer.findFirst({
      where: {
        warfaceNick: {
          equals: normalizedNickname,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            backgroundPreset: true,
            bannerPreset: true,
            bannerUrl: true,
            bgColor: true,
            accentColor: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (linkedPlayer?.user) {
      return linkedPlayer.user;
    }

    // Fallback: try to find by username (if nickname matches username)
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedNickname,
          mode: 'insensitive',
        },
      },
      select: {
        backgroundPreset: true,
        bannerPreset: true,
        bannerUrl: true,
        bgColor: true,
        accentColor: true,
        bio: true,
        avatarUrl: true,
      },
    });
    
    return user || null;
  } catch (error) {
    console.error("Get user profile settings by nickname error:", error);
    return null;
  }
}

export async function getUserProfileSettings(username: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username.toLowerCase(),
          mode: 'insensitive',
        },
      },
      select: {
        backgroundPreset: true,
        bannerPreset: true,
        bannerUrl: true,
        bgColor: true,
        accentColor: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return user || null;
  } catch (error) {
    console.error("Get user profile settings error:", error);
    return null;
  }
}

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        username: {
          equals: username.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      backgroundPreset: user.backgroundPreset,
      bannerPreset: user.bannerPreset,
      bgColor: user.bgColor,
      accentColor: user.accentColor,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, SAFE_JWT_SECRET, { expiresIn: "30d" });
}
