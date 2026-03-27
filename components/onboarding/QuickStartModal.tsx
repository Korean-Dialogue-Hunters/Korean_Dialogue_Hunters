"use client";

/* ──────────────────────────────────────────
   QuickStartModal 컴포넌트 (TODO 17)
   - 온보딩 완료 시 "바로 대화를 시작할까요?" 팝업
   - YES → 시나리오 생성 API 호출 → /persona 이동
   - NO  → 홈(/)으로 이동 + 튜토리얼 플래그 초기화
   ────────────────────────────────────────── */

interface QuickStartModalProps {
  locationLabel: string;      // 선택한 장소명 (예: "한강")
  onYes: () => void;          // YES 선택 콜백
  onNo: () => void;           // NO 선택 콜백
}

export default function QuickStartModal({
  locationLabel,
  onYes,
  onNo,
}: QuickStartModalProps) {
  return (
    /* 반투명 배경 오버레이 */
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      {/* 팝업 카드 (하단 시트 스타일) */}
      <div className="w-full max-w-[480px] bg-card-bg rounded-t-3xl px-6 pt-6 pb-10 border-t border-card-border">
        {/* 상단 핸들 바 */}
        <div className="w-10 h-1 bg-surface-border rounded-full mx-auto mb-5" />

        {/* 질문 텍스트 */}
        <h2 className="text-base font-bold text-foreground text-center mb-1">
          {locationLabel}(으)로 대화를 바로 시작하시겠습니까?
        </h2>
        <p className="text-xs text-tab-inactive text-center mb-6">
          지금 시작하거나, 나중에 홈에서 시작할 수 있어요.
        </p>

        {/* 버튼 영역 */}
        <div className="flex flex-col gap-3">
          {/* YES 버튼 */}
          <button
            type="button"
            onClick={onYes}
            className="w-full py-3.5 rounded-2xl bg-orange text-background font-bold text-sm active:scale-95 transition-transform"
          >
            네, 지금 시작할게요!
          </button>

          {/* NO 버튼 */}
          <button
            type="button"
            onClick={onNo}
            className="w-full py-3.5 rounded-2xl bg-btn-primary text-btn-primary-text text-sm active:scale-95 transition-transform border border-surface-border"
          >
            아니요, 나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
