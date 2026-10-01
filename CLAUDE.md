## 러너스하이 확장 기능 데모
- 이 프로젝트는 러너스하이 실제 앱과 무관한 독립 데모입니다. 백엔드/DB 연결 없음
- 기능 A: AI 집중 저하 실시간 넛지 (src/mock/focusSimulator.ts, src/hooks/useNudgeStore.ts)
- 기능 B: 학부모 리포트 연동 (src/mock/parentReport.ts, src/pages/ParentReportPage.tsx)
- 모든 데이터는 src/mock 안의 정적 배열/함수로 처리. LLM 외 실제 API 호출 금지

## 개요
2학기 산학RD 과제 발표용 개념 검증(POC) 데모. 1학기 개념(집중 감지, 데일리 리포트)을 이어받아
"인식 → 개입(기능 A) → 비즈니스 확장(기능 B)" 스토리를 보여주는 것이 목표.
기능이 정교하게 동작하는 것보다 "왜 필요한지"가 드러나는 것이 중요 — 과도하게 만들지 말 것.

## 기술 스택 & 명령어
- Vite + React + TypeScript, Tailwind CSS v4(`@tailwindcss/vite` 플러그인, 설정 파일 없음), Zustand
- 라우팅: react-router v8 (`import ... from 'react-router'`), [src/App.tsx](src/App.tsx)에서 모든 화면을 `AppLayout`(상단 탭: 홈/집중 넛지/학부모 리포트)으로 감쌈. `/` → HomePage(기능 소개 + 학생 선택), `/study` → StudyTimerDemo, `/parent-report/:studentId` → ParentReportPage, 그 외 경로 → `/`로 리다이렉트
- `npm run dev` 개발 서버 / `npm run build` 타입체크 + 빌드 / `npm run lint`
- 폴더: `src/mock`(목업 데이터·시뮬레이터), `src/components`, `src/hooks`(훅·Zustand 스토어), `src/pages`

## 디자인 톤
- 1학기 앱과 "같은 앱 안의 기능"처럼 보이게: 화이트 배경, 그린(포레스트 그린) 계열 포인트, 둥근 모서리, 카드 레이아웃
- 경고색(빨강/주황) 지양 — 넛지도 그린 톤의 "안내"로 표현

## 기능 A: AI 집중 저하 실시간 넛지
감지만 하던 1학기 집중 모니터링 위에 "이탈이 지속되면 한 번 부드럽게 개입"하는 독립 페이지(StudyTimerDemo).

- 데이터: `setInterval` 3초마다 무작위 상태 생성 (70% focused / 30% distracted). 카메라/센서 없음
- 트리거: distracted가 임계치(기본 10초, 조절 가능) 이상 연속되면 1회 발화
- 쿨다운: 세션당 최대 2회, 발화 후 최소 재발화 간격
- 넛지 형태: 화면 하단 20% 영역 slide-up 토스트/배너 (모달 아님), 6초 후 자동 페이드아웃, 소리·진동 없음
- 문구: `NUDGE_MESSAGES` 3~4개 랜덤 로테이션, 경고가 아닌 제안 톤 (예: "잠깐 집중이 흐트러진 것 같아요")
- 회복: 넛지 발화 후 상태가 focused로 바뀌거나 "다시 집중" 클릭 시 recoveredCount +1
- 버튼: "학습 시작" / "일시정지"(시뮬레이터·트리거 함께 정지) / "학습 종료"(넛지 없이 즉시 종료, "오늘 집중 회복 N회" 카드 표시)
- 현재 집중/이탈 상태를 화면에 표시

```typescript
// src/mock/focusSimulator.ts
export interface FocusTick { timestamp: number; state: 'focused' | 'distracted'; }
export function startFocusSimulator(onTick: (tick: FocusTick) => void): ReturnType<typeof setInterval>;
export interface NudgeEvent {
  id: string; triggeredAt: number; distractedDurationSec: number; message: string;
  dismissedAt: number | null; recoveredAt: number | null;
}

// src/hooks/useNudgeStore.ts (Zustand, 새로고침 시 초기화되어도 무방)
interface NudgeStore {
  distractedSince: number | null; nudgeCount: number; currentMessage: string | null; recoveredCount: number;
  onFocusStateChange: (state: 'focused' | 'distracted') => void;
  dismissNudge: () => void;
}
```

컴포넌트: `StudyTimerDemo` → `useFocusSimulator()` + `NudgeBanner`(useNudgeStore 구독)

## 기능 B: 학부모 리포트 연동
학생용 데일리 리포트를 학부모용 요약으로 재구성한 페이지. 라우트 `/parent-report/:studentId` (예: `/parent-report/demo-1`).

- 인증 없음 (실제로는 토큰 인증 필요 — 개념 시연용)
- 데이터: `src/mock/parentReport.ts`의 `mockReports` 배열에 샘플 학생 2~3명
- 화면 순서: 상단 "학부모보기" 배지 → `ParentSummaryCard`(순공시간, 성취 배지 수) → `SubjectBreakdownChart`(간단한 도넛, recharts PieChart 또는 직접 SVG) → `EncouragementCard`
- 격려 메시지: "격려 메시지 생성" 버튼 → `generateEncouragement(report)` 결과를 화면에 표시 (실제 발송 없음)
  - `.env.local`에 `VITE_ANTHROPIC_API_KEY`가 있으면 Claude(`@anthropic-ai/sdk`, 브라우저 직접 호출) 사용, 없거나 실패·거절 시 고정 템플릿 3개 중 랜덤 반환 (`.env.example` 참고)
  - 프롬프트: 시스템 "학습 코칭 앱의 학부모 알림 마무리 담당자. 따뜻하고 구체적이며 2문장을 넘지 않음" /
    입력 순공시간={totalFocusMinutes}분, 주요과목={subjectBreakdown[0].subject}, 학생회고="{studentNote}"

```typescript
// src/mock/parentReport.ts
export interface ParentReportSummary {
  studentId: string; studentName: string; date: string; totalFocusMinutes: number;
  subjectBreakdown: { subject: string; minutes: number }[];
  achievementCount: number; studentNote: string | null;
}
// 예: { studentId: 'demo-1', studentName: '민수', date: '2026-10-01', totalFocusMinutes: 90,
//       subjectBreakdown: [{ subject: '수학', minutes: 60 }, { subject: '영어', minutes: 30 }],
//       achievementCount: 2, studentNote: '확률과 통계가 어려웠지만 끝까지 풀었어요' }
```

훅: `src/hooks/useParentReport.ts` — studentId로 mockReports에서 조회, `generateEncouragement`, `formatMinutes`도 여기에 있음
