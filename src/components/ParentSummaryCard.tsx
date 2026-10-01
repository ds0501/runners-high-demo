import { formatMinutes } from '../hooks/useParentReport';
import type { ParentReportSummary } from '../mock/parentReport';

export default function ParentSummaryCard({ report }: { report: ParentReportSummary }) {
  const main = report.subjectBreakdown[0];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{report.date.replaceAll('-', '. ')}</p>
      {main && (
        <p className="mt-1 text-lg font-bold text-gray-900">
          오늘 <span className="text-emerald-700">{main.subject}</span>에{' '}
          {formatMinutes(main.minutes)} 집중했어요
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-700">순공시간</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatMinutes(report.totalFocusMinutes)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-700">성취 배지</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{report.achievementCount}개</p>
          <p className="mt-1 text-lg leading-none" aria-hidden>
            {'🏅'.repeat(report.achievementCount)}
          </p>
        </div>
      </div>
    </section>
  );
}
