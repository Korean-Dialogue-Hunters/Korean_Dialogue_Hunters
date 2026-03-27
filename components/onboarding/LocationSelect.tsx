"use client";

/* ──────────────────────────────────────────
   LocationSelect 컴포넌트 (TODO 16)
   - 가보고 싶은 장소 1가지 선택
   - MVP: 한강만 활성화
   ────────────────────────────────────────── */

import { LOCATION_OPTIONS, LocationId } from "@/types/onboarding";

interface LocationSelectProps {
  value: LocationId | "";
  onChange: (id: LocationId) => void;
}

export default function LocationSelect({ value, onChange }: LocationSelectProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {LOCATION_OPTIONS.map((loc) => {
        const isSelected = value === loc.id;
        const isDisabled = !loc.available;

        return (
          <button
            key={loc.id}
            type="button"
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(loc.id)}
            className={`
              w-full rounded-xl px-4 py-3.5 text-left border transition-all
              ${isDisabled
                ? "opacity-40 cursor-not-allowed bg-surface border-surface-border"
                : isSelected
                ? "bg-orange/15 border-orange text-foreground"
                : "bg-surface border-surface-border text-foreground hover:bg-card-bg"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{loc.label}</span>
              {isDisabled && (
                <span className="text-[10px] text-tab-inactive border border-surface-border rounded px-1.5 py-0.5">
                  준비 중
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
