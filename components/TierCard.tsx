"use client";

/* ──────────────────────────────────────────
   TierCard 컴포넌트
   - 닉네임 (셋업에서 설정한 userNickname)
   - 티어 + 레벨 표시
   - XP 진행 바 + 남은 XP
   ────────────────────────────────────────── */

import { Trophy } from "lucide-react";
import { UserProfile, GRADE_BORDER_COLOR, GRADE_TEXT_COLOR } from "@/types/user";

interface TierCardProps {
  user: UserProfile;
}

export default function TierCard({ user }: TierCardProps) {
  const borderColor = GRADE_BORDER_COLOR[user.grade];
  const textColor = GRADE_TEXT_COLOR[user.grade];

  const progressPercent = Math.min(
    Math.round((user.xp / user.xpMax) * 100),
    100
  );

  return (
    <div className={`mx-5 rounded-2xl border ${borderColor} bg-card-bg p-5`}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* 상단: 닉네임 + 티어/레벨 */}
      <div className="flex items-center justify-between mb-4">
        {/* 좌측: 닉네임 */}
        <div>
          <span className="text-lg font-bold text-foreground block leading-tight">
            {user.userNickname}
          </span>
          <span className="text-[11px] text-tab-inactive">님, 환영해요!</span>
        </div>
        {/* 우측: 티어 뱃지 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface">
            <Trophy size={16} strokeWidth={1.8} className={textColor} />
          </div>
          <span className={`text-sm font-bold ${textColor}`}>{user.grade}</span>
        </div>
      </div>

      {/* XP 진행 바 */}
      <div className="w-full h-2.5 rounded-full bg-surface-border overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: gradeProgressColor(user.grade),
          }}
        />
      </div>

      {/* 하단: XP 현재/최대 + 남은 XP */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-tab-inactive">
          <span className="text-foreground font-semibold">{user.xp.toLocaleString()}</span> / {user.xpMax.toLocaleString()} XP
        </span>
        <span className="text-[11px] text-tab-inactive">
          다음 티어까지 <span className="text-foreground font-semibold">{user.xpToNext.toLocaleString()} XP</span>
        </span>
      </div>
    </div>
  );
}

/* 티어별 진행 바 색상 */
function gradeProgressColor(grade: UserProfile["grade"]): string {
  const colors: Record<UserProfile["grade"], string> = {
    Bronze: "#CD7F32",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Platinum: "#E5E4E2",
    Diamond: "#B9F2FF",
  };
  return colors[grade];
}
