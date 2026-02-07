/**
 * タイマーの実行状態（どのタスクがどれくらい進んだか）をローカルストレージに保存・復元するカスタムフック
 */
import { useEffect } from 'react';

import {
  clearExecutionState,
  loadExecutionState,
  saveExecutionState,
  type TimerMode,
} from '../storage';
import { hasTaskProgress } from '../utils/task';
import type { Action, State } from './types';

/**
 * タイマーの状態を永続化するためのフック
 */
export function useTimerPersistence(
  state: State,
  dispatch: React.Dispatch<Action>,
  mode: TimerMode = 'single'
) {
  // 保存されたステートの復元
  useEffect(() => {
    if (!state.activeList) return;

    const saved = loadExecutionState(state.activeList.id, mode);
    if (saved?.listId !== state.activeList.id) return;

    // すべてのタスクが完了済みかどうかをチェック
    const allCompleted = saved.tasks.length > 0 && saved.tasks.every((t) => t.status === 'done');
    if (allCompleted) {
      // すべて完了している場合は、保存されたステートを破棄して初期状態（リセット状態）のままにする
      clearExecutionState(state.activeList.id, mode);
      return;
    }

    // 進捗（経過時間がある、または完了しているタスクがある）がある場合のみ復元を提案する
    if (!hasTaskProgress(saved.tasks)) {
      // 進捗がない場合は、保存されたステートを破棄して初期状態（リセット状態）のままにする
      clearExecutionState(state.activeList.id, mode);
      return;
    }

    if (saved.isAutoResume) {
      dispatch({
        type: 'AUTO_RESTORE',
        tasks: saved.tasks,
        selectedTaskId: saved.selectedTaskId,
        isTimerRunning: saved.isTimerRunning,
        lastTickTimestamp: saved.lastTickTimestamp,
      });
      // 一度適用したらフラグを消すために保存し直す必要はない（次回の保存で上書きされるため）
    } else {
      dispatch({
        type: 'RESTORE_AVAILABLE',
        tasks: saved.tasks,
        selectedTaskId: saved.selectedTaskId,
        isTimerRunning: saved.isTimerRunning,
        lastTickTimestamp: saved.lastTickTimestamp,
      });
    }
  }, [state.activeList, dispatch, mode]);

  useEffect(() => {
    // ステートが変わるたびに保存（ただし初期化前は避ける）
    if (state.activeList && state.tasks.length > 0) {
      saveExecutionState({
        tasks: state.tasks,
        selectedTaskId: state.selectedTaskId,
        isTimerRunning: state.isTimerRunning,
        lastTickTimestamp: state.lastTickTimestamp,
        listId: state.activeList.id,
        mode,
      });
    }
  }, [
    state.tasks,
    state.selectedTaskId,
    state.isTimerRunning,
    state.lastTickTimestamp,
    state.activeList,
    mode,
  ]);
}
