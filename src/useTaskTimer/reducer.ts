/**
 * タイマー状態遷移の reducer。
 */

import type { TargetTimeSettings, Task, TodoList } from '../types';
import { calculateRewardSeconds, calculateRewardSecondsFromTargetTime } from '../utils/task';
import type { Action, State } from './types';

export function getBaseRewardSeconds(list: TodoList | null): number {
  const rewardTask = list?.tasks.find((t) => t.kind === 'reward');
  return rewardTask ? rewardTask.plannedSeconds : 15 * 60; // fallback to 15 mins
}

export function updateRewardTime(
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

function handleTick(state: State, action: { type: 'TICK'; now: number }): State {
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
  if (updatedTask?.kind === 'reward' && updatedTask.elapsedSeconds >= updatedTask.plannedSeconds) {
    updatedTasks = updatedTasks.map((t) =>
      t.id === state.selectedTaskId ? { ...t, status: 'done', actualSeconds: t.elapsedSeconds } : t
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

function handleDoneTaskClick(
  state: State,
  taskId: string
): { updatedTasks: Task[]; nextTaskIdToSelect: string | null; nextIsTimerRunning: boolean } {
  let updatedTasks = [...state.tasks];
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
  return { updatedTasks, nextTaskIdToSelect: taskId, nextIsTimerRunning: false };
}

function getNextIncompleteTaskId(tasks: Task[], currentIndex: number): string | null {
  const nextIncomplete = tasks.slice(currentIndex + 1).find((t) => t.status !== 'done');
  const allIncomplete = tasks.filter((t) => t.status !== 'done');

  if (nextIncomplete) {
    if (nextIncomplete.kind === 'reward') {
      const hasOtherTodo = tasks.some(
        (t) => t.status !== 'done' && t.kind === 'todo' && t.id !== nextIncomplete.id
      );
      return hasOtherTodo ? allIncomplete[0].id : nextIncomplete.id;
    }
    return nextIncomplete.id;
  }
  return allIncomplete.length > 0 ? allIncomplete[0].id : null;
}

function handleActiveTaskClick(
  state: State,
  tappedIndex: number
): { updatedTasks: Task[]; nextTaskIdToSelect: string | null; nextIsTimerRunning: boolean } {
  const tappedTask = state.tasks[tappedIndex];
  const updatedTasks = [...state.tasks];
  let nextTaskIdToSelect = state.selectedTaskId;
  let nextIsTimerRunning = state.isTimerRunning;

  if (state.isTimerRunning) {
    updatedTasks[tappedIndex] = {
      ...tappedTask,
      status: 'done' as const,
      actualSeconds: tappedTask.elapsedSeconds,
    };

    nextTaskIdToSelect = getNextIncompleteTaskId(updatedTasks, tappedIndex);
    if (!nextTaskIdToSelect) {
      nextIsTimerRunning = false;
    }
  } else {
    nextIsTimerRunning = true;
  }

  return { updatedTasks, nextTaskIdToSelect, nextIsTimerRunning };
}

function handleTodoTaskClick(
  state: State,
  taskId: string,
  tappedIndex: number
): { updatedTasks: Task[]; nextTaskIdToSelect: string | null; nextIsTimerRunning: boolean } | null {
  const tappedTask = state.tasks[tappedIndex];
  let updatedTasks = [...state.tasks];

  if (tappedTask.kind === 'reward') {
    const hasIncompleteBefore = updatedTasks.slice(0, tappedIndex).some((t) => t.status !== 'done');
    if (hasIncompleteBefore) {
      return null;
    }
  }

  if (state.selectedTaskId) {
    updatedTasks = updatedTasks.map((t) =>
      t.id === state.selectedTaskId && t.status === 'running'
        ? { ...t, status: 'paused' as const }
        : t
    );
  }

  return { updatedTasks, nextTaskIdToSelect: taskId, nextIsTimerRunning: true };
}

function handleSelectTask(
  state: State,
  action: { type: 'SELECT_TASK'; taskId: string; now: number }
): State {
  const { taskId, now } = action;
  const tappedIndex = state.tasks.findIndex((t) => t.id === taskId);
  if (tappedIndex === -1) return state;

  const tappedTask = state.tasks[tappedIndex];
  const isCurrentTapped = taskId === state.selectedTaskId;

  let result: {
    updatedTasks: Task[];
    nextTaskIdToSelect: string | null;
    nextIsTimerRunning: boolean;
  } | null;

  if (tappedTask.status === 'done') {
    result = handleDoneTaskClick(state, taskId);
  } else if (isCurrentTapped) {
    result = handleActiveTaskClick(state, tappedIndex);
  } else {
    result = handleTodoTaskClick(state, taskId, tappedIndex);
  }

  if (!result) return state;

  let { updatedTasks } = result;
  const { nextTaskIdToSelect, nextIsTimerRunning } = result;

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

function handleStart(state: State, action: { type: 'START'; now: number }): State {
  let targetTaskId = state.selectedTaskId;
  let updatedTasks = state.tasks;

  // もしタスクが選択されていない場合は、最初の未完了タスクを探す
  if (!targetTaskId) {
    const firstIncomplete = state.tasks.find((t) => t.status !== 'done');
    if (firstIncomplete) {
      targetTaskId = firstIncomplete.id;
    } else {
      return state;
    }
  }

  updatedTasks = updatedTasks.map((task) => {
    if (task.id === targetTaskId && task.status !== 'done') {
      return { ...task, status: 'running' as const };
    }
    return task;
  });

  return {
    ...state,
    tasks: updatedTasks,
    selectedTaskId: targetTaskId,
    isTimerRunning: true,
    lastTickTimestamp: action.now,
  };
}

function handleStop(state: State): State {
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

function handleReset(state: State): State {
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
    selectedTaskId: null,
    isTimerRunning: false,
    lastTickTimestamp: null,
  };
}

function handleUpdateActiveList(
  state: State,
  action: { type: 'UPDATE_ACTIVE_LIST'; list: TodoList }
): State {
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

function handleInitList(action: { type: 'INIT_LIST'; list: TodoList }): State {
  const { list } = action;
  const initializedTasks = list.tasks.map((t: Task) => ({
    ...t,
    status: 'todo' as const,
    elapsedSeconds: 0,
    actualSeconds: 0,
  }));
  return {
    activeList: list,
    tasks: updateRewardTime(initializedTasks, list.targetTimeSettings, getBaseRewardSeconds(list)),
    selectedTaskId: null,
    isTimerRunning: false,
    lastTickTimestamp: null,
    targetTimeSettings: list.targetTimeSettings,
    timerSettings: list.timerSettings ?? { shape: 'circle', color: 'blue' },
  };
}

function handleFastForward(state: State): State {
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

type Handler<T extends Action['type']> = (
  state: State,
  action: Extract<Action, { type: T }>
) => State;

const handlers: { [K in Action['type']]?: Handler<K> } = {
  TICK: handleTick as Handler<'TICK'>,
  SELECT_TASK: handleSelectTask as Handler<'SELECT_TASK'>,
  START: handleStart as Handler<'START'>,
  STOP: handleStop as unknown as Handler<'STOP'>,
  RESET: handleReset as unknown as Handler<'RESET'>,
  UPDATE_ACTIVE_LIST: handleUpdateActiveList as Handler<'UPDATE_ACTIVE_LIST'>,
  INIT_LIST: (_state, action) => handleInitList(action),
  SET_TIMER_SETTINGS: (state, action) => ({ ...state, timerSettings: action.settings }),
  SET_TASKS: (state, action) => ({ ...state, tasks: action.tasks }),
  RESTORE_SESSION: (state, action) => ({
    ...state,
    tasks: action.tasks,
    selectedTaskId: action.selectedTaskId,
    isTimerRunning: action.isTimerRunning,
    lastTickTimestamp: action.lastTickTimestamp,
  }),
  SET_TARGET_TIME_SETTINGS: (state, action) => {
    const settings = action.settings;
    return {
      ...state,
      targetTimeSettings: settings,
      tasks: updateRewardTime(state.tasks, settings, getBaseRewardSeconds(state.activeList)),
    };
  },
  REFRESH_REWARD_TIME: (state) => ({
    ...state,
    tasks: updateRewardTime(
      state.tasks,
      state.targetTimeSettings,
      getBaseRewardSeconds(state.activeList)
    ),
  }),
  FAST_FORWARD: handleFastForward as unknown as Handler<'FAST_FORWARD'>,
};

export function timerReducer(state: State, action: Action): State {
  const handler = handlers[action.type] as Handler<Action['type']>;
  return handler(state, action);
}
