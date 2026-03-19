// src/components/auth/AuthModal.tsx
"use client";

import { useState } from "react";
import { X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, username);

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Ошибка");
      }
    } catch {
      setError("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-wf-surface border border-wf-border rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-wf-text">
            {isLogin ? "Вход" : "Регистрация"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-wf-muted/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-wf-muted_text" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-wf-muted_text mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="PlayerName"
                className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text focus:outline-none focus:border-wf-accent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-wf-muted_text mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@example.com"
              className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text focus:outline-none focus:border-wf-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-wf-muted_text mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text focus:outline-none focus:border-wf-accent"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-wf-accent text-black font-semibold rounded-lg hover:bg-wf-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                Войти
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Зарегистрироваться
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-sm text-wf-muted_text">
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-wf-accent hover:underline font-medium"
            >
              {isLogin ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
