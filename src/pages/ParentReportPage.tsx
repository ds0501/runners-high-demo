import { Link, useParams } from 'react-router';
import EncouragementCard from '../components/EncouragementCard';
import ParentSummaryCard from '../components/ParentSummaryCard';
import SubjectBreakdownChart from '../components/SubjectBreakdownChart';
import { useParentReport } from '../hooks/useParentReport';
import { mockReports } from '../mock/parentReport';

export default function ParentReportPage() {
  const { studentId } = useParams();
  const report = useParentReport(studentId);

  return (
    <main className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <header>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              학부모보기
            </span>
            <span className="text-xs text-gray-400">기능 B</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {report ? `${report.studentName}의 오늘 리포트` : '리포트를 찾을 수 없어요'}
          </h1>
          {!report && <p className="mt-1 text-sm text-gray-500">studentId: {studentId}</p>}
        </header>

        {/* 시연용 학생 전환 탭 */}
        <nav className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-sm">
          {mockReports.map((r) => {
            const active = r.studentId === studentId;
            return (
              <Link
                key={r.studentId}
                to={`/parent-report/${r.studentId}`}
                aria-current={active ? 'page' : undefined}
                className={`rounded-xl py-2 text-center text-sm font-semibold transition-colors ${
                  active ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {r.studentName}
              </Link>
            );
          })}
        </nav>

        {report && (
          <>
            <ParentSummaryCard report={report} />
            <SubjectBreakdownChart breakdown={report.subjectBreakdown} />
            {/* 학생이 바뀌면 이전 학생의 생성 결과가 남지 않도록 key로 초기화 */}
            <EncouragementCard key={report.studentId} report={report} />
          </>
        )}
      </div>
    </main>
  );
}
