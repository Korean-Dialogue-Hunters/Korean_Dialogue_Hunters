"use client";

/* ──────────────────────────────────────────
   상세 피드백 페이지 (/feedback)
   - 세부평가: 5축 레이더 차트
   - 역량분석: 5축 점수 바
   - 점수산출근거: feedback 텍스트
   ────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Home, Layers, BarChart3, FileText, Heart, BookOpen } from "lucide-react";
import { COMMON_CLASSES } from "@/lib/designSystem";
import { EvaluationScores } from "@/types/result";
import { EvaluationResponse } from "@/types/api";
import RadarChart from "@/components/result/RadarChart";

/* ── BE 응답 → 5축 점수 변환 ── */
function extractScores(data: EvaluationResponse): EvaluationScores {
  return {
    length: data.lengthScore ?? 5,
    vocabulary: data.vocabScore ?? 5,
    sceneMission: ((data.contextSceneMissionMatch ?? 1.5) / 3) * 10,
    relationship: ((data.contextRelationshipMatch ?? 1.5) / 3) * 10,
    spelling: data.spellingScore ?? 5,
  };
}

/* ── 하트 표시 (0~3) ── */
function Hearts({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => (
        <Heart key={i} size={16} strokeWidth={1.5}
          fill={i < count ? "var(--color-accent)" : "none"}
          color={i < count ? "var(--color-accent)" : "var(--color-card-border)"} />
      ))}
    </div>
  );
}

/* ── 점수 바 ── */
function ScoreBar({ label, score, maxScore = 10, hearts }: {
  label: string; score: number; maxScore?: number; hearts?: number;
}) {
  const percent = Math.min((score / maxScore) * 100, 100);
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {hearts !== undefined && <Hearts count={hearts} />}
          <span className="text-[13px] font-bold text-foreground">{score.toFixed(1)}</span>
        </div>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: "var(--color-accent)" }} />
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);
  const [scores, setScores] = useState<EvaluationScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("evaluationData");
    if (!raw) {
      router.replace("/result");
      return;
    }
    try {
      const data = JSON.parse(raw) as EvaluationResponse;
      setEvalData(data);
      setScores(extractScores(data));
    } catch {
      router.replace("/result");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-tab-inactive text-sm">{t("feedback.loading")}</p>
      </div>
    );
  }

  if (!evalData || !scores) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <p className="text-sm" style={{ color: "#DC3C3C" }}>{t("feedback.loadFailed")}</p>
        <button onClick={() => router.push("/")} className="text-sm text-accent underline">{t("common.home")}</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-5 pt-16 pb-24" style={{ backgroundColor: "var(--color-background)" }}>
      {/* ── 뒤로가기 ── */}
      <button type="button" onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-tab-inactive mb-6 self-start hover:opacity-70">
        <ArrowLeft size={16} strokeWidth={2} />
        <span>{t("feedback.backBtn")}</span>
      </button>

      {/* ── 헤더 ── */}
      <h1 className="text-xl font-bold text-foreground mb-6">{t("feedback.title")}</h1>

      {/* ── 1. 세부평가 (5축 레이더) ── */}
      <div className={`${COMMON_CLASSES.cardRounded} p-4 mb-4`}
        style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} strokeWidth={2} style={{ color: "var(--color-accent)" }} />
          <p className="text-sm font-bold text-foreground">{t("feedback.radarTitle")}</p>
        </div>
        <RadarChart scores={scores} />
      </div>

      {/* ── 2. 역량분석 (5축 바) ── */}
      <div className={`${COMMON_CLASSES.cardRounded} p-5 mb-4`}
        style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} strokeWidth={2} style={{ color: "var(--color-accent)" }} />
            <p className="text-sm font-bold text-foreground">{t("feedback.analysisTitle")}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-tab-inactive">{t("feedback.totalScoreLabel")}:</span>
            <span className="text-lg font-bold text-foreground">{evalData.totalScore10.toFixed(1)}</span>
            <span className="text-xs text-tab-inactive">/ 10</span>
          </div>
        </div>
        <ScoreBar label={t("eval.length")} score={scores.length} />
        <ScoreBar label={t("eval.vocab")} score={scores.vocabulary} />
        <ScoreBar label={t("eval.sceneMission")} score={scores.sceneMission}
          hearts={evalData.contextSceneMissionMatch} />
        <ScoreBar label={t("eval.relationship")} score={scores.relationship}
          hearts={evalData.contextRelationshipMatch} />
        <ScoreBar label={t("eval.spelling")} score={scores.spelling} />
      </div>

      {/* ── 2-1. SCK 어휘 사용 ── */}
      <div className={`${COMMON_CLASSES.cardRounded} p-5 mb-4`}
        style={{ backgroundColor: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} strokeWidth={2} style={{ color: "var(--color-accent)" }} />
            <p className="text-sm font-bold text-foreground">{t("feedback.sckTitle")}</p>
          </div>
          <span className="text-[11px] text-tab-inactive">
            {t("feedback.sckSummary", {
              match: evalData.sckMatchCount,
              total: evalData.sckTotalTokens,
              rate: Math.round((evalData.sckMatchRate ?? 0) * 100),
            })}
          </span>
        </div>
        {Object.keys(evalData.sckLevelCounts ?? {}).length === 0 ? (
          <p className="text-[12px] text-tab-inactive text-center py-2">{t("feedback.sckEmpty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(evalData.sckLevelCounts)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, count]) => {
                const words = evalData.sckLevelWordCounts?.[level] ?? [];
                return (
                  <div key={level}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)" }}>
                        {t("feedback.sckLevelLabel", { level })}
                      </span>
                      <span className="text-[11px] text-tab-inactive">
                        {t("feedback.sckCount", { count })}
                      </span>
                    </div>
                    {words.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {words.map((word, i) => (
                          <span key={`${level}-${i}`}
                            className="inline-block px-2 py-0.5 rounded-md text-[11px]"
                            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-foreground)", border: "1px solid var(--color-card-border)" }}>
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── 3. 점수 산출 근거 ── */}
      <div className={`${COMMON_CLASSES.cardRounded} p-4 mb-6`}
        style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)" }}>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} strokeWidth={2} style={{ color: "var(--color-accent)" }} />
          <p className="text-sm font-bold" style={{ color: "var(--color-foreground)" }}>{t("feedback.basisTitle")}</p>
        </div>
        <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: "var(--color-foreground)" }}>
          {evalData.feedback}
        </p>
      </div>

      {/* ── 하단 버튼 ── */}
      <div className="mt-auto space-y-3">
        <button type="button" onClick={() => router.push("/review")}
          className={`${COMMON_CLASSES.fullWidthBtn} flex items-center justify-center gap-2`}
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-btn-primary-text)" }}>
          <Layers size={18} strokeWidth={2} />
          <span>{t("feedback.reviewBtn")}</span>
        </button>
        <button type="button" onClick={() => router.push("/")}
          className={`${COMMON_CLASSES.fullWidthBtn} flex items-center justify-center gap-2`}
          style={{ backgroundColor: "var(--color-card-bg)", color: "var(--color-foreground)", border: "1px solid var(--color-card-border)" }}>
          <Home size={18} strokeWidth={2} />
          <span>{t("common.home")}</span>
        </button>
      </div>
    </div>
  );
}
