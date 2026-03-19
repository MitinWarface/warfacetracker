// src/components/missions/MissionCard.tsx
"use client";

import { useState } from "react";
import { Clock, BookOpen } from "lucide-react";

const DIFF_STYLES: Record<string, { label: string; cls: string; stripe: string; badge: string }> = {
  easy:   { label: "Легко",    cls: "bg-green-900/40  text-green-400  border-green-700/50",  stripe: "bg-green-500",  badge: "bg-green-800  text-green-200"  },
  normal: { label: "Нормально",cls: "bg-blue-900/40   text-blue-400   border-blue-700/50",   stripe: "bg-blue-500",   badge: "bg-blue-800   text-blue-200"   },
  hard:   { label: "Сложно",   cls: "bg-orange-900/40 text-orange-400 border-orange-700/50", stripe: "bg-orange-500", badge: "bg-orange-800 text-orange-200" },
  expert: { label: "Профи",    cls: "bg-red-900/40    text-red-400    border-red-700/50",    stripe: "bg-red-500",    badge: "bg-red-800    text-red-200"    },
  story:  { label: "История",  cls: "bg-purple-900/40 text-purple-400 border-purple-700/50", stripe: "bg-purple-500", badge: "bg-purple-800 text-purple-200" },
};

const DIFF_NUMBER: Record<string, string> = {
  easy: "I", normal: "II", hard: "III", expert: "IV", story: "S",
};

export interface Mission {
  name: string;
  difficulty: string;
  mission_type: string;
  game_mode: string;
  tutorial_mission?: string;
  is_special_operation: string;
  is_infinity_survival: string;
  expire_at: string;
  group?: string;
  full?: string;
  UI?: {
    Description?: {
      text?: string;
      icon?: string;
    };
    GameMode?: {
      text?: string;
      icon?: string;
      task?: string;
    };
  };
}

// База данных миссий с русскими названиями и ключами картинок
// На основе реальных данных API warface.ru
const MISSION_DATABASE: Record<string, { name: string; imageKey: string }> = {
  // Выживание (Whiteshark)
  "ct_mission_survival": { name: "Выживание", imageKey: "ct_survival_new" },
  "whitesharkstory": { name: "Выживание", imageKey: "ct_survival_new" },
  "whitesharkeasy": { name: "Выживание", imageKey: "ct_survival_new" },
  "whitesharknormal": { name: "Выживание", imageKey: "ct_survival_new" },
  "whitesharkhard": { name: "Выживание", imageKey: "ct_survival_new" },
  
  // Обучение
  "na_mission_path01_1": { name: "Путь в Африке", imageKey: "Initiation" },
  "trainingmission": { name: "Обучение", imageKey: "Initiation" },
  
  // Лёгкие миссии
  "na_mission_easy04_2": { name: "Лёгкая миссия 4-2", imageKey: "NAj04" },
  "easymission": { name: "Лёгкая миссия", imageKey: "easymission" },
  
  // Нормальные миссии
  "ct_mission_easy03_1": { name: "Нормальная миссия 3-1", imageKey: "CTp2" },
  "na_mission_normal04_1": { name: "Нормальная миссия 4-1", imageKey: "NAj04" },
  "normalmission": { name: "Нормальная миссия", imageKey: "normalmission" },
  
  // Сложные миссии
  "ct_mission_hard05_2": { name: "Сложная миссия 5-2", imageKey: "CTj05" },
  "me_mission_hard01_2": { name: "Сложная миссия 1-2", imageKey: "MEj01" },
  "hardmission": { name: "Сложная миссия", imageKey: "hardmission" },
  
  // Соло миссия
  "mission_solo_name": { name: "Соло миссия", imageKey: "Solo" },
  "solomission": { name: "Соло миссия", imageKey: "Solo" },
  
  // Зомби Конвой
  "ct_mission_zombie": { name: "Зомби Конвой", imageKey: "ZSD1j" },
  "zombiestory": { name: "Зомби Конвой", imageKey: "ZSD1j" },
  "zombieeasy": { name: "Зомби Конвой", imageKey: "ZSD1j" },
  "zombienormal": { name: "Зомби Конвой", imageKey: "ZSD1j" },
  "zombiehard": { name: "Зомби Конвой", imageKey: "ZSD1j" },
  
  // Зомби Башня
  "na_mission_zombietower_01": { name: "Зомби Башня", imageKey: "ZSD2j" },
  "zombietowerstory": { name: "Зомби Башня", imageKey: "ZSD2j" },
  "zombietowereasy": { name: "Зомби Башня", imageKey: "ZSD2j" },
  "zombietowernormal": { name: "Зомби Башня", imageKey: "ZSD2j" },
  "zombietowerhard": { name: "Зомби Башня", imageKey: "ZSD2j" },
  
  // Чернобыль
  "mission_chernobyl_name": { name: "Чернобыль", imageKey: "Chernobyl" },
  "chernobylstory": { name: "Чернобыль", imageKey: "Chernobyl" },
  "chernobyleasy": { name: "Чернобыль", imageKey: "Chernobyl" },
  "chernobylnormal": { name: "Чернобыль", imageKey: "Chernobyl" },
  "chernobylhard": { name: "Чернобыль", imageKey: "Chernobyl" },
  
  // Мидгард
  "mission_midgard_name": { name: "Мидгард", imageKey: "midgard" },
  "midgardstory": { name: "Мидгард", imageKey: "midgard" },
  "midgardeasy": { name: "Мидгард", imageKey: "midgard" },
  "midgardnormal": { name: "Мидгард", imageKey: "midgard" },
  "midgardhard": { name: "Мидгард", imageKey: "midgard" },
  
  // Асгард
  "mission_asgard_name": { name: "Асгард", imageKey: "asgard" },
  "asgardstory": { name: "Асгард", imageKey: "asgard" },
  "asgardeasy": { name: "Асгард", imageKey: "asgard" },
  "asgardnormal": { name: "Асгард", imageKey: "asgard" },
  "asgardhard": { name: "Асгард", imageKey: "asgard" },
  
  // Снежная Крепость - Босс
  "snow_mission_survival_04": { name: "Снежная Крепость", imageKey: "SnowBoss" },
  "snowfortressstory": { name: "Снежная Крепость", imageKey: "SnowBoss" },
  
  // Снежная Крепость 1
  "snow_mission_survival_01": { name: "Снежная Крепость 1", imageKey: "Snow1" },
  "snowfortress1easy": { name: "Снежная Крепость 1", imageKey: "Snow1" },
  "snowfortress1normal": { name: "Снежная Крепость 1", imageKey: "Snow1" },
  "snowfortress1hard": { name: "Снежная Крепость 1", imageKey: "Snow1" },
  
  // Снежная Крепость 2
  "snow_mission_survival_02": { name: "Снежная Крепость 2", imageKey: "Snow2" },
  "snowfortress2easy": { name: "Снежная Крепость 2", imageKey: "Snow2" },
  "snowfortress2normal": { name: "Снежная Крепость 2", imageKey: "Snow2" },
  "snowfortress2hard": { name: "Снежная Крепость 2", imageKey: "Snow2" },
  
  // Снежная Крепость 3
  "snow_mission_survival_03": { name: "Снежная Крепость 3", imageKey: "Snow3" },
  "snowfortress3easy": { name: "Снежная Крепость 3", imageKey: "Snow3" },
  "snowfortress3normal": { name: "Снежная Крепость 3", imageKey: "Snow3" },
  "snowfortress3hard": { name: "Снежная Крепость 3", imageKey: "Snow3" },
  
  // Вулкан
  "na_mission_volcano_01": { name: "Вулкан", imageKey: "NAvolcano" },
  "volcanostory": { name: "Вулкан", imageKey: "NAvolcano" },
  "volcanoeasy": { name: "Вулкан", imageKey: "NAvolcano" },
  "volcanonormal": { name: "Вулкан", imageKey: "NAvolcano" },
  "volcanohard": { name: "Вулкан", imageKey: "NAvolcano" },
  
  // Анубис
  "na_mission_anubis_01": { name: "Анубис", imageKey: "NA_Anubis" },
  "anubisstory": { name: "Анубис", imageKey: "NA_Anubis" },
  "anubiseasy": { name: "Анубис", imageKey: "NA_Anubis" },
  "anubisnormal": { name: "Анубис", imageKey: "NA_Anubis" },
  "anubishard": { name: "Анубис", imageKey: "NA_Anubis" },
  
  // Побег из Анубиса
  "na_mission_anubis_escape_name_01": { name: "Побег из Анубиса", imageKey: "Anubis_escape" },
  "anubisstory2": { name: "Побег из Анубиса", imageKey: "Anubis_escape" },
  "anubiseasy2": { name: "Побег из Анубиса", imageKey: "Anubis_escape" },
  "anubisnormal2": { name: "Побег из Анубиса", imageKey: "Anubis_escape" },
  "anubishard2": { name: "Побег из Анубиса", imageKey: "Anubis_escape" },
  
  // Ледокол
  "na_mission_icebreaker_01": { name: "Ледокол", imageKey: "Icebreaker" },
  "icebreakerstory": { name: "Ледокол", imageKey: "Icebreaker" },
  "icebreakereasy": { name: "Ледокол", imageKey: "Icebreaker" },
  "icebreakernormal": { name: "Ледокол", imageKey: "Icebreaker" },
  "icebreakerhard": { name: "Ледокол", imageKey: "Icebreaker" },
  
  // Япония
  "mission_japan_name": { name: "Япония", imageKey: "Japan" },
  "japanstory": { name: "Япония", imageKey: "Japan" },
  "japaneasy": { name: "Япония", imageKey: "Japan" },
  "japannormal": { name: "Япония", imageKey: "Japan" },
  "japanhard": { name: "Япония", imageKey: "Japan" },
  
  // Марс
  "mission_mars_name": { name: "Марс", imageKey: "Mars" },
  "marsstory": { name: "Марс", imageKey: "Mars" },
  "marseasy": { name: "Марс", imageKey: "Mars" },
  "marsnormal": { name: "Марс", imageKey: "Mars" },
  "marshard": { name: "Марс", imageKey: "Mars" },
  
  // Арена / Колизей
  "mission_arena_name": { name: "Арена", imageKey: "Coliseum" },
  "pve_arenastory": { name: "Арена", imageKey: "Coliseum" },
  "pve_arenaeasy": { name: "Арена", imageKey: "Coliseum" },
  "pve_arenanormal": { name: "Арена", imageKey: "Coliseum" },
  "pve_arenahard": { name: "Арена", imageKey: "Coliseum" },
  
  // Рейд (Blackwood)
  "mission_raid_name": { name: "Рейд", imageKey: "Raid" },
  "blackwoodstory": { name: "Рейд", imageKey: "Raid" },
  "blackwoodeasy": { name: "Рейд", imageKey: "Raid" },
};

function cleanName(raw: string): string {
  // Убираем @ и заменяем _ на пробелы
  let name = raw.replace(/^@/, "").replace(/_/g, " ").trim();
  
  // Проверяем в базе данных
  const cleanKey = name.toLowerCase().replace(/\s+/g, "_");
  if (MISSION_DATABASE[cleanKey]) {
    return MISSION_DATABASE[cleanKey].name;
  }
  
  // Проверяем по частичному совпадению
  for (const [key, value] of Object.entries(MISSION_DATABASE)) {
    if (cleanKey.includes(key) || key.includes(cleanKey)) {
      return value.name;
    }
  }
  
  // Если не нашли, возвращаем очищенное название
  return name;
}

function getImageKey(raw: string, missionType: string, group?: string): string {
  // Проверяем в базе данных по name
  const cleanKey = raw.replace(/^@/, "").toLowerCase().replace(/\s+/g, "_");
  if (MISSION_DATABASE[cleanKey]) {
    return MISSION_DATABASE[cleanKey].imageKey;
  }
  
  // Проверяем по mission_type
  const typeKey = missionType.toLowerCase();
  if (MISSION_DATABASE[typeKey]) {
    return MISSION_DATABASE[typeKey].imageKey;
  }
  
  // Проверяем по частичному совпадению mission_type
  for (const [key, value] of Object.entries(MISSION_DATABASE)) {
    if (typeKey.includes(key) || key.includes(typeKey)) {
      return value.imageKey;
    }
  }
  
  // Fallback на group или pve
  return group || "pve";
}

export default function MissionCard({ m }: { m: Mission }) {
  const [imgFailed, setImgFailed] = useState(false);
  
  const name = cleanName(m.name);
  const imageKey = getImageKey(m.name, m.mission_type, m.group);
  const diff       = DIFF_STYLES[m.difficulty] ?? { label: m.difficulty, cls: "bg-wf-muted text-wf-muted_text border-wf-border", stripe: "bg-wf-muted", badge: "bg-wf-muted text-wf-muted_text" };
  const diffNum    = DIFF_NUMBER[m.difficulty] ?? "?";
  const expAt      = parseInt(m.expire_at, 10);
  const expires    = !isNaN(expAt) && expAt > 0
    ? new Date(expAt * 1000).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const isSpecOp   = m.is_special_operation === "1";
  const isSurvival = m.is_infinity_survival === "1";
  const isTutorial = m.tutorial_mission === "1";
  
  // Формируем URL картинки в формате wfts.su
  // Пример: https://cdn.wfts.su/missions/mapImgPVE/anubis_escape_n.png
  // imageKey уже содержит правильное имя (например, "NA_Anubis", "ZSD1j")
  const difficultySuffix = {
    story: '_s',
    easy: '_e',
    normal: '_n',
    hard: '_h',
  }[m.difficulty] || '_n';
  
  const imageUrls = [
    `https://cdn.wfts.su/missions/mapImgPVE/${imageKey}${difficultySuffix}.png`,
    `https://cdn.wfts.su/missions/mapImgPVE/${imageKey}.png`,
    `https://cdn.wfts.su/missions/${imageKey}.jpg`,
  ];

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden hover:border-wf-accent/30 transition-colors group">
      {/* Mission image */}
      <div className="relative h-28 bg-wf-muted/20 overflow-hidden">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrls[0]}
            alt={name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          // Fallback: показываем цветной блок с названием
          <div className={`w-full h-full flex items-center justify-center ${
            isSpecOp ? 'bg-gradient-to-br from-wf-accent/30 to-wf-bg' :
            isSurvival ? 'bg-gradient-to-br from-blue-900/30 to-wf-bg' :
            isTutorial ? 'bg-gradient-to-br from-green-900/30 to-wf-bg' :
            'bg-gradient-to-br from-wf-muted/20 to-wf-bg'
          }`}>
            <div className="text-center px-4">
              <p className="text-sm font-semibold text-wf-text mb-1">{name}</p>
              <p className="text-xs text-wf-muted_text capitalize">{m.mission_type?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        )}
        <div className={`absolute top-2 left-2 w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center ${diff.badge}`}>
          {diffNum}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {isSpecOp   && <span className="text-[10px] bg-wf-accent/90 text-black px-1.5 py-0.5 rounded font-bold">СПЕЦОП</span>}
          {isSurvival && <span className="text-[10px] bg-blue-600/90 text-white px-1.5 py-0.5 rounded font-bold">ВЫЖИВ.</span>}
          {isTutorial && <span className="text-[10px] bg-green-600/90 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><BookOpen className="w-3 h-3" />ОБУЧ.</span>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${diff.stripe}`} />
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-wf-text text-sm leading-snug capitalize flex-1">{name}</h3>
          <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase ${diff.cls}`}>
            {diff.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-wf-muted_text">
          {!isSpecOp && !isSurvival && !isTutorial && (
            <span className="capitalize">{m.mission_type.replace(/_/g, " ")}</span>
          )}
          {m.group && (
            <span className="capitalize text-wf-accent/70">#{m.group}</span>
          )}
          {expires && (
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />до {expires}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
