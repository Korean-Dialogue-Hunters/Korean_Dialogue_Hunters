"use client";

/* ──────────────────────────────────────────
   HomeHeader 컴포넌트
   - 좌측: 앱 이름 "코대헌" + 영문 서브타이틀
   - 테마 토글은 layout.tsx의 ThemeToggle로 통합됨
   ────────────────────────────────────────── */

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
    </header>
  );
}
