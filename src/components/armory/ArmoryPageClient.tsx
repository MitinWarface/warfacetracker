// src/components/armory/ArmoryPageClient.tsx
"use client";

import { useState } from "react";
import ArmoryGrid from "./ArmoryGrid";
import WeaponModal from "./WeaponModal";
import type { WeaponEntry } from "@/app/armory/page";

export default function ArmoryPageClient({
  weapons,
  showClass,
  showKills,
}: {
  weapons: WeaponEntry[];
  showClass: boolean;
  showKills: boolean;
}) {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponEntry | null>(null);

  return (
    <>
      <ArmoryGrid
        weapons={weapons}
        showClass={showClass}
        showKills={showKills}
        onWeaponClick={setSelectedWeapon}
      />
      
      <WeaponModal
        weapon={selectedWeapon}
        onClose={() => setSelectedWeapon(null)}
      />
    </>
  );
}
