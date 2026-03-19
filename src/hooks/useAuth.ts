// src/hooks/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
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
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        router.push("/cabinet");
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Ошибка входа" };
    }
  }, [router]);

  const register = useCallback(async (email: string, password: string, username: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        router.push("/cabinet");
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Ошибка регистрации" };
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
