"use client";

/* ──────────────────────────────────────────
   WeeklyStats 컴포넌트
   - 대화 수 / 평균 점수 / 연속 학습일(스트릭) 3칸 가로 배열
   - 스트릭은 빨간색으로 강조
   ────────────────────────────────────────── */

import { WeeklyStats as WeeklyStatsType } from "@/types/user";

interface WeeklyStatsProps {
  stats: WeeklyStatsType;
}

export default function WeeklyStats({ stats }: WeeklyStatsProps) {
  return (
    <div className="mx-4 grid grid-cols-3 gap-2">
      <StatBox label="대화"     value={`${stats.conversationCount}회`}          highlight={false} />
      <StatBox label="평균 점수" value={`${stats.averageScore.toFixed(1)}점`}   highlight={false} />
      <StatBox label="스트릭"   value={`${stats.streakDays}일`}                 highlight={true} />
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface border border-surface-border py-3 px-2">
      <span className="text-[10px] text-tab-inactive mb-1">{label}</span>
      <span className={`text-lg font-bold ${highlight ? "text-red-400" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
