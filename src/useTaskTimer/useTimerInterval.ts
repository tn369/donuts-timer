import { useEffect } from 'react';

import type { Action, State } from './types';

export function useTimerInterval(state: State, dispatch: React.Dispatch<Action>) {
  useEffect(() => {
    // タイマーが動いている場合は TICK を送る
    // タイマーが止まっていても、目標時刻モードの場合は時刻経過に合わせて遊び時間を再計算するために REFRESH を送る
    const interval = setInterval(() => {
      if (state.isTimerRunning && state.selectedTaskId) {
        dispatch({ type: 'TICK', now: Date.now() });
      } else if (state.targetTimeSettings.mode === 'target-time') {
        dispatch({ type: 'REFRESH_REWARD_TIME' });
      }
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isTimerRunning && state.selectedTaskId) {
        dispatch({ type: 'TICK', now: Date.now() });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isTimerRunning, state.selectedTaskId, state.targetTimeSettings.mode, dispatch]);
}
