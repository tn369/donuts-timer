/**
 * タイマーの実行ロジック、タスクの進捗、永続化を統合して提供するカスタムフック
 */
import { useCallback, useReducer } from 'react';

import { toDomainTasks } from './domain/timer/mappers/taskMapper';
import { isTaskSelectable as isTaskSelectablePolicy } from './domain/timer/policies/selectabilityPolicy';
import { clearExecutionState, type TimerMode } from './storage';
import type { TargetTimeSettings, Task, TimerSettings, TodoList } from './types';
import { timerReducer } from './useTaskTimer/reducer';
import type { State } from './useTaskTimer/types';
import { useTimerInterval } from './useTaskTimer/useTimerInterval';
import { useTimerPersistence } from './useTaskTimer/useTimerPersistence';

/**
 * 初期の内部状態
 */
const initialState: State = {
  tasks: [],
  selectedTaskId: null,
  isTimerRunning: false,
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
  activeList: null,
  timerSettings: { shape: 'circle', color: 'blue' },
  lastTickTimestamp: null,
  pendingRestorableState: null,
};

/**
 * ひとつのタイマー（または2画面のうちの片方）の全ロジックを管理するフック
 * @param mode タイマーの動作モード（永続化キーの識別に利用）
 * @returns タイマーの状態と操作関数
 */
export function useTaskTimer(mode: TimerMode = 'single') {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // 外部委託: インターバルと可視性変更の監視
  useTimerInterval(state, dispatch);

  // 外部委託: 永続化
  useTimerPersistence(state, dispatch, mode);

  /**
   * タスクを選択する
   */
  const selectTask = useCallback((taskId: string) => {
    dispatch({ type: 'SELECT_TASK', taskId, now: Date.now() });
  }, []);

  /**
   * タイマーを開始する
   */
  const startTimer = useCallback(() => {
    dispatch({ type: 'START', now: Date.now() });
  }, []);

  /**
   * タイマーを停止する
   */
  const stopTimer = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  /**
   * タイマーと進捗を最初の状態にリセットする
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    if (state.activeList?.id) {
      clearExecutionState(state.activeList.id, mode);
    } else {
      clearExecutionState(undefined, mode);
    }
  }, [state.activeList, mode]);

  /**
   * 対象のタスクが選択可能かどうかを判定する
   * （ごほうびタスクは前のタスクが完了している必要がある）
   */
  const isTaskSelectable = useCallback(
    (taskId: string): boolean => {
      return isTaskSelectablePolicy(toDomainTasks(state.tasks), taskId);
    },
    [state.tasks]
  );

  const setTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', tasks });
  }, []);

  const setTargetTimeSettings = useCallback((settings: TargetTimeSettings) => {
    dispatch({ type: 'SET_TARGET_TIME_SETTINGS', settings });
  }, []);

  /**
   * リストデータでタイマーを初期化する
   */
  const initList = useCallback((list: TodoList) => {
    dispatch({ type: 'INIT_LIST', list });
  }, []);

  const updateActiveList = useCallback((list: TodoList) => {
    dispatch({ type: 'UPDATE_ACTIVE_LIST', list });
  }, []);

  /**
   * タイマーの見た目（形状、色）を設定する
   */
  const setTimerSettings = useCallback((settings: TimerSettings) => {
    dispatch({ type: 'SET_TIMER_SETTINGS', settings });
  }, []);

  /**
   * デバッグ用：時間を1分進める
   */
  const fastForward = useCallback(() => {
    if (import.meta.env.DEV) {
      dispatch({ type: 'FAST_FORWARD' });
    }
  }, []);

  const resumeSession = useCallback(() => {
    dispatch({ type: 'RESTORE_SESSION' });
  }, []);

  const cancelResume = useCallback(() => {
    dispatch({ type: 'CANCEL_RESTORE' });
    if (state.activeList?.id) {
      clearExecutionState(state.activeList.id, mode);
    }
  }, [state.activeList, mode]);

  /**
   * タスクの順序を入れ替える
   */
  const reorderTasks = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_TASKS', fromIndex, toIndex });
  }, []);

  return {
    ...state,
    isTaskSelectable,
    selectTask,
    startTimer,
    stopTimer,
    reset,
    setTasks,
    setTargetTimeSettings,
    initList,
    updateActiveList,
    setTimerSettings,
    fastForward,
    resumeSession,
    cancelResume,
    reorderTasks,
  };
}
