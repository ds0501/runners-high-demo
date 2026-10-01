import { formatMinutes } from '../hooks/useParentReport';
import type { ParentReportSummary } from '../mock/parentReport';

// 진한 그린 → 연한 그린 순서 (비중이 큰 과목이 진하게)
const SEGMENT_STYLES = [
  { stroke: 'stroke-emerald-700', dot: 'bg-emerald-700' },
  { stroke: 'stroke-emerald-500', dot: 'bg-emerald-500' },
  { stroke: 'stroke-emerald-300', dot: 'bg-emerald-300' },
  { stroke: 'stroke-lime-300', dot: 'bg-lime-300' },
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SubjectBreakdownChart({
  breakdown,
}: {
  breakdown: ParentReportSummary['subjectBreakdown'];
}) {
  const total = breakdown.reduce((sum, s) => sum + s.minutes, 0);
  let offset = 0;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700">과목별 비중</h2>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="14" className="stroke-gray-100" />
            {total > 0 &&
              breakdown.map((s, i) => {
                const length = (s.minutes / total) * CIRCUMFERENCE;
                const circle = (
                  <circle
                    key={s.subject}
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="14"
                    strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                    strokeDashoffset={-offset}
                    className={SEGMENT_STYLES[i % SEGMENT_STYLES.length].stroke}
                  />
                );
                offset += length;
                return circle;
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500">총</span>
            <span className="text-sm font-bold text-gray-900">{formatMinutes(total)}</span>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2">
          {breakdown.map((s, i) => (
            <li key={s.subject} className="flex items-center gap-2 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${SEGMENT_STYLES[i % SEGMENT_STYLES.length].dot}`} />
              <span className="font-medium text-gray-800">{s.subject}</span>
              <span className="ml-auto text-gray-500">
                {formatMinutes(s.minutes)} · {total > 0 ? Math.round((s.minutes / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
