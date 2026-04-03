# API_MAPPING.md — BE↔FE 필드 매핑 정리

> **네이밍 기준**: BE(백엔드) API 명세 기준. FE를 BE에 맞춰 리네이밍할 예정.
> **작성일**: 2026-04-02
> **BE 레포**: `Korean-Dialogue-Hunters/korean_learning_simulator_backend`

---

## 1. 세션 생성 — `POST /v1/sessions`

### Request (`CreateSessionRequest`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `user_nickname` | `SetupProfile.username` + `userCode` | ⚠️ | **BE는 단일 문자열, FE는 분리 저장. 어떻게 합칠지?** |
| `country` | `SetupProfile.nationality` | ✅ | FE `nationality` → BE `country`로 리네이밍 필요 |
| `korean_level` | `SetupProfile.level` | ✅ | FE `"초급"` → BE가 `"Beginner"`로 자동 변환해줌 |
| `cultural_interest` | `SetupProfile.culturalInterest` | ✅ | FE: `string[]` (중복 선택 + Others 직접 입력). BE도 string[]로 변경 확정 |
| `location` | `SetupProfile.location` | ✅ | **한글 기준 통일** (`"한강"`, `"명동"`, `"롯데월드"`) |

### Response (`CreateSessionResponse`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `session_id` | `ScenarioResponse.sessionId` | ✅ | 네이밍: `sessionId` → `session_id` |
| `scenario_title` | 없음 (null 고정) | 🆕 | FE `scenarioTitle` 변수는 있으나 미연동. 연동 시 사용 |
| `scene` | `ScenarioResponse.scenario` | ✅ | FE `scenario` → BE `scene`으로 리네이밍 |
| `personas` | `ScenarioResponse.personas` | ⚠️ | **BE: `{A: {name,age,gender,role,mission}, B: {...}}` (dict)** / **FE: `[Persona, Persona]` (array) + `occupation`/`purpose`** / 필드명 차이: `role`↔`occupation`, `mission`↔`purpose` |
| `relationship_type` | 없음 | 🆕 | FE에 없음 (표시할 곳 필요?) |
| `dialogue_function` | 없음 | 🆕 | FE에 없음 |
| `turn_limit` | `TOTAL_TURNS` (하드코딩 7) | ✅ | FE 상수 → BE 응답값으로 교체 |
| `location` | — | ✅ | |
| `user_profile` | — | ✅ | 응답에 포함되어 돌아옴 |

---

## 2. 역할 선택 — `POST /v1/sessions/{id}/role`

### Request (`SelectRoleRequest`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `selected_role` | persona 선택 시 `"A"` or `"B"` | ✅ | |

### Response (`SessionStateResponse`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `selected_role` | sessionStorage `myPersona.id` | ✅ | |
| `conversation_log` | `ChatMessage[]` | ⚠️ | BE: `{speaker, role, name, utterance}` / FE: `{id, sender, text, timestamp}`. **필드 전부 다름** |
| `turn_count` | `usedTurns` | ✅ | |
| `is_finished` | `isFinished` | ✅ | |
| `latest_ai_response` | `streamingText` | ✅ | AI 첫 발화가 여기 담김 |

---

## 3. 턴 진행 — `POST /v1/sessions/{id}/turns`

### Request (`CreateTurnRequest`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `user_input` | `sendMessage(text)` | ✅ | FE `message` → BE `user_input` |

### Response (`SessionStateResponse` 동일)

| BE 필드 | FE 현재 필드 | 비고 |
|---------|-------------|------|
| `latest_ai_response` | mock `MOCK_REPLIES[n]` → 이걸로 교체 | |
| `turn_count` | `usedTurns` | |
| `is_finished` | `isFinished` | |
| `conversation_log` | `messages` | 전체 로그가 매번 옴 |

---

## 4. 평가 — `POST /v1/sessions/{id}/evaluation`

### Response (`EvaluationResponse`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `session_id` | — | ✅ | 세션 고유 ID. BE가 응답에 포함하여 반환 |
| `conversation_log` | `FeedbackData.messages` | ✅ | |
| `location` | — | ✅ | 대화 장소 (예: `"한강"`). BE가 응답에 포함하여 반환 |
| `scenario_title` | 없음 | 🆕 | 결과 화면 상단 표시용 |
| `highlighted_log` | `FeedbackData.messages` | ⚠️ | BE: `{speaker, text, highlight}` / FE: `{sender, text, hasError, errorHighlights[]}`. 구조 다름 |
| `total_score_10` | `ResultData.totalScore` | ✅ | |
| `tier` | `ResultData.tier` | ⚠️ | **BE: `"Beginner <B>"` 문자열 / FE: `Tier` enum (`Bronze`\|`Silver`\|...). 매핑 규칙 필요** |
| `feedback` | `FeedbackData.feedbackSummary` | ✅ | |
| `llm_summary` | `ResultData.summary` | ✅ | |
| `SCK_match_count` | 없음 | 🆕 | SCK 일치 단어 수 (BE가 계산하여 반환) |
| `SCK_total_tokens` | 없음 | 🆕 | SCK 전체 토큰 수 (BE가 계산하여 반환) |
| `SCK_match_rate` | 없음 | 🆕 | SCK 일치율 (BE가 계산하여 반환) |
| `SCK_level_counts` | 없음 | 🆕 | SCK 급수별 발생 횟수 (BE가 계산하여 반환) |
| `SCK_level_word_counts` | 없음 | 🆕 | SCK 급수별 사용 단어 (BE가 계산하여 반환) |
| — | `EvaluationScores.vocabulary` | ❌ | **BE에 3축 개별 점수 필드 없음. `feedback` 텍스트 안에 포함됨. 파싱 or BE 추가 필요** |
| — | `EvaluationScores.situation` | ❌ | 동일 |
| — | `EvaluationScores.grammar` | ❌ | 동일 |
| — | `WrongWord[]` | ❌ | **BE에 오답 단어 목록 별도 필드 없음. `feedback` 텍스트에 포함** |

---

## 5. 유저 프로필 — `GET /v1/users/{nickname}/profile`

### Response (`UserProfileResponse`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `user_nickname` | `UserProfile.userId` | ✅ | 리네이밍 필요 |
| `country` | 없음 | — | FE에서 표시 안함 |
| `korean_level` | 없음 | — | |
| `has_korean_media_experience` | 없음 | — | |
| `latest_tier` | `UserProfile.tier` | ⚠️ | BE `"Beginner <B>"` vs FE `Tier` enum. 동일 이슈 |
| — | `UserProfile.xp` | ❌ | **BE에 없음** |
| — | `UserProfile.xpMax` | ❌ | **BE에 없음** |
| — | `UserProfile.xpToNextTier` | ❌ | **BE에 없음** |

---

## 6. 주간 통계 — `GET /v1/users/{nickname}/weekly-stats`

### Response (`WeeklyStatsResponse`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `conversation_count` | `WeeklyStats.conversationCount` | ✅ | |
| `average_score` | `WeeklyStats.averageScore` | ✅ | |
| `latest_tier` | — | — | |
| — | `WeeklyStats.streakDays` | ❌ | **BE에 없음** |

---

## 7. 복습 카운트 — `GET /v1/users/{nickname}/review/count`

### Response (`ReviewCountResponse`)

| BE 필드 | FE 현재 필드 | 일치 | 비고 |
|---------|-------------|------|------|
| `chosung_quiz_count` | 홈 배너 mock `3` | ✅ | |
| `flashcard_count` | 홈 배너 mock `5` | ✅ | |

---

## 8. 주간 복습 — `GET /v1/users/{nickname}/review/weekly`

### Response (`WeeklyReviewResponse`)

| BE 필드 | FE 현재 필드 | 비고 |
|---------|-------------|------|
| `selected_weak_sessions` | 재도전 카드 mock 데이터 | 최저점 세션 목록 |
| `chosung_quiz[]` | 미구현 | |
| `flashcards[]` | 미구현 | |

---

## ✅ 확인 완료 / 해결된 사항

| # | 질문 | 결론 |
|---|------|------|
| 1 | `user_nickname` 형식 | FE `userNickname` 그대로 단일 문자열로 전송 |
| 2 | `has_korean_media_experience` (bool) | **→ `cultural_interest` (string[])로 BE 변경 확정.** FE: 중복 선택 가능 + Others 직접 입력 |
| 3 | `location` 형식 | **한글 기준으로 통일** (`"한강"`, `"명동"`, `"롯데월드"`) |
| 4 | `tier` / `grade` 형식 | BE에서 수정 중 — pull 받으면 반영 예정 |
| 5 | 3축 개별 점수 (어휘/상황/문법) | BE에서 수정 중 — pull 받으면 반영 예정 |
| 6 | XP / streakDays | BE에서 수정 중 — pull 받으면 반영 예정 |

---

## 🔴 FE에만 있는 값 (BE에 없음 — BE 수정 후 재확인 필요)

| FE 필드 | 사용처 | 상태 |
|---------|--------|------|
| `UserProfile.xp` | 홈 TierCard | BE 수정 중 |
| `UserProfile.xpMax` | 홈 TierCard | BE 수정 중 |
| `UserProfile.xpToNext` | 홈 TierCard | BE 수정 중 |
| `WeeklyStats.streakDays` | 홈 WeeklyStats | BE 수정 중 |
| `EvaluationScores.vocabulary` | 결과 레이더 그래프 | BE 수정 중 |
| `EvaluationScores.situation` | 결과 레이더 그래프 | BE 수정 중 |
| `EvaluationScores.grammar` | 결과 레이더 그래프 | BE 수정 중 |
| `WrongWord[]` | 피드백 오답 목록 | BE 수정 중 |
| `ChatMessage.timestamp` | 채팅 버블 | FE 자체 관리 (BE 미제공) |
