/* ──────────────────────────────────────────
   채팅 관련 타입 정의
   ────────────────────────────────────────── */

/** 채팅 메시지 발신자 */
export type MessageSender = "user" | "ai";

/** 채팅 메시지 한 건 */
export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
}

/** 채팅 세션 상태 */
export interface ChatSession {
  sessionId: string;
  personaId: "A" | "B";
  personaName: string;
  totalTurns: number;
  turnsLeft: number;
  isFinished: boolean;
  messages: ChatMessage[];
}
