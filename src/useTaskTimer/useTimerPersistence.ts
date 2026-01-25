import { useEffect } from 'react';
import { loadExecutionState, saveExecutionState, clearExecutionState } from '../storage';
import type { Action, State } from './types';

export function useTimerPersistence(state: State, dispatch: React.Dispatch<Action>) {
  // 保存されたステートの復元
  useEffect(() => {
    if (state.activeList) {
      const saved = loadExecutionState();
      if (saved && saved.listId === state.activeList.id) {
        // すべてのタスクが完了済みかどうかをチェック
        const allCompleted =
          saved.tasks.length > 0 && saved.tasks.every((t) => t.status === 'done');

        if (allCompleted) {
          // すべて完了している場合は、保存されたステートを破棄して初期状態（リセット状態）のままにする
          clearExecutionState();
        } else {
          dispatch({
            type: 'RESTORE_SESSION',
            tasks: saved.tasks,
            selectedTaskId: saved.selectedTaskId,
            isTimerRunning: saved.isTimerRunning,
            lastTickTimestamp: saved.lastTickTimestamp,
          });
        }
      }
    }
  }, [state.activeList, dispatch]);

  useEffect(() => {
    // ステートが変わるたびに保存（ただし初期化前は避ける）
    if (state.activeList && state.tasks.length > 0) {
      saveExecutionState({
        tasks: state.tasks,
        selectedTaskId: state.selectedTaskId,
        isTimerRunning: state.isTimerRunning,
        lastTickTimestamp: state.lastTickTimestamp,
        listId: state.activeList.id,
      });
    }
  }, [
    state.tasks,
    state.selectedTaskId,
    state.isTimerRunning,
    state.lastTickTimestamp,
    state.activeList,
  ]);
}
