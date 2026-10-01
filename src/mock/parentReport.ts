export interface ParentReportSummary {
  studentId: string;
  studentName: string;
  date: string;
  totalFocusMinutes: number;
  subjectBreakdown: { subject: string; minutes: number }[];
  achievementCount: number;
  studentNote: string | null;
}

// totalFocusMinutes는 subjectBreakdown 합계와 일치시킨다. subjectBreakdown[0]이 주요 과목(LLM 프롬프트에 사용).
export const mockReports: ParentReportSummary[] = [
  {
    studentId: 'demo-1',
    studentName: '민수',
    date: '2026-10-01',
    totalFocusMinutes: 90,
    subjectBreakdown: [
      { subject: '수학', minutes: 60 },
      { subject: '영어', minutes: 30 },
    ],
    achievementCount: 2,
    studentNote: '확률과 통계가 어려웠지만 끝까지 풀었어요',
  },
  {
    studentId: 'demo-2',
    studentName: '지은',
    date: '2026-10-01',
    totalFocusMinutes: 150,
    subjectBreakdown: [
      { subject: '국어', minutes: 70 },
      { subject: '과학', minutes: 50 },
      { subject: '영어', minutes: 30 },
    ],
    achievementCount: 3,
    studentNote: '비문학 지문 3개를 시간 안에 다 읽었어요!',
  },
  {
    // 회고를 쓰지 않은 날 — studentNote가 null인 경우 확인용
    studentId: 'demo-3',
    studentName: '준호',
    date: '2026-10-01',
    totalFocusMinutes: 45,
    subjectBreakdown: [
      { subject: '영어', minutes: 30 },
      { subject: '수학', minutes: 15 },
    ],
    achievementCount: 1,
    studentNote: null,
  },
];
