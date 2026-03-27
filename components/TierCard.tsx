"use client";

/* ──────────────────────────────────────────
   TierCard 컴포넌트
   - 현재 티어명 / 등급 표시
   - XP 현재값 · 최대값 / 진행 바
   - 다음 티어까지 남은 XP 표시
   ────────────────────────────────────────── */

import { UserProfile, TIER_BORDER_COLOR, TIER_TEXT_COLOR } from "@/types/user";

interface TierCardProps {
  user: UserProfile;
}

export default function TierCard({ user }: TierCardProps) {
  const borderColor = TIER_BORDER_COLOR[user.tier];
  const textColor = TIER_TEXT_COLOR[user.tier];

  const progressPercent = Math.min(
    Math.round((user.xp / user.xpMax) * 100),
    100
  );

  return (
    <div className={`mx-4 rounded-2xl border ${borderColor} bg-surface p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border-2 ${borderColor}`} />
          <span className={`text-lg font-bold ${textColor}`}>{user.tier}</span>
        </div>
        <span className="text-xs text-tab-inactive">
          {user.xp.toLocaleString()} / {user.xpMax.toLocaleString()} XP
        </span>
      </div>

      {/* XP 진행 바 트랙 — surface-border로 교체 */}
      <div className="w-full h-2 rounded-full bg-surface-border overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: tierProgressColor(user.tier),
          }}
        />
      </div>

      <p className="text-[11px] text-tab-inactive text-right">
        다음 티어까지{" "}
        <span className="text-foreground font-semibold">
          {user.xpToNextTier.toLocaleString()} XP
        </span>{" "}
        남음
      </p>
    </div>
  );
}

function tierProgressColor(tier: UserProfile["tier"]): string {
  const colors: Record<UserProfile["tier"], string> = {
    Bronze: "#CD7F32",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Platinum: "#E5E4E2",
    Diamond: "#B9F2FF",
  };
  return colors[tier];
}
