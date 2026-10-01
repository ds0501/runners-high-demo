import { create } from 'zustand';
import type { FocusState, NudgeEvent } from '../mock/focusSimulator';

export const NUDGE_MESSAGES = [
  '잠깐 집중이 흐트러진 것 같아요. 다시 시작해볼까요?',
  '조금 쉬었다면, 이제 다시 이어가 봐요 🌱',
  '지금 하던 부분, 딱 한 문제만 더 풀어볼까요?',
  '천천히 숨 한 번 고르고 다시 집중해봐요',
];

export interface NudgeConfig {
  /** 이탈이 이 시간 이상 연속되면 넛지 발화 */
  distractedThresholdSec: number;
  /** 세션당 최대 발화 횟수 */
  maxNudgesPerSession: number;
  /** 발화 후 다음 발화까지 최소 간격 */
  minNudgeIntervalSec: number;
}

export const DEFAULT_NUDGE_CONFIG: NudgeConfig = {
  distractedThresholdSec: 10,
  maxNudgesPerSession: 2,
  minNudgeIntervalSec: 30,
};

interface NudgeStore {
  distractedSince: number | null;
  nudgeCount: number;
  currentMessage: string | null;
  recoveredCount: number;
  /** 발화된 넛지 기록 (세션 정산용) */
  nudges: NudgeEvent[];
  /** 회복을 기다리는 넛지 — 이게 있는 동안은 재발화하지 않음 */
  pendingNudgeId: string | null;
  config: NudgeConfig;
  onFocusStateChange: (state: FocusState, now?: number) => void;
  dismissNudge: () => void;
  /** 일시정지 시 호출 — 멈춘 시간이 이탈로 누적되지 않도록 연속 이탈 기록만 지운다 */
  clearDistractedStreak: () => void;
  setConfig: (config: Partial<NudgeConfig>) => void;
  /** 새 세션 시작 시 호출 (config는 유지) */
  reset: () => void;
}

const initialSession = {
  distractedSince: null,
  nudgeCount: 0,
  currentMessage: null,
  recoveredCount: 0,
  nudges: [],
  pendingNudgeId: null,
} satisfies Partial<NudgeStore>;

function pickMessage(previous: string | null) {
  const candidates = NUDGE_MESSAGES.filter((m) => m !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const useNudgeStore = create<NudgeStore>()((set, get) => ({
  ...initialSession,
  config: DEFAULT_NUDGE_CONFIG,

  onFocusStateChange: (state, now = Date.now()) => {
    const { distractedSince, pendingNudgeId, nudges, nudgeCount, currentMessage, config } = get();

    if (state === 'focused') {
      // 넛지 이후 다시 집중으로 돌아오면 회복으로 집계
      if (pendingNudgeId) {
        set((s) => ({
          distractedSince: null,
          pendingNudgeId: null,
          recoveredCount: s.recoveredCount + 1,
          nudges: s.nudges.map((n) => (n.id === pendingNudgeId ? { ...n, recoveredAt: now } : n)),
        }));
      } else if (distractedSince !== null) {
        set({ distractedSince: null });
      }
      return;
    }

    if (distractedSince === null) {
      set({ distractedSince: now });
      return;
    }

    const distractedSec = (now - distractedSince) / 1000;
    const lastNudgeAt = nudges.at(-1)?.triggeredAt ?? null;
    const canNudge =
      pendingNudgeId === null &&
      distractedSec >= config.distractedThresholdSec &&
      nudgeCount < config.maxNudgesPerSession &&
      (lastNudgeAt === null || (now - lastNudgeAt) / 1000 >= config.minNudgeIntervalSec);
    if (!canNudge) return;

    const nudge: NudgeEvent = {
      id: crypto.randomUUID(),
      triggeredAt: now,
      distractedDurationSec: Math.round(distractedSec),
      message: pickMessage(currentMessage ?? nudges.at(-1)?.message ?? null),
      dismissedAt: null,
      recoveredAt: null,
    };
    set({
      nudgeCount: nudgeCount + 1,
      currentMessage: nudge.message,
      pendingNudgeId: nudge.id,
      nudges: [...nudges, nudge],
    });
  },

  // 배너를 닫거나 자동 페이드아웃될 때 호출. 회복 대기(pendingNudgeId)는 유지한다.
  dismissNudge: () => {
    const { currentMessage, nudges } = get();
    if (currentMessage === null) return;
    const now = Date.now();
    set({
      currentMessage: null,
      nudges: nudges.map((n, i) =>
        i === nudges.length - 1 && n.dismissedAt === null ? { ...n, dismissedAt: now } : n,
      ),
    });
  },

  clearDistractedStreak: () => set({ distractedSince: null }),

  setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),

  reset: () => set(initialSession),
}));
