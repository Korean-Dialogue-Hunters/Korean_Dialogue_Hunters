"use client";

/* ──────────────────────────────────────────
   CultureSelect 컴포넌트 (TODO 15)
   - 관심 있는 한국 문화 1가지 선택
   ────────────────────────────────────────── */

import { KultureInterest } from "@/types/onboarding";

interface CultureSelectProps {
  value: KultureInterest | "";
  onChange: (interest: KultureInterest) => void;
}

const CULTURE_OPTIONS: { value: KultureInterest; emoji: string }[] = [
  { value: "K-Content",       emoji: "🎬" },
  { value: "K-Pop",           emoji: "🎵" },
  { value: "K-Beauty",        emoji: "💄" },
  { value: "K-Food",          emoji: "🍜" },
  { value: "K-Gaming·eSports", emoji: "🎮" },
  { value: "Others",          emoji: "✨" },
];

export default function CultureSelect({ value, onChange }: CultureSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {CULTURE_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              rounded-xl py-4 flex flex-col items-center gap-1.5 border transition-all
              ${isSelected
                ? "bg-orange/15 border-orange"
                : "bg-surface border-surface-border hover:bg-card-bg"
              }
            `}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-xs text-foreground font-medium">{opt.value}</span>
          </button>
        );
      })}
    </div>
  );
}
