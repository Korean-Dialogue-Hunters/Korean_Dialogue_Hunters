"use client";

/* ──────────────────────────────────────────
   온보딩 페이지 (/onboarding) — TODO 12~20
   - 4단계 설문: 국적 → 수준 → 관심 문화 → 가보고 싶은 곳
   - 완료 시 즉시 시작 팝업 표시
   - 결과를 로컬스토리지에 저장
   - 2회차 접속 시 자동으로 홈(/)으로 이동
   ────────────────────────────────────────── */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, isOnboardingDone } from "@/hooks/useOnboarding";
import { LOCATION_OPTIONS } from "@/types/onboarding";
import NationalitySelect from "@/components/onboarding/NationalitySelect";
import LevelSelect from "@/components/onboarding/LevelSelect";
import CultureSelect from "@/components/onboarding/CultureSelect";
import LocationSelect from "@/components/onboarding/LocationSelect";
import QuickStartModal from "@/components/onboarding/QuickStartModal";
import { useTheme } from "@/hooks/useTheme";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    step,
    nationality, setNationality,
    level, setLevel,
    kulturalInterest, setKulturalInterest,
    preferredLocation, setPreferredLocation,
    showModal,
    canProceed,
    goNext,
    goPrev,
    saveProfile,
  } = useOnboarding();

  const { isDark, toggleTheme } = useTheme();

  /* ── 2회차 접속: 온보딩 완료 상태면 홈으로 자동 이동 (TODO 20) ── */
  useEffect(() => {
    if (isOnboardingDone()) {
      router.replace("/");
    }
  }, [router]);

  /* ── 단계별 제목 텍스트 ── */
  const STEP_TITLES: Record<number, string> = {
    1: "어느 나라에서 오셨나요?",
    2: "현재 한국어 실력은요?",
    3: "가장 관심 있는 한국 문화는?",
    4: "가장 가보고 싶은 곳은?",
  };

  /* ── YES 선택: 프로필 저장 → /location으로 이동 ── */
  const handleYes = () => {
    saveProfile();
    router.push("/location");
  };

  /* ── NO 선택: 프로필 저장 → 홈(/)으로 이동 ── */
  const handleNo = () => {
    saveProfile();
    router.push("/");
  };

  /* ── 선택한 장소명 (즉시 시작 팝업에 표시) ── */
  const selectedLocationLabel =
    LOCATION_OPTIONS.find((l) => l.id === preferredLocation)?.label ?? "이 장소";

  return (
    <div className="flex flex-col min-h-screen px-5 pt-10 pb-10">
      {/* 상단: 진행 표시 + 테마 토글 + 이전 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-tab-inactive">{step} / 4</span>
        <div className="flex items-center gap-3">
          {/* 테마 토글 버튼 */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="테마 전환"
            className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          {/* 뒤로 가기 버튼 (1단계에서는 숨김) */}
          {step > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="text-xs text-tab-inactive hover:text-foreground"
            >
              ← 이전
            </button>
          )}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-1.5 rounded-full bg-surface-border mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* 단계 제목 */}
      <h1 className="text-xl font-bold text-foreground mb-6">
        {STEP_TITLES[step]}
      </h1>

      {/* 단계별 컴포넌트 렌더링 */}
      <div className="flex-1">
        {step === 1 && (
          <NationalitySelect value={nationality} onChange={setNationality} />
        )}
        {step === 2 && (
          <LevelSelect value={level} onChange={setLevel} />
        )}
        {step === 3 && (
          <CultureSelect value={kulturalInterest} onChange={setKulturalInterest} />
        )}
        {step === 4 && (
          <LocationSelect value={preferredLocation} onChange={setPreferredLocation} />
        )}
      </div>

      {/* 다음 단계 버튼 */}
      <button
        type="button"
        onClick={goNext}
        disabled={!canProceed()}
        className={`
          w-full py-4 rounded-2xl font-bold text-sm transition-all mt-6
          ${
            canProceed()
              ? "bg-orange text-background active:scale-95"
              : "bg-surface border border-surface-border text-tab-inactive cursor-not-allowed"
          }
        `}
      >
        {step < 4 ? "다음" : "완료"}
      </button>

      {/* 즉시 시작 팝업 (TODO 17) */}
      {showModal && (
        <QuickStartModal
          locationLabel={selectedLocationLabel}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
    </div>
  );
}
