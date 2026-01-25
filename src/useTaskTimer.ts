import { useReducer, useCallback, useEffect } from 'react';
import type { Task, TargetTimeSettings, TodoList, TimerSettings } from './types';
import { calculateRewardSeconds, calculateRewardSecondsFromTargetTime } from './utils/task';
import { loadExecutionState, saveExecutionState, clearExecutionState } from './storage';

interface State {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  targetTimeSettings: TargetTimeSettings;
  activeList: TodoList | null;
  timerSettings: TimerSettings;
  lastTickTimestamp: number | null;
}

type Action =
  | { type: 'TICK'; now: number }
  | { type: 'SELECT_TASK'; taskId: string; now: number }
  | { type: 'START'; now: number }
  | { type: 'STOP' }
  | { type: 'BACK'; now: number }
  | { type: 'RESET' }
  | { type: 'SET_TASKS'; tasks: Task[] } // Debug use
  | { type: 'SET_TARGET_TIME_SETTINGS'; settings: TargetTimeSettings }
  | { type: 'REFRESH_REWARD_TIME' }
  | { type: 'UPDATE_ACTIVE_LIST'; list: TodoList }
  | { type: 'INIT_LIST'; list: TodoList }
  | { type: 'SET_TIMER_SETTINGS'; settings: TimerSettings }
  | { type: 'RESTORE_SESSION'; tasks: Task[]; selectedTaskId: string | null; isTimerRunning: boolean; lastTickTimestamp: number | null }
  | { type: 'FAST_FORWARD' };

function getBaseRewardSeconds(list: TodoList | null): number {
  const rewardTask = list?.tasks.find((t) => t.kind === 'reward');
  return rewardTask ? rewardTask.plannedSeconds : 15 * 60; // fallback to 15 mins
}

function updateRewardTime(
  tasks: Task[],
  targetTimeSettings: TargetTimeSettings,
  baseRewardSeconds: number
): Task[] {
  const rewardTask = tasks.find((t) => t.kind === 'reward');
  const rewardElapsed = rewardTask ? rewardTask.elapsedSeconds : 0;

  let newRewardSeconds: number;

  if (targetTimeSettings.mode === 'target-time') {
    // 目標時刻モード: 目標時刻から逆算
    const currentTime = new Date();

    // 「やること」(固定タスク)の合計時間を計算（未完了タスクのみ）
    let todoTasksSeconds = 0;

    tasks.forEach((t) => {
      if (t.kind === 'todo') {
        if (t.status === 'todo') {
          // 未開始の「やること」
          todoTasksSeconds += t.plannedSeconds;
        } else if (t.status === 'running' || t.status === 'paused') {
          // 実行中の「やること」
          const remaining = t.plannedSeconds - t.elapsedSeconds;
          if (remaining > 0) {
            todoTasksSeconds += remaining;
          }
        }
      }
    });

    // 遊び時間は「今から終了時までに残っている時間」＋「すでに遊んだ時間」
    newRewardSeconds =
      calculateRewardSecondsFromTargetTime(
        targetTimeSettings.targetHour,
        targetTimeSettings.targetMinute,
        currentTime,
        todoTasksSeconds
      ) + rewardElapsed;
  } else {
    // 所要時間モード: 従来の計算方法
    newRewardSeconds = calculateRewardSeconds(tasks, baseRewardSeconds);
  }

  return tasks.map((t) => (t.kind === 'reward' ? { ...t, plannedSeconds: newRewardSeconds } : t));
}

function timerReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TICK': {
      if (!state.isTimerRunning || !state.selectedTaskId || state.lastTickTimestamp === null) {
        return state;
      }

      const { now } = action;
      const deltaMs = now - state.lastTickTimestamp;
      const deltaSeconds = Math.floor(deltaMs / 1000);

      if (deltaSeconds < 1) return state;

      const currentIndex = state.tasks.findIndex((t) => t.id === state.selectedTaskId);
      if (currentIndex === -1) return state;

      const task = state.tasks[currentIndex];
      if (task.status !== 'running') return state;

      const newElapsed = task.elapsedSeconds + deltaSeconds;
      let updatedTasks = state.tasks.map((t) =>
        t.id === state.selectedTaskId ? { ...t, elapsedSeconds: newElapsed } : t
      );

      updatedTasks = updateRewardTime(
        updatedTasks,
        state.targetTimeSettings,
        getBaseRewardSeconds(state.activeList)
      );

      // ごほうびタスクが時間切れになった場合の自動終了処理
      const updatedTask = updatedTasks.find((t) => t.id === state.selectedTaskId);
      if (
        updatedTask &&
        updatedTask.kind === 'reward' &&
        updatedTask.elapsedSeconds >= updatedTask.plannedSeconds
      ) {
        updatedTasks = updatedTasks.map((t) =>
          t.id === state.selectedTaskId
            ? { ...t, status: 'done', actualSeconds: t.elapsedSeconds }
            : t
        );
        return {
          ...state,
          tasks: updatedTasks,
          isTimerRunning: false,
          lastTickTimestamp: null,
        };
      }

      return {
        ...state,
        tasks: updatedTasks,
        lastTickTimestamp: state.lastTickTimestamp + deltaSeconds * 1000,
      };
    }

    case 'SELECT_TASK': {
      const { taskId, now } = action;
      const tappedIndex = state.tasks.findIndex((t) => t.id === taskId);

      if (tappedIndex === -1) return state;

      const tappedTask = state.tasks[tappedIndex];
      const isCurrentTapped = taskId === state.selectedTaskId;

      let updatedTasks = [...state.tasks];
      let nextTaskIdToSelect = state.selectedTaskId;
      let nextIsTimerRunning = state.isTimerRunning;

      if (tappedTask.status === 'done') {
        // --- 完了済みのタスクをタップした場合 ---
        if (state.selectedTaskId) {
          updatedTasks = updatedTasks.map((t) =>
            t.id === state.selectedTaskId && t.status === 'running'
              ? { ...t, status: 'paused' as const }
              : t
          );
        }
        updatedTasks = updatedTasks.map((t) =>
          t.id === taskId ? { ...t, status: 'todo' as const, actualSeconds: 0 } : t
        );
        nextTaskIdToSelect = taskId;
        nextIsTimerRunning = false;
      } else if (isCurrentTapped) {
        // --- アクティブなタスクをタップした場合 ---
        updatedTasks[tappedIndex] = {
          ...tappedTask,
          status: 'done' as const,
          actualSeconds: tappedTask.elapsedSeconds,
        };

        const nextIncomplete = updatedTasks.slice(tappedIndex + 1).find((t) => t.status !== 'done');
        const allIncomplete = updatedTasks.filter((t) => t.status !== 'done');

        if (nextIncomplete) {
          if (nextIncomplete.kind === 'reward') {
            // 次がごほうびの場合、他に未完了の手順がないか確認
            const hasOtherTodo = updatedTasks.some(
              (t) => t.status !== 'done' && t.kind === 'todo' && t.id !== nextIncomplete.id
            );
            if (hasOtherTodo) {
              // 他に未完了があれば、全体の最初にある未完了に戻る
              nextTaskIdToSelect = allIncomplete[0].id;
            } else {
              nextTaskIdToSelect = nextIncomplete.id;
            }
          } else {
            nextTaskIdToSelect = nextIncomplete.id;
          }
        } else if (allIncomplete.length > 0) {
          // 次以降にないが、全体にはある場合（戻り）
          nextTaskIdToSelect = allIncomplete[0].id;
        } else {
          nextTaskIdToSelect = null;
          nextIsTimerRunning = false;
        }
      } else {
        // --- まだ開始していないタスクをタップした場合（飛び級） ---
        // ごほうびタスクの場合、前のタスクが完了しているかチェック
        if (tappedTask.kind === 'reward') {
          const hasIncompleteBefore = updatedTasks.slice(0, tappedIndex).some((t) => t.status !== 'done');
          if (hasIncompleteBefore) {
            // 前に未完了がある場合は遷移させない
            return state;
          }
        }

        // 現在のタスクがあれば中断（ステータスのみ変更）して遷移
        if (state.selectedTaskId) {
          updatedTasks = updatedTasks.map((t) =>
            t.id === state.selectedTaskId && t.status === 'running'
              ? { ...t, status: 'paused' as const }
              : t
          );
        }
        nextTaskIdToSelect = taskId;
        // nextIsTimerRunning は維持する（飛ばしてもカウントを継続するため）
      }

      updatedTasks = updateRewardTime(
        updatedTasks,
        state.targetTimeSettings,
        getBaseRewardSeconds(state.activeList)
      );

      if (nextTaskIdToSelect && nextIsTimerRunning) {
        updatedTasks = updatedTasks.map((t) =>
          t.id === nextTaskIdToSelect ? { ...t, status: 'running' as const } : t
        );
      }

      return {
        ...state,
        tasks: updatedTasks,
        selectedTaskId: nextTaskIdToSelect,
        isTimerRunning: nextIsTimerRunning,
        lastTickTimestamp: nextIsTimerRunning ? now : null,
      };
    }

    case 'START': {
      if (!state.selectedTaskId) return state;
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === state.selectedTaskId && task.status !== 'done') {
          return { ...task, status: 'running' as const };
        }
        return task;
      });
      return {
        ...state,
        tasks: updatedTasks,
        isTimerRunning: true,
        lastTickTimestamp: action.now,
      };
    }

    case 'STOP': {
      const updatedTasks = state.tasks.map((task) =>
        task.status === 'running' ? { ...task, status: 'paused' as const } : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        isTimerRunning: false,
        lastTickTimestamp: null,
      };
    }

    case 'BACK': {
      const currentIndex = state.tasks.findIndex((t) => t.id === state.selectedTaskId);
      if (currentIndex === -1) return state;

      const currentTask = state.tasks[currentIndex];
      const updatedTasks = [...state.tasks];
      let newSelectedTaskId = state.selectedTaskId;

      if (currentTask.status === 'done') {
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: state.isTimerRunning ? ('running' as const) : ('paused' as const),
          actualSeconds: 0,
        };
      } else {
        if (currentIndex <= 0) return state;

        const prevTaskIndex = currentIndex - 1;
        newSelectedTaskId = state.tasks[prevTaskIndex].id;

        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: 'todo' as const,
        };

        updatedTasks[prevTaskIndex] = {
          ...updatedTasks[prevTaskIndex],
          status: state.isTimerRunning ? ('running' as const) : ('paused' as const),
          actualSeconds: 0,
        };
      }

      return {
        ...state,
        tasks: updateRewardTime(
          updatedTasks,
          state.targetTimeSettings,
          getBaseRewardSeconds(state.activeList)
        ),
        selectedTaskId: newSelectedTaskId,
        lastTickTimestamp: state.isTimerRunning ? action.now : null,
      };
    }

    case 'RESET': {
      if (!state.activeList) return state;
      const resetTasks = state.activeList.tasks.map((task: Task) => ({
        ...task,
        elapsedSeconds: 0,
        actualSeconds: 0,
        status: 'todo' as const,
      }));
      return {
        ...state,
        tasks: updateRewardTime(
          resetTasks,
          state.targetTimeSettings,
          getBaseRewardSeconds(state.activeList)
        ),
        selectedTaskId: state.activeList.tasks[0]?.id || null,
        isTimerRunning: false,
        lastTickTimestamp: null,
      };
    }

    case 'UPDATE_ACTIVE_LIST': {
      const { list } = action;
      const updatedTasks = list.tasks.map((newTask: Task) => {
        const existingTask = state.tasks.find((t) => t.id === newTask.id);
        if (existingTask) {
          return {
            ...newTask,
            status: existingTask.status,
            elapsedSeconds: existingTask.elapsedSeconds,
            actualSeconds: existingTask.actualSeconds,
          };
        }
        return {
          ...newTask,
          status: 'todo' as const,
          elapsedSeconds: 0,
          actualSeconds: 0,
        };
      });
      return {
        ...state,
        activeList: list,
        targetTimeSettings: list.targetTimeSettings,
        tasks: updateRewardTime(updatedTasks, list.targetTimeSettings, getBaseRewardSeconds(list)),
      };
    }

    case 'INIT_LIST': {
      const { list } = action;
      const initializedTasks = list.tasks.map((t: Task) => ({
        ...t,
        status: 'todo' as const,
        elapsedSeconds: 0,
        actualSeconds: 0,
      }));
      return {
        activeList: list,
        tasks: updateRewardTime(
          initializedTasks,
          list.targetTimeSettings,
          getBaseRewardSeconds(list)
        ),
        selectedTaskId: list.tasks[0]?.id || null,
        isTimerRunning: false,
        lastTickTimestamp: null,
        targetTimeSettings: list.targetTimeSettings,
        timerSettings: list.timerSettings || { shape: 'circle', color: 'blue' },
      };
    }

    case 'SET_TIMER_SETTINGS': {
      return {
        ...state,
        timerSettings: action.settings,
      };
    }

    case 'SET_TASKS': {
      return {
        ...state,
        tasks: action.tasks,
      };
    }

    case 'RESTORE_SESSION': {
      return {
        ...state,
        tasks: action.tasks,
        selectedTaskId: action.selectedTaskId,
        isTimerRunning: action.isTimerRunning,
        lastTickTimestamp: action.lastTickTimestamp,
      };
    }

    case 'SET_TARGET_TIME_SETTINGS': {
      return {
        ...state,
        targetTimeSettings: action.settings,
        tasks: updateRewardTime(
          state.tasks,
          action.settings,
          getBaseRewardSeconds(state.activeList)
        ),
      };
    }

    case 'REFRESH_REWARD_TIME': {
      return {
        ...state,
        tasks: updateRewardTime(
          state.tasks,
          state.targetTimeSettings,
          getBaseRewardSeconds(state.activeList)
        ),
      };
    }

    case 'FAST_FORWARD': {
      if (!state.selectedTaskId) return state;
      const currentIndex = state.tasks.findIndex((t) => t.id === state.selectedTaskId);
      if (currentIndex === -1) return state;

      const task = state.tasks[currentIndex];
      if (task.status === 'done') return state;

      // 10% または 10秒 早く進める
      const skipAmount = Math.max(10, Math.floor(task.plannedSeconds * 0.1));
      const newElapsed = Math.min(task.plannedSeconds, task.elapsedSeconds + skipAmount);

      let updatedTasks = state.tasks.map((t) =>
        t.id === state.selectedTaskId ? { ...t, elapsedSeconds: newElapsed } : t
      );

      updatedTasks = updateRewardTime(
        updatedTasks,
        state.targetTimeSettings,
        getBaseRewardSeconds(state.activeList)
      );

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    default:
      return state;
    }
}

export function useTaskTimer() {
  const [state, dispatch] = useReducer(timerReducer, {
    tasks: [],
    selectedTaskId: null,
    isTimerRunning: false,
    targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
    activeList: null,
    timerSettings: { shape: 'circle', color: 'blue' },
    lastTickTimestamp: null,
  });

  // 保存されたステートの復元
  useEffect(() => {
    if (state.activeList) {
      const saved = loadExecutionState();
      if (saved && saved.listId === state.activeList.id) {
        dispatch({
          type: 'RESTORE_SESSION',
          tasks: saved.tasks,
          selectedTaskId: saved.selectedTaskId,
          isTimerRunning: saved.isTimerRunning,
          lastTickTimestamp: saved.lastTickTimestamp,
        });
      }
    }
  }, [state.activeList?.id]);

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
  }, [state.tasks, state.selectedTaskId, state.isTimerRunning, state.lastTickTimestamp, state.activeList?.id]);

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
  }, [state.isTimerRunning, state.selectedTaskId, state.targetTimeSettings.mode]);

  const selectTask = useCallback((taskId: string) => {
    dispatch({ type: 'SELECT_TASK', taskId, now: Date.now() });
  }, []);

  const startTimer = useCallback(() => {
    dispatch({ type: 'START', now: Date.now() });
  }, []);

  const stopTimer = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'BACK', now: Date.now() });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    clearExecutionState();
  }, []);

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
    goBack,
    reset,
    setTasks,
    setTargetTimeSettings,
    initList,
    updateActiveList,
    setTimerSettings,
    fastForward,
  };
}
