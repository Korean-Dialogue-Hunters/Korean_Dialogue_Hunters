"use client";

/* ──────────────────────────────────────────
   HomeHeader 컴포넌트
   - 좌측: 앱 이름 "코대헌" + 영문 서브타이틀
   - 우측: 언어 선택 + 다크/라이트 전환 (홈에서만 표시)
   ────────────────────────────────────────── */

import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomeHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      {/* 좌측: 앱 타이틀 */}
      <div>
        <h1 className="text-2xl font-extrabold text-gold leading-tight">코대헌</h1>
        <p className="text-[11px] text-tab-inactive tracking-wide">
          Korean Dialogue Hunters
        </p>
      </div>
      {/* 우측: 언어 + 테마 토글 */}
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
