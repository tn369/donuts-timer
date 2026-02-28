/**
 * タイマーの実行状態（どのタスクがどれくらい進んだか）をローカルストレージに保存・復元するカスタムフック
 */
import { useEffect } from 'react';

import { toAppTasks, toDomainTasks } from '../domain/timer/mappers/taskMapper';
import { shouldDiscardPersistedSession } from '../domain/timer/services/sessionPersistence';
import {
  clearExecutionState,
  loadExecutionState,
  saveExecutionState,
  type TimerMode,
} from '../storage';
import type { Action, State } from './types';

/**
 * タイマーの状態を永続化するためのフック
 * @param state 現在の状態
 * @param dispatch dispatch関数
 * @param mode タイマーのモード（single/sibling-0/sibling-1）
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

    const savedTasks = toDomainTasks(saved.tasks);
    if (shouldDiscardPersistedSession(savedTasks)) {
      clearExecutionState(state.activeList.id, mode);
      return;
    }

    if (saved.isAutoResume) {
      dispatch({
        type: 'AUTO_RESTORE',
        tasks: savedTasks,
        selectedTaskId: saved.selectedTaskId,
        isTimerRunning: saved.isTimerRunning,
        lastTickTimestamp: saved.lastTickTimestamp,
      });
      // 一度適用したらフラグを消すために保存し直す必要はない（次回の保存で上書きされるため）
    } else {
      dispatch({
        type: 'RESTORE_AVAILABLE',
        tasks: savedTasks,
        selectedTaskId: saved.selectedTaskId,
        isTimerRunning: saved.isTimerRunning,
        lastTickTimestamp: saved.lastTickTimestamp,
      });
    }
  }, [state.activeList, dispatch, mode]);

  useEffect(() => {
    // ステートが変わるたびに保存（ただし初期化前は避ける）
    if (state.activeList && state.tasks.length > 0) {
      // 永続化フォーマット互換を保つため、保存時はApp DTOへ戻す。
      saveExecutionState({
        tasks: toAppTasks(state.tasks),
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
