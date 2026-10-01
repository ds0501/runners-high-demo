export type FocusState = 'focused' | 'distracted';

export interface FocusTick {
  timestamp: number;
  state: FocusState;
}

export interface NudgeEvent {
  id: string;
  triggeredAt: number;
  distractedDurationSec: number;
  message: string;
  dismissedAt: number | null;
  recoveredAt: number | null;
}

export interface FocusSimulatorOptions {
  /** 상태 생성 주기 (기본 3000ms) */
  intervalMs?: number;
  /** distracted가 나올 확률 (기본 0.3) */
  distractedProbability?: number;
  /** 값을 반환하면 무작위 대신 그 상태로 고정 — 데모에서 이탈을 강제로 지속시킬 때 사용 */
  getForcedState?: () => FocusState | null;
}

/** 카메라/센서 없이 주기적으로 무작위 집중/이탈 상태를 생성한다. 반환값을 clearInterval로 정지. */
export function startFocusSimulator(
  onTick: (tick: FocusTick) => void,
  { intervalMs = 3000, distractedProbability = 0.3, getForcedState }: FocusSimulatorOptions = {},
) {
  return setInterval(() => {
    const state: FocusState =
      getForcedState?.() ?? (Math.random() < distractedProbability ? 'distracted' : 'focused');
    onTick({ timestamp: Date.now(), state });
  }, intervalMs);
}
