import { Link, Outlet, useLocation } from 'react-router';
import { mockReports } from '../mock/parentReport';

const TABS = [
  { label: '홈', to: '/', isActive: (path: string) => path === '/' },
  { label: '집중 넛지', to: '/study', isActive: (path: string) => path.startsWith('/study') },
  {
    label: '학부모 리포트',
    to: `/parent-report/${mockReports[0].studentId}`,
    isActive: (path: string) => path.startsWith('/parent-report'),
  },
];

/** 모든 화면 공통 — 상단 탭으로 홈·기능 A·기능 B를 오간다 */
export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 text-sm font-bold text-emerald-700">
            🌱<span className="ml-1 hidden min-[380px]:inline">러너스하이</span>
          </Link>
          <nav className="flex gap-1 rounded-2xl bg-gray-100 p-1">
            {TABS.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
