// src/app/missions/page.tsx
import { fetchMissions } from "@/services/wf-api.service";
import type { WFMission } from "@/types/warface";
import { Target, Clock, Users, Award, Shield } from "lucide-react";

const DIFFICULTY_LABELS: Record<string, string> = {
  story: "История",
  easy: "Легко",
  normal: "Нормально",
  hard: "Сложно",
  survival: "Выживание",
};

const MODE_LABELS: Record<string, string> = {
  PVE: "PvE",
  PVP: "PvP",
};

const TYPE_LABELS: Record<string, string> = {
  trainingmission: "Обучение",
  easymission: "Лёгкая миссия",
  normalmission: "Обычная миссия",
  hardmission: "Сложная миссия",
  survivalmission: "Выживание",
  anubisnormal: "Анубис",
  volcanonormal: "Вулкан",
  chernobylnormal: "Чернобыль",
  japanormal: "Япония",
  icebreakernormal: "Ледокол",
  marsnormal: "Марс",
  blackwoodnormal: "Блэквуд",
  swarm: "Рой",
  heist: "Ограбление",
};

function MissionCard({ mission }: { mission: WFMission }) {
  const expiresAt = mission.expire_at ? new Date(parseInt(mission.expire_at) * 1000) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;

  return (
    <div className={`bg-wf-card border border-wf-border rounded-lg p-4 transition-colors ${isExpired ? 'opacity-50' : 'hover:border-wf-accent/40'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-wf-text">
            {mission.UI?.Description?.text || mission.name}
          </h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-wf-accent/20 text-wf-accent">
              {DIFFICULTY_LABELS[mission.difficulty] || mission.difficulty}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              {MODE_LABELS[mission.game_mode] || mission.game_mode}
            </span>
          </div>
        </div>
        {mission.is_special_operation === "1" && (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
            Спецоперация
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-wf-muted_text">
        {mission.UI?.GameMode?.task && (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{mission.UI.GameMode.task}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {expiresAt 
              ? `До ${expiresAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
              : "Бессрочно"}
          </span>
        </div>

        {mission.is_infinity_survival === "1" && (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Бесконечное выживание</span>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mt-3 text-xs text-red-400 font-medium">
          Истекло
        </div>
      )}
    </div>
  );
}

export default async function MissionsPage() {
  const missions = await fetchMissions();

  // Группировка миссий по типу
  const activeMissions = missions.filter(m => m.game_mode === "PVE" && m.is_special_operation !== "1");
  const specialOps = missions.filter(m => m.is_special_operation === "1");
  const survivalMissions = missions.filter(m => m.is_infinity_survival === "1");

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-wf-accent" />
            Миссии Warface
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Актуальные миссии и спецоперации
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {missions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-wf-muted_text">Нет доступных миссий</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Special Operations */}
            {specialOps.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Спецоперации ({specialOps.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialOps.map((mission, i) => (
                    <MissionCard key={i} mission={mission} />
                  ))}
                </div>
              </section>
            )}

            {/* Survival Missions */}
            {survivalMissions.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Выживание ({survivalMissions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {survivalMissions.map((mission, i) => (
                    <MissionCard key={i} mission={mission} />
                  ))}
                </div>
              </section>
            )}

            {/* Regular Missions */}
            {activeMissions.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Обычные миссии ({activeMissions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeMissions.map((mission, i) => (
                    <MissionCard key={i} mission={mission} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-wf-accent/10 border border-wf-accent/20 rounded-lg">
          <p className="text-sm text-wf-muted_text">
            💡 Данные загружаются из API Warface и обновляются в реальном времени
          </p>
        </div>
      </div>
    </main>
  );
}
