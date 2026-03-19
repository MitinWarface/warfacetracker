// src/components/profile/PvEAchievementsTab.tsx
// Вкладка PvE достижений игрока
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Award, Search } from "lucide-react";

interface PvEAchievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedDate?: string;
  progress: number;
  maxProgress: number;
  icon?: string;
}

interface PvEAchievementsTabProps {
  achievements: PvEAchievement[];
  totalAchievements: number;
  completedAchievements: number;
  completionRate: number;
}

export default function PvEAchievementsTab({
  achievements,
  totalAchievements,
  completedAchievements,
  completionRate,
}: PvEAchievementsTabProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [search, setSearch] = useState('');

  const filteredAchievements = achievements.filter(ach => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'completed' && ach.completed) ||
      (filter === 'incomplete' && !ach.completed);
    
    const matchesSearch = 
      !search ||
      ach.name.toLowerCase().includes(search.toLowerCase()) ||
      ach.description.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-wf-text flex items-center gap-2">
            <Award className="w-5 h-5 text-wf-accent" />
            Достижения PvE
          </h3>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-wf-muted_text" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="px-3 py-1.5 bg-wf-bg border border-wf-border rounded text-sm text-wf-text focus:outline-none focus:border-wf-accent"
            />
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-wf-muted_text">Общий прогресс</span>
            <span className="text-sm font-bold text-wf-accent">{completionRate.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-wf-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-wf-accent to-green-400 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-wf-muted_text">
            <span>Выполнено: {completedAchievements.toLocaleString()}</span>
            <span>Осталось: {(totalAchievements - completedAchievements).toLocaleString()}</span>
            <span>Всего: {totalAchievements.toLocaleString()}</span>
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-wf-accent text-white'
                : 'bg-wf-bg border border-wf-border text-wf-muted_text hover:text-wf-text'
            }`}
          >
            Все ({totalAchievements})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-wf-accent text-white'
                : 'bg-wf-bg border border-wf-border text-wf-muted_text hover:text-wf-text'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 inline mr-1" />
            Выполнено ({completedAchievements})
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'incomplete'
                ? 'bg-wf-accent text-white'
                : 'bg-wf-bg border border-wf-border text-wf-muted_text hover:text-wf-text'
            }`}
          >
            <Circle className="w-3 h-3 inline mr-1" />
            В процессе ({totalAchievements - completedAchievements})
          </button>
        </div>
      </div>

      {/* Список достижений */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.length === 0 ? (
          <div className="col-span-full text-center py-12 text-wf-muted_text">
            <Award className="w-12 h-12 opacity-20 mx-auto mb-3" />
            <p>Достижения не найдены</p>
          </div>
        ) : (
          filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`bg-wf-card border rounded-lg p-4 transition-colors ${
                ach.completed
                  ? 'border-green-500/30 hover:border-green-500/50'
                  : 'border-wf-border hover:border-wf-accent/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Иконка статуса */}
                <div className="flex-shrink-0">
                  {ach.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-wf-muted_text" />
                  )}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm mb-1 ${
                    ach.completed ? 'text-green-400' : 'text-wf-text'
                  }`}>
                    {ach.name}
                  </h4>
                  <p className="text-xs text-wf-muted_text mb-2">{ach.description}</p>

                  {/* Прогресс */}
                  {!ach.completed && ach.maxProgress > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-wf-muted_text mb-1">
                        <span>Прогресс</span>
                        <span>{ach.progress.toLocaleString()} / {ach.maxProgress.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-wf-muted/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-wf-accent transition-all"
                          style={{ 
                            width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Дата выполнения */}
                  {ach.completed && ach.completedDate && (
                    <p className="text-xs text-green-400/60">
                      Выполнено: {new Date(ach.completedDate).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
