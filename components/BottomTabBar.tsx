"use client";

/* ──────────────────────────────────────────
   BottomTabBar 컴포넌트
   - 하단 고정 탭 바 (5개 탭)
   - 현재 경로(pathname)를 감지해 활성 탭 자동 표시
   - 활성: 주황색(tab-active) / 비활성: 회색(tab-inactive)
   - 온보딩 완료 전 또는 /onboarding 페이지에서는 숨김
   ────────────────────────────────────────── */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ONBOARDING_DONE_KEY } from "@/hooks/useOnboarding";

/* 탭 정의 타입 */
interface Tab {
  href: string;
  label: string;
  icon: string;
}

/* 5개 탭 목록 */
const TABS: Tab[] = [
  { href: "/",        label: "홈",     icon: "🏠" },
  { href: "/chat",    label: "대화",   icon: "💬" },
  { href: "/history", label: "기록",   icon: "📋" },
  { href: "/review",  label: "복습",   icon: "📚" },
  { href: "/profile", label: "내정보", icon: "👤" },
];

// 탭바를 항상 숨기는 경로 목록
const HIDDEN_PATHS = ["/onboarding"];

export default function BottomTabBar() {
  const pathname = usePathname();
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);

  /* 마운트 시 온보딩 완료 여부 확인 */
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_DONE_KEY) === "true";
    setIsOnboardingDone(done);
  }, [pathname]); // 경로가 바뀔 때마다 재확인 (온보딩 완료 직후 반영)

  // 온보딩 미완료 or 숨김 경로면 렌더링하지 않음
  if (!isOnboardingDone || HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-card-border z-50">
      <ul className="flex items-center justify-around py-2">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                  isActive ? "text-tab-active" : "text-tab-inactive"
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span className="text-[10px]">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
