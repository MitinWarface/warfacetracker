// src/components/profile/RefreshButton.tsx
"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshPlayerAction } from "@/actions/player.actions";
import { useRouter } from "next/navigation";

export default function RefreshButton({ nickname }: { nickname: string }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleRefresh() {
    startTransition(async () => {
      const res = await refreshPlayerAction(nickname);
      setMsg(res.message);
      if (res.ok) {
        router.refresh();
        setTimeout(() => setMsg(null), 3000);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-wf-border text-wf-muted_text hover:text-wf-text hover:border-wf-accent/50 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Обновление…" : "Обновить"}
      </button>
      {msg && (
        <span className="text-xs text-wf-muted_text">{msg}</span>
      )}
    </div>
  );
}
