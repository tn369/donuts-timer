import { useReducer, useCallback, useEffect } from 'react';
import type { Task, TargetTimeSettings } from './types';
import { INITIAL_TASKS, BASE_PLAY_SECONDS } from './constants';
import { calculatePlaySeconds, calculatePlaySecondsFromTargetTime } from './utils';
import { loadSettings } from './storage';

type State = {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  targetTimeSettings: TargetTimeSettings;
};

type Action =
  | { type: 'TICK' }
  | { type: 'SELECT_TASK'; taskId: string }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'BACK' }
  | { type: 'RESET' }
  | { type: 'SET_TASKS'; tasks: Task[] } // Debug use
  | { type: 'SET_TARGET_TIME_SETTINGS'; settings: TargetTimeSettings };

function updateTasksPlayTime(tasks: Task[], targetTimeSettings: TargetTimeSettings): Task[] {
  let newPlaySeconds: number;
  
  if (targetTimeSettings.mode === 'target-time') {
    // 目標時刻モード: 目標時刻から逆算
    const currentTime = new Date();
    
    // 固定タスクの合計時間を計算（未完了タスクのみ）
    let fixedTasksSeconds = 0;
    let overdueSeconds = 0;
    
    tasks.forEach((t) => {
      if (t.kind === 'fixed') {
        if (t.status === 'todo') {
          // 未開始の固定タスク
          fixedTasksSeconds += t.plannedSeconds;
        } else if (t.status === 'running' || t.status === 'paused') {
          // 実行中の固定タスク
          const remaining = t.plannedSeconds - t.elapsedSeconds;
          if (remaining > 0) {
            fixedTasksSeconds += remaining;
          } else {
            overdueSeconds += Math.abs(remaining);
          }
        } else if (t.status === 'done') {
          // 完了済みの固定タスク（超過分を考慮）
          const overdue = t.actualSeconds - t.plannedSeconds;
          if (overdue > 0) {
            overdueSeconds += overdue;
          }
        }
      }
    });
    
    newPlaySeconds = calculatePlaySecondsFromTargetTime(
      targetTimeSettings.targetHour,
      targetTimeSettings.targetMinute,
      currentTime,
      fixedTasksSeconds,
      overdueSeconds
    );
  } else {
    // 所要時間モード: 従来の計算方法
    newPlaySeconds = calculatePlaySeconds(tasks, BASE_PLAY_SECONDS);
  }
  
  return tasks.map((t) =>
    t.kind === 'variable' ? { ...t, plannedSeconds: newPlaySeconds } : t
  );
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
      const updatedTasks = state.tasks.map((t) =>
        t.id === state.selectedTaskId ? { ...t, elapsedSeconds: newElapsed } : t
      );

      return {
        ...state,
        tasks: updateTasksPlayTime(updatedTasks, state.targetTimeSettings),
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

      updatedTasks = updateTasksPlayTime(updatedTasks, state.targetTimeSettings);

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
      let updatedTasks = [...state.tasks];
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
        tasks: updateTasksPlayTime(updatedTasks, state.targetTimeSettings),
        selectedTaskId: newSelectedTaskId,
      };
    }

    case 'RESET': {
      const resetTasks = INITIAL_TASKS.map((task) => ({
        ...task,
        elapsedSeconds: 0,
        actualSeconds: 0,
        status: 'todo' as const,
      }));
      return {
        tasks: updateTasksPlayTime(resetTasks, state.targetTimeSettings),
        selectedTaskId: INITIAL_TASKS[0].id,
        isTimerRunning: false,
        targetTimeSettings: state.targetTimeSettings,
      };
    }

    case 'SET_TASKS': {
        return {
            ...state,
            tasks: action.tasks
        };
    }

    case 'SET_TARGET_TIME_SETTINGS': {
      return {
        ...state,
        targetTimeSettings: action.settings,
        tasks: updateTasksPlayTime(state.tasks, action.settings),
      };
    }

    default:
      return state;
  }
}

export function useTaskTimer() {
  const initialSettings = loadSettings();
  const [state, dispatch] = useReducer(timerReducer, {
    tasks: updateTasksPlayTime(
      INITIAL_TASKS.map((t) => ({ ...t, status: 'todo' as const, elapsedSeconds: 0, actualSeconds: 0 })),
      initialSettings
    ),
    selectedTaskId: INITIAL_TASKS[0].id,
    isTimerRunning: false,
    targetTimeSettings: initialSettings,
  });

  useEffect(() => {
    if (!state.isTimerRunning || !state.selectedTaskId) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isTimerRunning, state.selectedTaskId]);

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

  const isTaskSelectable = useCallback((taskId: string): boolean => {
    const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return false;
    if (taskIndex === 0) return true;
    const previousTask = state.tasks[taskIndex - 1];
    return previousTask.status === 'done';
  }, [state.tasks]);

  const setTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', tasks });
  }, []);

  const setTargetTimeSettings = useCallback((settings: TargetTimeSettings) => {
    dispatch({ type: 'SET_TARGET_TIME_SETTINGS', settings });
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
  };
}
