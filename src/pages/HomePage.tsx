import { Link } from 'react-router';
import { formatMinutes } from '../hooks/useParentReport';
import { mockReports } from '../mock/parentReport';

export default function HomePage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <header>
          <p className="text-sm font-semibold text-emerald-700">러너스하이 2학기 확장</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">기능 데모</h1>
          <p className="mt-2 text-sm text-gray-500">
            1학기의 집중 감지·데일리 리포트에서 이어지는 두 가지 새 기능을 체험해 보세요.
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <FeatureBadge>기능 A</FeatureBadge>
          <h2 className="mt-2 text-lg font-bold text-gray-900">AI 집중 넛지</h2>
          <p className="mt-1 text-sm text-gray-500">
            집중이 흐트러진 상태가 이어지면, 경고 대신 한 번 부드럽게 말을 걸어요.
          </p>
          <Link
            to="/study"
            className="mt-5 block rounded-2xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700"
          >
            집중 넛지 시연하기 →
          </Link>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <FeatureBadge>기능 B</FeatureBadge>
          <h2 className="mt-2 text-lg font-bold text-gray-900">학부모 리포트</h2>
          <p className="mt-1 text-sm text-gray-500">
            오늘의 학습 기록을 학부모용으로 간결하게 요약하고, 격려 한마디를 만들어 드려요.
          </p>
          <ul className="mt-5 flex flex-col gap-2">
            {mockReports.map((r) => (
              <li key={r.studentId}>
                <Link
                  to={`/parent-report/${r.studentId}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {r.studentName.slice(0, 1)}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-gray-900">{r.studentName}</span>
                    <span className="block text-xs text-gray-500">
                      순공 {formatMinutes(r.totalFocusMinutes)} · {r.subjectBreakdown[0]?.subject ?? '-'} 중심
                    </span>
                  </span>
                  <span className="text-gray-300">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-center text-xs text-gray-400">
          목업 데이터로 동작하는 개념 시연(POC)입니다.
        </p>
      </div>
    </main>
  );
}

function FeatureBadge({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {children}
    </span>
  );
}
