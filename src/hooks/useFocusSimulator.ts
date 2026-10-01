import { useCallback, useEffect, useRef, useState } from 'react';
import { startFocusSimulator, type FocusState } from '../mock/focusSimulator';
import { useNudgeStore } from './useNudgeStore';

interface Options {
  running: boolean;
  /** true면 시뮬레이터가 무작위 대신 계속 distracted를 낸다 (데모용) */
  forceDistracted: boolean;
}

/** 목업 시뮬레이터를 돌리며 매 틱을 넛지 스토어에 전달한다. */
export function useFocusSimulator({ running, forceDistracted }: Options) {
  const [focusState, setFocusState] = useState<FocusState | null>(null);
  const forcedRef = useRef(forceDistracted);

  useEffect(() => {
    forcedRef.current = forceDistracted;
  }, [forceDistracted]);

  // 시뮬레이터 틱 외에 버튼(이탈 강제, 다시 집중)에서도 즉시 상태를 바꿀 때 사용
  const emit = useCallback((state: FocusState) => {
    setFocusState(state);
    useNudgeStore.getState().onFocusStateChange(state);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = startFocusSimulator((tick) => emit(tick.state), {
      getForcedState: () => (forcedRef.current ? 'distracted' : null),
    });
    return () => clearInterval(id);
  }, [running, emit]);

  return { focusState, emit, setFocusState };
}
