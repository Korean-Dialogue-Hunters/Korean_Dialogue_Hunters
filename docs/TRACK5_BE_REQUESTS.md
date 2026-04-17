# 트랙 5 — Korean Level 시스템: BE 요청 정리

> **작성일**: 2026-04-16
> **작성 근거**: BE 레포 (`korean_learning_simulator_backend`) 전체 코드 검증 후 작성
> **FE TODO 참조**: `docs/TODO.md` 트랙 5 (T5-01 ~ T5-10)

---

## 현재 BE 상태 요약

### 이미 있는 것
| 항목 | 위치 | 설명 |
|------|------|------|
| 유저 프로필 테이블 | `user_profile` (Supabase) | user_id, user_nickname, country, cultural_interest, latest_grade |
| 세션 테이블 | `session` | session_id, user_id, korean_level(**문자열**: Beginner/Intermediate/Advanced) |
| 평가 테이블 | `evaluation` | session_id, total_score_10, grade, 5축 점수 |
| 등급 계산 | `infra/scoring/service.py` | total_score_10 → S/A/B/C 등급 (기준: S≥9.1, A≥7.1, B≥5.1) |
| 유저 세션 목록 조회 | `GET /v1/users/{nickname}/sessions` | 완료 세션 리스트 + 정렬 |
| 평균 점수 조회 | `supabase_repository.get_average_score_by_user()` | 유저별 평균 점수 |
| 저점 세션 조회 | `supabase_repository.get_low_score_sessions()` | 일정 점수 이하 세션 필터 |
| 승급 시험 스캐폴드 | `usecases/exam_orchestrator.py` | 미완성 시험 세션 플로우 골격 |
| 시험 합격 판정 | `domain/exam/scoring.py` → `is_conversation_passed(score ≥ 8.0)` | 점수 기준 합격 여부 |

### 없는 것 (신규 필요)
- `user_profile.korean_level` 정수 필드 (1~6)
- 승급 자격 판정 API
- 승급 시험 엔드포인트
- 강등 판정 로직
- 레벨 변경 이력 추적

---

## BE 요청 목록

---

### BE-T5-01: `user_profile` 테이블에 `korean_level` 정수 필드 추가

**대응 TODO**: T5-01

**현재 문제**:
- `session` 테이블에 `korean_level`이 문자열("Beginner"/"Intermediate"/"Advanced")로 저장됨
- `user_profile` 테이블에는 `korean_level` 필드 자체가 없음
- 유저의 "현재 레벨"을 추적할 단일 정수 필드가 필요

**요청 내용**:

1. `user_profile` 테이블에 `korean_level INT` 컬럼 추가 (기본값 1, 범위 1~6)
2. `UserProfileRecord` 모델 (`models.py:81`)에 `korean_level: int` 필드 추가
3. `UserProfileResponse` 스키마 (`schemas/user.py:16`)에 `korean_level: int` 필드 추가
4. 기존 유저 마이그레이션: Beginner→1, Intermediate→3, Advanced→5

**DB 변경**:
```sql
ALTER TABLE user_profile
  ADD COLUMN korean_level INT DEFAULT 1
  CHECK (korean_level >= 1 AND korean_level <= 6);

-- 기존 유저 마이그레이션 (session 테이블의 최신 korean_level 기준)
UPDATE user_profile up
SET korean_level = CASE
  WHEN s.korean_level = 'Beginner' THEN 1
  WHEN s.korean_level = 'Intermediate' THEN 3
  WHEN s.korean_level = 'Advanced' THEN 5
  ELSE 1
END
FROM (
  SELECT DISTINCT ON (user_id) user_id, korean_level
  FROM session ORDER BY user_id, created_at DESC
) s
WHERE up.user_id = s.user_id;
```

**FE 영향**: `GET /v1/users/{nickname}/profile` 응답에 `korean_level: int` 추가되면 FE에서 바로 사용 가능

---

### BE-T5-02: 승급 자격 판정 API

**대응 TODO**: T5-04

**엔드포인트**: `GET /v1/users/{user_nickname}/level-up/eligibility`

**로직**:
1. 현재 `korean_level` 조회 (user_profile 테이블)
2. 현재 레벨에서 완료한 세션 수 카운트 (`session` 테이블에서 `korean_level` 매칭)
3. 최근 5회 세션의 `total_score_10` 평균 계산 (`evaluation` 테이블 조인)
4. 자격 조건 판정:
   - `completed_sessions >= 5` AND `avg_score >= 8.0`
   - 이미 최고 레벨(6)이면 자격 없음

**응답 스키마 (제안)**:
```json
{
  "currentLevel": 2,
  "nextLevel": 3,
  "eligible": false,
  "completedSessions": 3,
  "requiredSessions": 5,
  "averageScore": 7.2,
  "requiredScore": 8.0
}
```

**BE 참고 코드**:
- `supabase_repository.get_sessions_by_user()` — 세션 목록 조회 이미 존재
- `supabase_repository.get_average_score_by_user()` — 평균 점수 조회 이미 존재
- 위 메서드들을 **현재 레벨 필터** 조건만 추가하면 재활용 가능

**조건 미달 시에도 진행 상황을 반환해야 함** — FE에서 "N회 더 대화하세요", "평균 N점 더 필요" 등 안내에 사용

---

### BE-T5-03: 승급 시험 엔드포인트

**대응 TODO**: T5-05

**엔드포인트 2개**:

#### (A) 승급 시험 세션 생성
`POST /v1/users/{user_nickname}/level-up/exam`

**로직**:
1. 자격 조건 재검증 (eligible=true 확인)
2. `korean_level + 1` 수준으로 대화 세션 생성 (기존 `POST /v1/sessions`와 동일 플로우, 레벨만 다음 단계)
3. 세션에 `is_exam: true` 플래그 부여 (일반 대화와 구분)
4. 응답: 일반 `CreateSessionResponse`와 동일 + `examSessionId` 포함

**BE 참고 코드**:
- `usecases/exam_orchestrator.py` — 시험 세션 플로우 스캐폴드 이미 존재 (미완성)
- `learning_orchestrator.create_session()` — 기존 세션 생성 로직 재활용 가능

#### (B) 승급 시험 결과 판정
`POST /v1/users/{user_nickname}/level-up/result`

기존 `POST /v1/sessions/{session_id}/evaluation` 호출 후 자동 판정도 가능하지만,
명시적 결과 엔드포인트가 있으면 FE 구현이 깔끔함.

**로직**:
1. 시험 세션의 평가 결과 조회
2. Grade A 이상 (total_score_10 ≥ 7.1) → **합격**
   - `user_profile.korean_level` += 1
   - 평균 측정 리셋 (레벨 변경 시점부터 재집계)
3. Grade B 이하 → **불합격** (레벨 유지)

**응답 스키마 (제안)**:
```json
{
  "passed": true,
  "totalScore": 8.5,
  "grade": "A",
  "previousLevel": 2,
  "newLevel": 3
}
```

**논의 필요**:
- 합격 기준: `domain/exam/scoring.py`의 `is_conversation_passed`는 score ≥ 8.0 사용 중. Grade A 기준(≥ 7.1)과 다름. **어느 기준 사용?**
- 시험 세션은 일반 세션 통계에 포함하는지? (강등 판정 평균에 들어가면 불공정)

---

### BE-T5-04: 강등 판정 로직

**대응 TODO**: T5-09

**두 가지 구현 방식 (택 1)**:

#### 방식 A: 평가 시점 자동 판정 (권장)
- `POST /v1/sessions/{session_id}/evaluation` 완료 후 내부적으로 강등 체크
- 최근 3회 평균 ≤ 5.0 → `korean_level` -= 1 (최소 1)
- 응답에 `levelChanged: true`, `newLevel: N` 필드 추가

#### 방식 B: 별도 API
- `GET /v1/users/{user_nickname}/level-status` — 현재 레벨 + 강등 위험 여부 반환
- FE가 주기적으로 조회

**권장: 방식 A** — 평가 완료 시점에 자동으로 체크하면 FE에서 별도 호출 불필요

**로직 상세**:
1. 현재 레벨의 최근 3회 일반 대화(시험 세션 제외) 세션 조회
2. 3회 모두 완료된 경우에만 판정 (3회 미만이면 스킵)
3. `total_score_10` 평균 ≤ 5.0 → `korean_level` -= 1
4. 레벨 변경 시 평균 측정 리셋

**BE 참고 코드**:
- `supabase_repository.get_low_score_sessions()` — 저점 세션 조회 메서드 이미 존재
- 레벨 필터 + 시험 세션 제외 조건만 추가하면 재활용 가능

**FE 영향**: 평가 응답(`EvaluationResponse`)에 `levelChanged` + `newLevel` 필드 추가 시 FE에서 모달/토스트 표시

---

### BE-T5-05: 레벨 변경 이력 테이블 (선택)

**대응 TODO**: T5-09, T5-10

**필수는 아니지만 권장** — 레벨 변동 내역 추적용

**DB 변경**:
```sql
CREATE TABLE user_level_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL,
  old_level INT NOT NULL,
  new_level INT NOT NULL,
  reason VARCHAR(20) NOT NULL,  -- 'level_up', 'demotion', 'initial'
  session_id UUID,              -- 변경 원인 세션 (시험/강등 트리거)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**FE 영향**: 없음 (BE 내부 추적용). 추후 레벨 이력 화면 만들 때 활용 가능

---

### BE-T5-06: 세션 생성 시 `korean_level` 정수 매핑

**대응 TODO**: T5-02

**현재 문제**:
- `POST /v1/sessions`의 `CreateSessionRequest`가 `korean_level: str` (Beginner/Intermediate/Advanced) 받음
- 트랙 5 이후 FE는 `korean_level: int` (1~6)를 보내야 함

**요청 내용**:
1. `CreateSessionRequest.korean_level`이 정수(1~6)도 받을 수 있게 확장
2. 내부적으로 정수 → 등급 문자열 매핑 (프롬프트용):
   - 1~2 → Beginner / 3~4 → Intermediate / 5~6 → Advanced
3. `session` 테이블에도 `korean_level`을 정수로 저장 (또는 별도 `korean_level_int` 컬럼)

**또는**: FE가 기존처럼 문자열을 보내되, BE가 `user_profile.korean_level`(정수)를 우선 사용하는 방식도 가능. 이 경우 FE 변경 최소화.

**논의 필요**: 어떤 방식 선호하는지

---

## 요약: BE 작업 우선순위

| 순서 | 요청 ID | 내용 | 난이도 | 선결 조건 |
|------|---------|------|--------|-----------|
| 1 | BE-T5-01 | `korean_level` 정수 필드 추가 + 마이그레이션 | 낮음 | 없음 |
| 2 | BE-T5-06 | 세션 생성 시 정수 레벨 수용 | 낮음 | BE-T5-01 |
| 3 | BE-T5-02 | 승급 자격 판정 API | 중간 | BE-T5-01 |
| 4 | BE-T5-03 | 승급 시험 엔드포인트 (생성 + 결과) | 높음 | BE-T5-02 |
| 5 | BE-T5-04 | 강등 판정 로직 (평가 시점 자동) | 중간 | BE-T5-01 |
| 6 | BE-T5-05 | 레벨 변경 이력 테이블 | 낮음 | BE-T5-01 |

---

## 논의 필요 사항

1. **합격 기준 통일**: `is_conversation_passed`는 score ≥ 8.0, Grade A는 ≥ 7.1. 승급 시험 합격 기준은?
2. **시험 세션 통계 포함 여부**: 시험 세션이 강등 판정 평균에 포함되면 불공정할 수 있음
3. **세션 레벨 파라미터**: FE가 정수를 보낼지, BE가 user_profile에서 읽을지
4. **강등 알림 방식**: 평가 응답에 포함 vs 별도 API
