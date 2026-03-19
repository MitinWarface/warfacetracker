// src/app/armory/[weaponId]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchWeaponCatalog } from "@/services/wf-api.service";
import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ weaponId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { weaponId } = await params;
  return { title: `Оружие: ${decodeURIComponent(weaponId)}` };
}

const CATEGORY_LABELS: Record<string, string> = {
  ar: "Штурмовые",
  smg: "ПП",
  shg: "Дробовики",
  sr: "Снайперские",
  mg: "Пулемёты",
  pt: "Пистолеты",
  kn: "Холодное",
  grenade: "Гранаты",
  other: "Прочее",
};

function getCategory(id: string): string {
  if (id.startsWith("ar")) return "ar";
  if (id.startsWith("smg")) return "smg";
  if (id.startsWith("shg")) return "shg";
  if (id.startsWith("sr")) return "sr";
  if (id.startsWith("hmg") || id.startsWith("mg")) return "mg";
  if (id.startsWith("pt")) return "pt";
  if (id.startsWith("kn")) return "kn";
  if (id.startsWith("sg") || id.startsWith("gl")) return "grenade";
  return "other";
}

export default async function WeaponPage({ params }: Props) {
  const { weaponId } = await params;
  const decodedId = decodeURIComponent(weaponId);

  const catalog = await fetchWeaponCatalog();
  const weapon = catalog.find(w => w.id === decodedId);

  if (!weapon) {
    notFound();
  }

  const category = getCategory(decodedId);
  const bare = decodedId.replace(/_shop$/, "");
  const imageUrl = `https://cdn.wfts.su/weapons/weapons_${bare}.png`;

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/armory"
            className="inline-flex items-center gap-2 text-sm text-wf-muted_text hover:text-wf-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к оружейной
          </Link>
          <h1 className="text-2xl font-bold">{weapon.name}</h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Категория: <span className="text-wf-accent">{CATEGORY_LABELS[category] || category}</span>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Weapon Image */}
          <div className="bg-wf-card border border-wf-border rounded-lg p-6 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={weapon.name}
              className="max-h-64 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Stats */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-wf-accent" />
                Информация
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-wf-muted_text">Название</dt>
                  <dd className="text-sm font-medium text-wf-text">{weapon.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-wf-muted_text">Категория</dt>
                  <dd className="text-sm font-medium text-wf-accent">{CATEGORY_LABELS[category] || category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-wf-muted_text">ID</dt>
                  <dd className="text-sm font-mono text-wf-muted_text">{decodedId}</dd>
                </div>
              </dl>
            </div>

            {/* Note about stats */}
            <div className="bg-wf-accent/10 border border-wf-accent/20 rounded-lg p-4">
              <p className="text-sm text-wf-muted_text">
                ⚠️ API Warface не предоставляет характеристики оружия (урон, скорострельность и т.д.).
                Для получения этой информации обратитесь к официальной вики или игровым файлам.
              </p>
            </div>
          </div>
        </div>

        {/* Related Weapons */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Похожее оружие</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {catalog
              .filter(w => getCategory(w.id) === category && w.id !== decodedId)
              .slice(0, 6)
              .map(w => (
                <Link
                  key={w.id}
                  href={`/armory/${encodeURIComponent(w.id)}`}
                  className="bg-wf-card border border-wf-border rounded-lg p-3 hover:border-wf-accent/30 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.wfts.su/weapons/weapons_${w.id.replace(/_shop$/, "")}.png`}
                    alt={w.name}
                    className="w-full h-16 object-contain mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    loading="lazy"
                  />
                  <p className="text-xs text-wf-text text-center line-clamp-2">{w.name}</p>
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </main>
  );
}
