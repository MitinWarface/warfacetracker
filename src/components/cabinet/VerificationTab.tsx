// src/components/cabinet/VerificationTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Shield, Clock, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Динамическая мапа достижений - будет заполнена из API
const BADGE_INFO: Record<string, Badge> = {};

export default function VerificationTab() {
  const [warfaceNick, setWarfaceNick] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [badges, setBadges] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<"idle" | "verifying" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [equipped, setEquipped] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);

  // Check for active verification on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && status === "verifying") {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && status === "verifying") {
      setStatus("error");
      setMessage("Время сессии истекло. Начните заново.");
    }
  }, [timeLeft, status]);

  async function checkStatus() {
    try {
      const res = await fetch("/api/verification/status");
      const data = await res.json();

      if (data.active) {
        setSessionId(data.sessionId);
        setWarfaceNick(data.warfaceNick);
        setBadges(data.badges);
        const expiresAt = new Date(data.expiresAt).getTime();
        const now = Date.now();
        const left = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(left);
        setStatus("verifying");
      }
    } catch (error) {
      console.error("Check status error:", error);
    }
  }

  async function handleStart() {
    if (!warfaceNick.trim()) {
      setMessage("Введите ник");
      return;
    }

    setStatus("checking");
    try {
      const res = await fetch("/api/verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warfaceNick }),
      });

      const data = await res.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setBadges(data.badges);
        const expiresAt = new Date(data.expiresAt).getTime();
        const now = Date.now();
        setTimeLeft(Math.floor((expiresAt - now) / 1000));
        setStatus("verifying");
        setMessage("Начните верификацию в игре");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Ошибка начала верификации");
    }
  }

  async function handleCheck() {
    if (!sessionId) return;

    setStatus("checking");
    try {
      const res = await fetch("/api/verification/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, warfaceNick }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.verified) {
          setStatus("success");
          setMessage("✅ Аккаунт успешно привязан!");
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          setEquipped(data.equipped || []);
          setMissing(data.missing || []);
          setStatus("verifying");
          setMessage(`Установлено ${data.equipped?.length || 0} из ${badges.length}`);
        }
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Ошибка проверки");
    }
  }

  async function handleCancel() {
    if (!sessionId) return;

    try {
      await fetch("/api/verification/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      setStatus("idle");
      setSessionId("");
      setBadges([]);
      setTimeLeft(0);
      setMessage("");
    } catch (error) {
      console.error("Cancel error:", error);
    }
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-wf-accent" />
        Привязка игрового персонажа
      </h2>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-wf-muted/20 rounded-lg border border-wf-border">
        <h3 className="text-sm font-semibold text-wf-text mb-3">Инструкция:</h3>
        <ol className="space-y-2 text-sm text-wf-muted_text list-decimal list-inside">
          <li>Зайдите в игру персонажем, которого хотите привязать, и не выходите из игры до окончания процесса.</li>
          <li>Введите ник привязываемого персонажа в поле ниже и нажмите кнопку «НАЧАТЬ ПРИВЯЗКУ».</li>
          <li>Система проверит ваши достижения и выберет 3 случайных значка из тех, что у вас уже есть.</li>
          <li>У Вас будет <span className="text-wf-accent font-bold">20 минут</span>, чтобы установить эти 3 значка в игровой профиль персонажа.</li>
          <li>Для установки значков откройте игровой профиль персонажа и выберите полученные награды в слоты для значков.</li>
          <li>После установки значков <span className="text-red-400 font-bold">обязательно</span> смените игровой канал. Для этого в игре зайдите в раздел PvP, далее в правом верхнем углу кнопка «Смена канала». Выберите <span className="text-wf-accent font-bold">другой</span> канал, не тот, на котором Вы находитесь сейчас. Например, если Вы находитесь на канале «Ветераны 01», нужно сменить его на «Ветераны 07».</li>
          <li>Затем нажмите кнопку «ПРОВЕРИТЬ ДОСТИЖЕНИЯ».</li>
          <li>Если все прошло успешно, то аккаунт в игре привяжется к аккаунту на сайте.</li>
        </ol>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={cn(
          "mb-4 p-4 rounded-lg border flex items-center gap-2",
          status === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" :
          status === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
          "bg-wf-accent/10 border-wf-accent/30 text-wf-accent"
        )}>
          {status === "success" ? <Check className="w-5 h-5" /> :
           status === "error" ? <X className="w-5 h-5" /> :
           status === "checking" ? <Loader2 className="w-5 h-5 animate-spin" /> :
           <AlertTriangle className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Initial State */}
      {status === "idle" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-wf-muted_text mb-2">
              Ник персонажа в Warface
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={warfaceNick}
                onChange={(e) => setWarfaceNick(e.target.value)}
                placeholder="хБездарь"
                className="flex-1 px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text focus:outline-none focus:border-wf-accent"
              />
              <button
                onClick={handleStart}
                disabled={!warfaceNick.trim()}
                className="px-6 py-2 bg-wf-accent text-black font-medium rounded-lg hover:bg-wf-accent/90 disabled:opacity-50 transition-colors"
              >
                НАЧАТЬ ПРИВЯЗКУ
              </button>
            </div>
            <p className="text-xs text-wf-muted_text mt-2">
              Установите 3 случайных значка в игровом профиле
            </p>
          </div>
        </div>
      )}

      {/* Verification State */}
      {status === "verifying" && (
        <div className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-between p-4 bg-wf-muted/20 rounded-lg border border-wf-border">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-wf-accent" />
              <span className="text-sm text-wf-muted_text">Осталось времени:</span>
            </div>
            <span className={cn(
              "text-lg font-bold tabular-nums",
              timeLeft < 60 ? "text-red-400" : "text-wf-accent"
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Badges to Equip */}
          <div>
            <h3 className="text-sm font-semibold text-wf-text mb-3">
              Установите значки в профиле:
              <span className="text-xs text-wf-muted_text ml-2">
                ({badges.length} шт.)
              </span>
            </h3>
            <div className="space-y-2">
              {badges.length > 0 ? (
                badges.map((badgeId) => {
                  const badge = BADGE_INFO[badgeId] || {
                    name: badgeId,
                    description: "Достижение",
                    icon: "🏅",
                  };
                  const isEquipped = equipped.includes(badgeId);
                  const isMissing = missing.includes(badgeId);

                  return (
                    <div
                      key={badgeId}
                      className={cn(
                        "p-3 rounded-lg border flex items-center gap-3",
                        isEquipped ? "bg-green-500/10 border-green-500/30" :
                        isMissing ? "bg-red-500/10 border-red-500/30" :
                        "bg-wf-bg border-wf-border"
                      )}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-wf-text">{badge.name}</p>
                        <p className="text-xs text-wf-muted_text">{badge.description}</p>
                      </div>
                      {isEquipped ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : isMissing ? (
                        <X className="w-5 h-5 text-red-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-wf-muted_text border-t-transparent animate-spin" />
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-wf-muted_text text-center py-4">
                  Загрузка достижений...
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              className="flex-1 px-6 py-3 bg-wf-accent text-black font-medium rounded-lg hover:bg-wf-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              ПРОВЕРИТЬ ДОСТИЖЕНИЯ
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-red-500/20 text-red-400 font-medium rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              Отмена
            </button>
          </div>

          {/* Channel Change Reminder */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ <strong>Важно:</strong> После установки значков обязательно смените канал в игре!
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "success" && (
        <div className="text-center py-8">
          <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-400 mb-2">Аккаунт привязан!</h3>
          <p className="text-wf-muted_text">Перенаправление...</p>
        </div>
      )}
    </div>
  );
}
