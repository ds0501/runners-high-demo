import { useState } from 'react';
import { generateEncouragement, type Encouragement } from '../hooks/useParentReport';
import type { ParentReportSummary } from '../mock/parentReport';

export default function EncouragementCard({ report }: { report: ParentReportSummary }) {
  const [result, setResult] = useState<Encouragement | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      setResult(await generateEncouragement(report));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700">오늘의 격려 한마디</h2>

      {result ? (
        <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
          <p className="leading-relaxed text-gray-800">{result.text}</p>
          <p className="mt-2 text-xs text-emerald-700">
            {result.source === 'llm' ? '✨ AI가 작성했어요' : '기본 문구'}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          오늘 기록을 바탕으로 {report.studentName}에게 건넬 칭찬 문구를 만들어 드려요.
        </p>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? '만드는 중…' : result ? '다시 생성' : '격려 메시지 생성'}
      </button>
    </section>
  );
}
