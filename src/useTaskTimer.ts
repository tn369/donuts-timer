import { useReducer, useCallback } from 'react';
import type { Task, TargetTimeSettings, TodoList, TimerSettings } from './types';
import { clearExecutionState } from './storage';
import { timerReducer } from './useTaskTimer/reducer';
import { useTimerInterval } from './useTaskTimer/useTimerInterval';
import { useTimerPersistence } from './useTaskTimer/useTimerPersistence';
import type { State } from './useTaskTimer/types';

const initialState: State = {
  tasks: [],
  selectedTaskId: null,
  isTimerRunning: false,
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
  activeList: null,
  timerSettings: { shape: 'circle', color: 'blue' },
  lastTickTimestamp: null,
};

export function useTaskTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // 外部委託: インターバルと可視性変更の監視
  useTimerInterval(state, dispatch);

  // 外部委託: 永続化
  useTimerPersistence(state, dispatch);

  const selectTask = useCallback((taskId: string) => {
    dispatch({ type: 'SELECT_TASK', taskId, now: Date.now() });
  }, []);

  const startTimer = useCallback(() => {
    dispatch({ type: 'START', now: Date.now() });
  }, []);

  const stopTimer = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    if (state.activeList?.id) {
      clearExecutionState(state.activeList.id);
    } else {
      clearExecutionState();
    }
  }, [state.activeList]);

  const isTaskSelectable = useCallback(
    (taskId: string): boolean => {
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return false;

      const task = state.tasks[taskIndex];

      // 既に完了しているタスクは常に選択可能（戻るため）
      if (task.status === 'done') return true;

      // ごほうびタスクの場合、前のタスクが全て完了している必要がある
      if (task.kind === 'reward') {
        return state.tasks.slice(0, taskIndex).every((t) => t.status === 'done');
      }

      // それ以外の未完了タスクは自由に選択可能
      return true;
    },
    [state.tasks]
  );

  const setTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', tasks });
  }, []);

  const setTargetTimeSettings = useCallback((settings: TargetTimeSettings) => {
    dispatch({ type: 'SET_TARGET_TIME_SETTINGS', settings });
  }, []);

  const initList = useCallback((list: TodoList) => {
    dispatch({ type: 'INIT_LIST', list });
  }, []);

  const updateActiveList = useCallback((list: TodoList) => {
    dispatch({ type: 'UPDATE_ACTIVE_LIST', list });
  }, []);

  const setTimerSettings = useCallback((settings: TimerSettings) => {
    dispatch({ type: 'SET_TIMER_SETTINGS', settings });
  }, []);

  const fastForward = useCallback(() => {
    if (import.meta.env.DEV) {
      dispatch({ type: 'FAST_FORWARD' });
    }
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
  };
}
