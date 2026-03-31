/* ──────────────────────────────────────────
   결과 & 피드백 관련 타입 정의
   ────────────────────────────────────────── */

import { Tier } from "@/types/user";

/** 3축 평가 점수 */
export interface EvaluationScores {
  vocabulary: number;   // 어휘 점수 (0~10)
  situation: number;    // 상황 대처 점수 (0~10)
  grammar: number;      // 문법 점수 (0~10)
}

/** 결과 화면 데이터 */
export interface ResultData {
  sessionId: string;
  totalScore: number;   // 총점 (0~10, 가중평균)
  tier: Tier;
  scores: EvaluationScores;
  summary: string;      // 한 줄 요약
}

/** 피드백 - 오답 단어 */
export interface WrongWord {
  original: string;     // 사용자가 쓴 표현
  corrected: string;    // 올바른 표현
  meaning: string;      // 뜻풀이
}

/** 피드백 - 대화 로그 (하이라이트 포함) */
export interface FeedbackMessage {
  sender: "user" | "ai";
  text: string;
  hasError: boolean;          // 오답 포함 여부
  errorHighlights?: string[]; // 오답 부분 문자열 목록
}

/** 피드백 화면 데이터 */
export interface FeedbackData {
  sessionId: string;
  messages: FeedbackMessage[];
  wrongWords: WrongWord[];
  feedbackSummary: string;    // 전체 피드백 텍스트
  scores: EvaluationScores;
  totalScore: number;
}
