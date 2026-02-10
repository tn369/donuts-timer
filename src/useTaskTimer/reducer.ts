/**
 * タイマーの各種状態遷移（時間更新、タスク選択、開始/停止など）を管理するリデューサー
 */
import type { Task, TodoList } from '../types';
import { calculateRewardSeconds, calculateRewardSecondsFromTargetTime } from '../utils/task';
import type { Action, State } from './types';

/**
 * リストの設定から基本のごほうび時間を取得する
 * @param list 対象のリスト
 * @returns 基本のごほうび時間（秒）
 */
export function getBaseRewardSeconds(list: TodoList | null): number {
  const rewardTask = list?.tasks.find((t) => t.kind === 'reward');
  return rewardTask ? rewardTask.plannedSeconds : 15 * 60; // fallback to 15 mins
}

/**
 * 現在のモード（所要時間/目標時刻）に基づいてごほうび時間を再計算する
 * モード情報はごほうびタスク自身のrewardSettingsから取得する
 * @param tasks タスク一覧
 * @param baseRewardSeconds 基本のごほうび時間
 * @returns 更新されたタスク一覧
 */
export function updateRewardTime(tasks: Task[], baseRewardSeconds: number): Task[] {
  const rewardTask = tasks.find((t) => t.kind === 'reward');
  if (!rewardTask) return tasks;

  const rewardElapsed = rewardTask.elapsedSeconds;
  const rewardSettings = rewardTask.rewardSettings;

  let newRewardSeconds: number;

  if (rewardSettings?.mode === 'target-time') {
    newRewardSeconds =
      calculateRewardTimeFromTargetReward(tasks, rewardSettings, new Date()) + rewardElapsed;
  } else {
    newRewardSeconds = calculateRewardSeconds(tasks, baseRewardSeconds);
  }

  return tasks.map((t) => (t.kind === 'reward' ? { ...t, plannedSeconds: newRewardSeconds } : t));
}

/**
 * 目標時刻モードでのごほうび時間計算（ごほうびタスクのrewardSettings利用版）
 * @param tasks タスク一覧
 * @param settings 報酬設定
 * @param settings.targetHour 目標時
 * @param settings.targetMinute 目標分
 * @param now 現在時刻
 * @returns 計算されたごほうび時間（秒）
 */
function calculateRewardTimeFromTargetReward(
  tasks: Task[],
  settings: { targetHour?: number; targetMinute?: number },
  now: Date
): number {
  let todoTasksSeconds = 0;

  tasks.forEach((t) => {
    if (t.kind !== 'todo') return;

    if (t.status === 'todo') {
      todoTasksSeconds += t.plannedSeconds;
    } else if (t.status === 'running' || t.status === 'paused') {
      const remaining = t.plannedSeconds - t.elapsedSeconds;
      if (remaining > 0) {
        todoTasksSeconds += remaining;
      }
    }
  });

  return calculateRewardSecondsFromTargetTime(
    settings.targetHour ?? 0,
    settings.targetMinute ?? 0,
    now,
    todoTasksSeconds
  );
}

/**
 * 1秒ごとの時間経過処理
 * @param state 現在の状態
 * @param action アクション
 * @param action.type アクションタイプ
 * @param action.now 現在のタイムスタンプ
 * @returns 新しい状態
 */
function handleTick(state: State, action: { type: 'TICK'; now: number }): State {
  if (!state.isTimerRunning || !state.selectedTaskId || state.lastTickTimestamp === null) {
    return state;
  }

  const { now } = action;
  const deltaMs = now - state.lastTickTimestamp;
  const deltaSeconds = Math.floor(deltaMs / 1000);

  if (deltaSeconds < 1) return state;

  const currentIndex = state.tasks.findIndex((t) => t.id === state.selectedTaskId);
  const task = state.tasks[currentIndex];

  if (currentIndex === -1 || task.status !== 'running') return state;

  const newElapsed = task.elapsedSeconds + deltaSeconds;
  let updatedTasks = state.tasks.map((t) =>
    t.id === state.selectedTaskId ? { ...t, elapsedSeconds: newElapsed } : t
  );

  updatedTasks = updateRewardTime(updatedTasks, getBaseRewardSeconds(state.activeList));

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

/**
 * すでに完了しているタスクがクリックされた時の処理（未完了に戻す）
 * @param state 現在の状態
 * @param taskId タスクID
 * @returns 更新された情報
 */
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
  return { updatedTasks, nextTaskIdToSelect: taskId, nextIsTimerRunning: state.isTimerRunning };
}

/**
 * 現在のタスクが完了した次に選択すべきタスクIDを取得する
 * @param tasks タスク一覧
 * @param currentIndex 現在のインデックス
 * @returns 次のタスクID、またはnull
 */
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

/**
 * 現在選択中のタスクがクリックされた時の処理（完了にする）
 * @param state 現在の状態
 * @param tappedIndex クリックされたインデックス
 * @returns 更新された情報
 */
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

/**
 * 未完了の（未選択の）タスクがクリックされた時の処理（選択を切り替える）
 * @param state 現在の状態
 * @param taskId タスクID
 * @param tappedIndex クリックされたインデックス
 * @returns 更新された情報、またはnull
 */
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

/**
 * タスク選択アクションのメインハンドラ
 * @param state 現在の状態
 * @param action アクション
 * @param action.type アクションタイプ
 * @param action.taskId タスクID
 * @param action.now 現在のタイムスタンプ
 * @returns 新しい状態
 */
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

  updatedTasks = updateRewardTime(updatedTasks, getBaseRewardSeconds(state.activeList));

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

/**
 * タイマー開始の処理
 * @param state 現在の状態
 * @param action アクション
 * @param action.type アクションタイプ
 * @param action.now 現在のタイムスタンプ
 * @returns 新しい状態
 */
function handleStart(state: State, action: { type: 'START'; now: number }): State {
  let targetTaskId = state.selectedTaskId;

  // もしタスクが選択されていない場合は、最初の未完了タスクを探す
  if (!targetTaskId) {
    const firstIncomplete = state.tasks.find((t) => t.status !== 'done');
    if (!firstIncomplete) return state;
    targetTaskId = firstIncomplete.id;
  }

  const updatedTasks = state.tasks.map((task) => {
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

/**
 * タイマー停止の処理
 * @param state 現在の状態
 * @returns 新しい状態
 */
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

/**
 * タイマーリセットの処理
 * @param state 現在の状態
 * @returns 新しい状態
 */
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
    tasks: updateRewardTime(resetTasks, getBaseRewardSeconds(state.activeList)),
    selectedTaskId: null,
    isTimerRunning: false,
    lastTickTimestamp: null,
  };
}

/**
 * アクティブなリストが更新された時の処理（設定変更の反映など）
 * @param state 現在の状態
 * @param action アクション
 * @param action.type アクションタイプ
 * @param action.list 新しいリスト
 * @returns 新しい状態
 */
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
    tasks: updateRewardTime(updatedTasks, getBaseRewardSeconds(list)),
  };
}

/**
 * リストの初期化処理
 * @param action アクション
 * @param action.type アクションタイプ
 * @param action.list 対象のリスト
 * @returns 新しい状態
 */
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
    tasks: updateRewardTime(initializedTasks, getBaseRewardSeconds(list)),
    selectedTaskId: null,
    isTimerRunning: false,
    lastTickTimestamp: null,
    targetTimeSettings: list.targetTimeSettings,
    timerSettings: list.timerSettings ?? { shape: 'circle', color: 'blue' },
    pendingRestorableState: null,
  };
}

/**
 * デバッグ用：早送りの処理
 * @param state 現在の状態
 * @returns 新しい状態
 */
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

  updatedTasks = updateRewardTime(updatedTasks, getBaseRewardSeconds(state.activeList));

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
  RESTORE_AVAILABLE: (state, action) => ({
    ...state,
    pendingRestorableState: {
      tasks: action.tasks,
      selectedTaskId: action.selectedTaskId,
      isTimerRunning: action.isTimerRunning,
      lastTickTimestamp: action.lastTickTimestamp,
    },
  }),
  RESTORE_SESSION: (state) => {
    if (!state.pendingRestorableState) return state;

    const { tasks, selectedTaskId, isTimerRunning, lastTickTimestamp } =
      state.pendingRestorableState;

    // 既存のタスク定義（名前、予定時間など）を維持しつつ、保存された実行状態（ステータス、経過時間など）を復元する
    const mergedTasks =
      state.tasks.length > 0
        ? state.tasks.map((task) => {
            const savedTask = tasks.find((t) => t.id === task.id);
            if (savedTask) {
              return {
                ...task,
                status: savedTask.status,
                elapsedSeconds: savedTask.elapsedSeconds,
                actualSeconds: savedTask.actualSeconds,
              };
            }
            return task;
          })
        : tasks;

    const finalSelectedTaskId = mergedTasks.some((t) => t.id === selectedTaskId)
      ? selectedTaskId
      : null;

    const finalIsTimerRunning = !!(finalSelectedTaskId && isTimerRunning);

    return {
      ...state,
      tasks: updateRewardTime(mergedTasks, getBaseRewardSeconds(state.activeList)),
      selectedTaskId: finalSelectedTaskId,
      isTimerRunning: finalIsTimerRunning,
      lastTickTimestamp,
      pendingRestorableState: null,
    };
  },
  CANCEL_RESTORE: (state) => ({
    ...state,
    pendingRestorableState: null,
  }),
  AUTO_RESTORE: (state, action) => {
    const { tasks, selectedTaskId, isTimerRunning, lastTickTimestamp } = action;
    const mergedTasks =
      state.tasks.length > 0
        ? state.tasks.map((task) => {
            const savedTask = tasks.find((t) => t.id === task.id);
            if (savedTask) {
              return {
                ...task,
                status: savedTask.status,
                elapsedSeconds: savedTask.elapsedSeconds,
                actualSeconds: savedTask.actualSeconds,
              };
            }
            return task;
          })
        : tasks;

    const finalSelectedTaskId = mergedTasks.some((t) => t.id === selectedTaskId)
      ? selectedTaskId
      : null;

    const finalIsTimerRunning = !!(finalSelectedTaskId && isTimerRunning);

    return {
      ...state,
      tasks: updateRewardTime(mergedTasks, getBaseRewardSeconds(state.activeList)),
      selectedTaskId: finalSelectedTaskId,
      isTimerRunning: finalIsTimerRunning,
      lastTickTimestamp,
      pendingRestorableState: null,
    };
  },
  SET_TARGET_TIME_SETTINGS: (state, action) => {
    const settings = action.settings;
    return {
      ...state,
      targetTimeSettings: settings,
      tasks: updateRewardTime(state.tasks, getBaseRewardSeconds(state.activeList)),
    };
  },
  REFRESH_REWARD_TIME: (state) => ({
    ...state,
    tasks: updateRewardTime(state.tasks, getBaseRewardSeconds(state.activeList)),
  }),
  REORDER_TASKS: (state, action) => {
    const { fromIndex, toIndex } = action;

    // Validate indices
    if (
      fromIndex < 0 ||
      fromIndex >= state.tasks.length ||
      toIndex < 0 ||
      toIndex >= state.tasks.length ||
      fromIndex === toIndex
    ) {
      return state;
    }

    // Reorder tasks
    const newTasks = [...state.tasks];
    const [movedTask] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, movedTask);

    // Recalculate reward time after reordering
    const updatedTasks = updateRewardTime(newTasks, getBaseRewardSeconds(state.activeList));

    return {
      ...state,
      tasks: updatedTasks,
    };
  },
  FAST_FORWARD: handleFastForward as unknown as Handler<'FAST_FORWARD'>,
};

/**
 * 状態遷移を分岐するメインのリデューサー関数
 * @param state 現在の状態
 * @param action アクション
 * @returns 新しい状態
 */
export function timerReducer(state: State, action: Action): State {
  const handler = handlers[action.type] as Handler<Action['type']>;
  return handler(state, action);
}
