import { useMemo } from 'react';
import { mockReports, type ParentReportSummary } from '../mock/parentReport';

export function useParentReport(studentId: string | undefined) {
  return useMemo(() => mockReports.find((r) => r.studentId === studentId) ?? null, [studentId]);
}

/** 90 → "1시간 30분", 60 → "1시간", 45 → "45분" */
export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

// 이름 끝 글자에 받침이 있으면 "지은이가", 없으면 "민수가"
function withParticle(name: string, particle: '가' | '는') {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${name}${hasBatchim ? '이' : ''}${particle}`;
}

const TEMPLATES: ((r: ParentReportSummary) => string)[] = [
  (r) =>
    `${withParticle(r.studentName, '가')} 오늘 ${r.subjectBreakdown[0].subject}에 ${formatMinutes(r.subjectBreakdown[0].minutes)} 집중했어요. ` +
    (r.studentNote
      ? `"${r.studentNote}"라고 돌아본 만큼, 끝까지 해낸 점을 꼭 칭찬해 주세요.`
      : '꾸준히 자리를 지킨 노력을 따뜻하게 칭찬해 주세요.'),
  (r) =>
    `${withParticle(r.studentName, '는')} 오늘 총 ${formatMinutes(r.totalFocusMinutes)} 스스로 공부했고, 그중 ${r.subjectBreakdown[0].subject}에 가장 많은 시간을 들였어요. ` +
    `저녁에 "오늘 ${r.subjectBreakdown[0].subject} 어땠어?" 하고 먼저 물어봐 주시면 큰 힘이 될 거예요.`,
  (r) =>
    `${withParticle(r.studentName, '가')} 오늘 성취 배지를 ${r.achievementCount}개 모았어요. ` +
    '작은 성취도 알아봐 주시는 한마디가 내일의 집중으로 이어집니다.',
];

const SYSTEM_PROMPT =
  '당신은 학습 코칭 앱의 학부모 알림 마무리 담당자입니다. ' +
  '학부모에게 전할 격려 메시지를 한국어로 씁니다. 따뜻하고 구체적이며, 2문장을 넘지 않습니다. ' +
  '메시지 본문만 출력하세요.';

export interface Encouragement {
  text: string;
  source: 'llm' | 'template';
}

/**
 * VITE_ANTHROPIC_API_KEY가 있으면 Claude로 생성하고, 없거나 실패하면 고정 템플릿 3개 중 하나를 반환한다.
 * 데모 전용: 브라우저에서 직접 호출하므로 키가 번들에 노출된다. 키를 넣은 채로 외부에 배포하지 말 것.
 */
export async function generateEncouragement(report: ParentReportSummary): Promise<Encouragement> {
  const template = (): Encouragement => ({
    text: TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)](report),
    source: 'template',
  });

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) return template();

  try {
    // 키가 있을 때만 SDK를 불러와 기본 번들 크기를 늘리지 않는다
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const main = report.subjectBreakdown[0];
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      output_config: { effort: 'low' },
      // 안전 분류기가 거절하면 서버가 다른 모델로 자동 재시도
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content:
            `학생이름=${report.studentName}, 순공시간=${report.totalFocusMinutes}분, ` +
            `주요과목=${main?.subject ?? '없음'}, 학생회고="${report.studentNote ?? '없음'}"`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') return template();
    const text = response.content
      .flatMap((b) => (b.type === 'text' ? [b.text] : []))
      .join('')
      .trim();
    return text ? { text, source: 'llm' } : template();
  } catch (error) {
    console.warn('격려 메시지 LLM 호출 실패 — 템플릿으로 대체', error);
    return template();
  }
}
