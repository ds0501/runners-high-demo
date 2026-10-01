import { useEffect, useState, type ReactNode } from 'react';
import NudgeBanner from '../components/NudgeBanner';
import { useFocusSimulator } from '../hooks/useFocusSimulator';
import { useNudgeStore } from '../hooks/useNudgeStore';

type Phase = 'idle' | 'running' | 'paused' | 'ended';

const THRESHOLD_OPTIONS = [5, 10, 20];

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StudyTimerDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [forceDistracted, setForceDistracted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const running = phase === 'running';
  const { focusState, emit, setFocusState } = useFocusSimulator({ running, forceDistracted });

  const distractedSince = useNudgeStore((s) => s.distractedSince);
  const nudgeCount = useNudgeStore((s) => s.nudgeCount);
  const recoveredCount = useNudgeStore((s) => s.recoveredCount);
  const config = useNudgeStore((s) => s.config);
  const setConfig = useNudgeStore((s) => s.setConfig);

  // 스토어는 전역이라, 다른 탭에 갔다 돌아오면 이전 세션 수치가 남지 않도록 초기화
  useEffect(() => {
    useNudgeStore.getState().reset();
  }, []);

  // 학습 시간 & 이탈 경과 표시용 1초 타이머
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsedSec((s) => s + 1);
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    useNudgeStore.getState().reset();
    setElapsedSec(0);
    setForceDistracted(false);
    setFocusState('focused');
    setPhase('running');
  };

  const pause = () => {
    const store = useNudgeStore.getState();
    store.clearDistractedStreak();
    store.dismissNudge();
    setPhase('paused');
  };

  const end = () => {
    useNudgeStore.getState().dismissNudge();
    setForceDistracted(false);
    setPhase('ended');
  };

  const toggleForce = () => {
    const next = !forceDistracted;
    setForceDistracted(next);
    // 다음 틱(최대 3초)을 기다리지 않고 바로 반영
    emit(next ? 'distracted' : 'focused');
  };

  const refocus = () => {
    setForceDistracted(false);
    emit('focused');
  };

  const distractedSec =
    running && focusState === 'distracted' && distractedSince !== null
      ? Math.max(0, Math.floor((now - distractedSince) / 1000))
      : 0;

  return (
    <main className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <header>
          <p className="text-sm font-semibold text-emerald-700">기능 A</p>
          <h1 className="text-2xl font-bold text-gray-900">AI 집중 넛지</h1>
        </header>

        {phase === 'ended' ? (
          <SummaryCard
            elapsedSec={elapsedSec}
            nudgeCount={nudgeCount}
            recoveredCount={recoveredCount}
            onRestart={start}
          />
        ) : (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">순공시간</p>
              <p className="mt-1 text-5xl font-bold tabular-nums text-gray-900">
                {formatTime(elapsedSec)}
              </p>

              <FocusIndicator phase={phase} focusState={focusState} distractedSec={distractedSec} />

              <div className="mt-6 flex gap-2">
                {phase === 'idle' && (
                  <PrimaryButton onClick={start}>학습 시작</PrimaryButton>
                )}
                {phase === 'running' && <SecondaryButton onClick={pause}>일시정지</SecondaryButton>}
                {phase === 'paused' && (
                  <PrimaryButton onClick={() => setPhase('running')}>이어서 하기</PrimaryButton>
                )}
                {phase !== 'idle' && <SecondaryButton onClick={end}>학습 종료</SecondaryButton>}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <Stat label="넛지" value={`${nudgeCount} / ${config.maxNudgesPerSession}회`} />
              <Stat label="집중 회복" value={`${recoveredCount}회`} />
            </section>

            <section className="rounded-3xl border border-dashed border-gray-300 bg-white p-5">
              <p className="text-sm font-semibold text-gray-700">시연 설정</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">이탈 강제</p>
                  <p className="text-xs text-gray-500">켜면 계속 '이탈' 상태가 됩니다</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={forceDistracted}
                  disabled={!running}
                  onClick={toggleForce}
                  className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-40 ${
                    forceDistracted ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      forceDistracted ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">넛지 임계치</p>
                <div className="flex gap-1">
                  {THRESHOLD_OPTIONS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setConfig({ distractedThresholdSec: sec })}
                      className={`rounded-lg px-3 py-1 text-sm ${
                        config.distractedThresholdSec === sec
                          ? 'bg-emerald-600 font-semibold text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {sec}초
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {running && <NudgeBanner onRefocus={refocus} />}
    </main>
  );
}

function FocusIndicator({
  phase,
  focusState,
  distractedSec,
}: {
  phase: Phase;
  focusState: 'focused' | 'distracted' | null;
  distractedSec: number;
}) {
  if (phase === 'idle') {
    return <p className="mt-4 text-sm text-gray-500">"학습 시작"을 누르면 집중 감지가 시작돼요</p>;
  }
  if (phase === 'paused') {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
        ⏸ 일시정지됨
      </p>
    );
  }
  const focused = focusState !== 'distracted';
  return (
    <p
      className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
        focused ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${focused ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'}`}
      />
      {focused ? '집중 중' : `잠시 이탈 · ${distractedSec}초`}
    </p>
  );
}

function SummaryCard({
  elapsedSec,
  nudgeCount,
  recoveredCount,
  onRestart,
}: {
  elapsedSec: number;
  nudgeCount: number;
  recoveredCount: number;
  onRestart: () => void;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
      <p className="text-4xl">🌿</p>
      <p className="mt-3 text-sm text-gray-500">오늘의 학습 정산</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        오늘 집중 회복 <span className="text-emerald-600">{recoveredCount}회</span>
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-left">
        <Stat label="순공시간" value={formatTime(elapsedSec)} />
        <Stat label="받은 넛지" value={`${nudgeCount}회`} />
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={onRestart}>새 학습 시작</PrimaryButton>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200"
    >
      {children}
    </button>
  );
}
