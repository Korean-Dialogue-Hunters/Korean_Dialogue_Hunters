"use client";

/* ──────────────────────────────────────────
   LevelSelect 컴포넌트 (TODO 14)
   - 한국어 수준 선택: 초급 / 중급 / 고급
   ────────────────────────────────────────── */

import { KoreanLevel } from "@/types/onboarding";

interface LevelSelectProps {
  value: KoreanLevel | "";
  onChange: (level: KoreanLevel) => void;
}

const LEVEL_OPTIONS: { value: KoreanLevel; desc: string }[] = [
  { value: "초급", desc: "안녕하세요, 감사합니다 정도" },
  { value: "중급", desc: "일상 대화가 가능한 수준" },
  { value: "고급", desc: "자연스러운 표현 구사 가능" },
];

export default function LevelSelect({ value, onChange }: LevelSelectProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {LEVEL_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              w-full rounded-xl px-4 py-3.5 text-left transition-all border
              ${isSelected
                ? "bg-orange/15 border-orange text-foreground"
                : "bg-surface border-surface-border text-foreground hover:bg-card-bg"
              }
            `}
          >
            <span className="font-semibold text-sm">{opt.value}</span>
            <span className="block text-[11px] text-tab-inactive mt-0.5">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
