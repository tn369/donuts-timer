import { useReducer, useCallback, useEffect } from 'react';
import type { Task, TargetTimeSettings, TodoList } from './types';
import { calculateRewardSeconds, calculateRewardSecondsFromTargetTime } from './utils';

type State = {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  targetTimeSettings: TargetTimeSettings;
  activeList: TodoList | null;
};

type Action =
  | { type: 'TICK' }
  | { type: 'SELECT_TASK'; taskId: string }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'BACK' }
  | { type: 'RESET' }
  | { type: 'SET_TASKS'; tasks: Task[] } // Debug use
  | { type: 'SET_TARGET_TIME_SETTINGS'; settings: TargetTimeSettings }
  | { type: 'REFRESH_REWARD_TIME' }
  | { type: 'UPDATE_ACTIVE_LIST'; list: TodoList }
  | { type: 'INIT_LIST'; list: TodoList };

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
      if (!state.isTimerRunning || !state.selectedTaskId) return state;

      const currentIndex = state.tasks.findIndex((t) => t.id === state.selectedTaskId);
      if (currentIndex === -1) return state;

      const task = state.tasks[currentIndex];
      if (task.status !== 'running') return state;

      const newElapsed = task.elapsedSeconds + 1;
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
        };
      }

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case 'SELECT_TASK': {
      const { taskId } = action;
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);

      // Selectable check
      if (taskIndex === -1) return state;
      if (taskIndex > 0 && state.tasks[taskIndex - 1].status !== 'done') return state;

      const currentIndex = state.tasks.findIndex((t) => t.id === state.selectedTaskId);
      const isCurrentTapped = taskId === state.selectedTaskId;

      let updatedTasks = [...state.tasks];
      let nextTaskIdToSelect = state.selectedTaskId;
      let nextIsTimerRunning = state.isTimerRunning;

      if (currentIndex !== -1) {
        const currentTask = updatedTasks[currentIndex];

        if (currentTask.status === 'done' && isCurrentTapped) {
          return state;
        }

        if (currentTask.status === 'running' || currentTask.status === 'paused') {
          updatedTasks[currentIndex] = {
            ...currentTask,
            status: 'done' as const,
            actualSeconds: currentTask.elapsedSeconds,
          };

          if (isCurrentTapped) {
            const nextTask = state.tasks[currentIndex + 1];
            if (nextTask) {
              nextTaskIdToSelect = nextTask.id;
            } else {
              nextIsTimerRunning = false;
            }
          } else {
            nextTaskIdToSelect = taskId;
          }
        } else {
          nextTaskIdToSelect = taskId;
        }
      } else {
        nextTaskIdToSelect = taskId;
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
        targetTimeSettings: list.targetTimeSettings,
      };
    }

    case 'SET_TASKS': {
      return {
        ...state,
        tasks: action.tasks,
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
  });

  useEffect(() => {
    // タイマーが動いている場合は TICK を送る
    // タイマーが止まっていても、目標時刻モードの場合は時刻経過に合わせて遊び時間を再計算するために REFRESH を送る
    const interval = setInterval(() => {
      if (state.isTimerRunning && state.selectedTaskId) {
        dispatch({ type: 'TICK' });
      } else if (state.targetTimeSettings.mode === 'target-time') {
        dispatch({ type: 'REFRESH_REWARD_TIME' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isTimerRunning, state.selectedTaskId, state.targetTimeSettings.mode]);

  const selectTask = useCallback((taskId: string) => {
    dispatch({ type: 'SELECT_TASK', taskId });
  }, []);

  const startTimer = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const stopTimer = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const isTaskSelectable = useCallback(
    (taskId: string): boolean => {
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return false;
      if (taskIndex === 0) return true;
      const previousTask = state.tasks[taskIndex - 1];
      return previousTask.status === 'done';
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
  };
}
