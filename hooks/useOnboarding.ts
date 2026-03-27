"use client";

/* ──────────────────────────────────────────
   useOnboarding 커스텀 훅 (TODO 19, 20)
   - 온보딩 상태(단계, 입력값) 관리
   - 완료 시 로컬스토리지에 프로필 저장
   - 2회차 접속 감지 (onboardingDone 플래그)
   ────────────────────────────────────────── */

import { useState } from "react";
import { OnboardingProfile, OnboardingStep } from "@/types/onboarding";
import { KoreanLevel, KultureInterest, LocationId } from "@/types/onboarding";
import { validateOnboardingProfile } from "@/lib/onboardingValidation";

// 로컬스토리지 키 상수
export const ONBOARDING_DONE_KEY = "onboardingDone";
export const ONBOARDING_PROFILE_KEY = "onboardingProfile";

// 온보딩 완료 여부 확인 (서버 렌더링 시 window 없음 → false 반환)
export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_DONE_KEY) === "true";
}

// 저장된 프로필 불러오기
export function getSavedProfile(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ONBOARDING_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

export function useOnboarding() {
  // 현재 단계 (1: 국적, 2: 수준, 3: 문화, 4: 장소)
  const [step, setStep] = useState<OnboardingStep>(1);

  // 각 단계 입력값
  const [nationality, setNationality] = useState("");
  const [level, setLevel] = useState<KoreanLevel | "">("");
  const [kulturalInterest, setKulturalInterest] = useState<KultureInterest | "">("");
  const [preferredLocation, setPreferredLocation] = useState<LocationId | "">("");

  // 즉시 시작 팝업 표시 여부
  const [showModal, setShowModal] = useState(false);

  // 현재 단계에서 다음으로 넘어갈 수 있는지 확인
  const canProceed = (): boolean => {
    if (step === 1) return nationality.trim() !== "";
    if (step === 2) return level !== "";
    if (step === 3) return kulturalInterest !== "";
    if (step === 4) return preferredLocation !== "";
    return false;
  };

  // 다음 단계로 이동
  const goNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      // 마지막 단계 완료 → 팝업 표시
      setShowModal(true);
    }
  };

  // 이전 단계로 이동
  const goPrev = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  // 온보딩 완료 후 로컬스토리지에 저장
  const saveProfile = () => {
    // 타입 안전성: 모든 값이 채워져 있는지 검증
    if (!nationality || !level || !kulturalInterest || !preferredLocation) return;

    const profile: OnboardingProfile = {
      nationality,
      level,
      kulturalInterest,
      preferredLocation,
    };

    // 유효성 검사 (validateOnboardingProfile 함수 사용)
    const errors = validateOnboardingProfile(profile);
    if (errors.length > 0) return;

    // 로컬스토리지에 저장
    localStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
  };

  return {
    step,
    nationality, setNationality,
    level, setLevel,
    kulturalInterest, setKulturalInterest,
    preferredLocation, setPreferredLocation,
    showModal, setShowModal,
    canProceed,
    goNext,
    goPrev,
    saveProfile,
  };
}
