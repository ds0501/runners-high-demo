import { useEffect, useState } from 'react';
import { useNudgeStore } from '../hooks/useNudgeStore';

const VISIBLE_MS = 6000;
const FADE_MS = 500;

interface Props {
  onRefocus: () => void;
}

/** 화면 하단 slide-up 넛지. 모달이 아니며 6초 후 자동으로 사라진다. */
export default function NudgeBanner({ onRefocus }: Props) {
  const message = useNudgeStore((s) => s.currentMessage);
  const nudgeId = useNudgeStore((s) => s.nudges.at(-1)?.id);
  if (!message) return null;
  // 넛지마다 key를 바꿔 애니메이션·타이머를 새로 시작
  return <BannerCard key={nudgeId} message={message} onRefocus={onRefocus} />;
}

function BannerCard({ message, onRefocus }: { message: string } & Props) {
  const dismissNudge = useNudgeStore((s) => s.dismissNudge);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setShown(true));
    const fade = setTimeout(() => setShown(false), VISIBLE_MS - FADE_MS);
    const remove = setTimeout(dismissNudge, VISIBLE_MS);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, [dismissNudge]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg transition-all duration-500 ease-out ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl">
          🌱
        </span>
        <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
        <button
          type="button"
          onClick={() => {
            onRefocus();
            dismissNudge();
          }}
          className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          다시 집중
        </button>
        <button
          type="button"
          onClick={dismissNudge}
          aria-label="닫기"
          className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
