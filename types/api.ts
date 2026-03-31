/* ──────────────────────────────────────────
   BE API 요청/응답 타입 정의
   - BE API 완성 전까지 mock data와 함께 사용
   ────────────────────────────────────────── */

/* ── POST /conversation/scenario ── */
// 요청: 장소 + 수준
export interface ScenarioRequest {
  location: string;   // 예: "hangang"
  level: string;      // 예: "초급"
}

// 페르소나 한 명의 데이터 (사용자가 맡을 역할/미션)
export interface Persona {
  id: "A" | "B";
  name: string;       // 역할 이름 (예: "김민준")
  age: number;
  gender: string;     // 예: "남성"
  occupation: string; // 예: "대학생"
  purpose: string;    // 사용자의 미션 (예: "한강 자전거길을 달리다 길을 잃어 도움을 요청하는 대학생")
  avatarUrl?: string;
}

// 응답: 시나리오 + 사용자가 선택할 역할 두 개
export interface ScenarioResponse {
  sessionId: string;
  scenario: string;   // 시나리오 설명 텍스트
  personas: [Persona, Persona]; // 항상 두 개 (A, B)
}

/* ── POST /conversation/turn ── */
// 요청: 내 메시지
export interface TurnRequest {
  sessionId: string;
  message: string;
}

// 응답: AI 답변 (스트리밍은 별도 처리)
export interface TurnResponse {
  reply: string;
  turnsLeft: number;  // 남은 턴 수
  isFinished: boolean; // 대화 종료 여부
}
