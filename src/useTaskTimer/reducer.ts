/**
 * タイマーの各種状態遷移（時間更新、タスク選択、開始/停止など）を管理するリデューサー
 */
import {
  getNextIncompleteTaskId,
  markTaskDone,
  markTaskPaused,
  markTaskRunning,
  reopenTask,
  resetTaskProgress,
  withElapsedSeconds,
} from '../domain/timer/entities/taskEntity';
import { toAppTasks, toDomainList, toDomainTasks } from '../domain/timer/mappers/taskMapper';
import type { DomainTask } from '../domain/timer/model';
import {
  getBaseRewardSeconds as getBaseRewardSecondsPolicy,
  updateRewardTime as updateRewardTimePolicy,
} from '../domain/timer/policies/rewardPolicy';
import { canSelectRewardTaskAtIndex } from '../domain/timer/policies/selectabilityPolicy';
import { restoreSession } from '../domain/timer/services/sessionTransition';
import type { Task, TodoList } from '../types';
import type { Action, State } from './types';

/**
 * リストの設定から基本のごほうび時間を取得する
 * @param list 対象のリスト
 * @returns 基本のごほうび時間（秒）
 */
export function getBaseRewardSeconds(list: TodoList | null): number {
  return getBaseRewardSecondsPolicy(toDomainList(list));
}

/**
 * 現在のモード（所要時間/目標時刻）に基づいてごほうび時間を再計算する
 * モード情報はごほうびタスク自身のrewardSettingsから取得する
 * @param tasks タスク一覧
 * @param baseRewardSeconds 基本のごほうび時間
 * @returns 更新されたタスク一覧
 */
export function updateRewardTime(tasks: Task[], baseRewardSeconds: number): Task[] {
  return toAppTasks(updateRewardTimePolicy(toDomainTasks(tasks), baseRewardSeconds));
}

const updateRewardTimeInState = (
  tasks: DomainTask[],
  activeList: TodoList | null,
  now?: Date
): DomainTask[] => {
  // reducer内部はDomainTaskで扱い、ここでのみごほうび再計算を集中させる。
  const baseRewardSeconds = getBaseRewardSecondsPolicy(toDomainList(activeList));
  return updateRewardTimePolicy(tasks, baseRewardSeconds, now);
};

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

  // 1秒未満の更新は切り捨て、次回tickへ持ち越す。
  if (deltaSeconds < 1) return state;

  const currentIndex = state.tasks.findIndex((task) => task.id === state.selectedTaskId);
  const task = state.tasks[currentIndex];

  if (currentIndex === -1 || task.status !== 'running') return state;

  const newElapsed = task.elapsedSeconds + deltaSeconds;
  let updatedTasks = state.tasks.map((candidate) =>
    candidate.id === state.selectedTaskId ? withElapsedSeconds(candidate, newElapsed) : candidate
  );

  updatedTasks = updateRewardTimeInState(updatedTasks, state.activeList);

  // ごほうびタスクが時間切れになった場合の自動終了処理
  const updatedTask = updatedTasks.find((candidate) => candidate.id === state.selectedTaskId);
  if (updatedTask?.kind === 'reward' && updatedTask.elapsedSeconds >= updatedTask.plannedSeconds) {
    updatedTasks = updatedTasks.map((candidate) =>
      candidate.id === state.selectedTaskId ? markTaskDone(candidate) : candidate
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
): { updatedTasks: DomainTask[]; nextTaskIdToSelect: string | null; nextIsTimerRunning: boolean } {
  let updatedTasks = [...state.tasks];

  if (state.selectedTaskId) {
    updatedTasks = updatedTasks.map((task) =>
      task.id === state.selectedTaskId ? markTaskPaused(task) : task
    );
  }

  updatedTasks = updatedTasks.map((task) => (task.id === taskId ? reopenTask(task) : task));

  return { updatedTasks, nextTaskIdToSelect: taskId, nextIsTimerRunning: state.isTimerRunning };
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
): { updatedTasks: DomainTask[]; nextTaskIdToSelect: string | null; nextIsTimerRunning: boolean } {
  const tappedTask = state.tasks[tappedIndex];
  const updatedTasks = [...state.tasks];
  let nextTaskIdToSelect = state.selectedTaskId;
  let nextIsTimerRunning = state.isTimerRunning;

  if (state.isTimerRunning) {
    updatedTasks[tappedIndex] = markTaskDone(tappedTask);

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
): {
  updatedTasks: DomainTask[];
  nextTaskIdToSelect: string | null;
  nextIsTimerRunning: boolean;
} | null {
  const tappedTask = state.tasks[tappedIndex];
  let updatedTasks = [...state.tasks];

  if (tappedTask.kind === 'reward') {
    const canSelectReward = canSelectRewardTaskAtIndex(updatedTasks, tappedIndex);
    if (!canSelectReward) {
      return null;
    }
  }

  if (state.selectedTaskId) {
    updatedTasks = updatedTasks.map((task) =>
      task.id === state.selectedTaskId ? markTaskPaused(task) : task
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
  const tappedIndex = state.tasks.findIndex((task) => task.id === taskId);
  if (tappedIndex === -1) return state;

  const tappedTask = state.tasks[tappedIndex];
  const isCurrentTapped = taskId === state.selectedTaskId;

  let result: {
    updatedTasks: DomainTask[];
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

  updatedTasks = updateRewardTimeInState(updatedTasks, state.activeList);

  if (nextTaskIdToSelect && nextIsTimerRunning) {
    updatedTasks = updatedTasks.map((task) =>
      task.id === nextTaskIdToSelect ? markTaskRunning(task) : task
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
    const firstIncomplete = state.tasks.find((task) => task.status !== 'done');
    if (!firstIncomplete) return state;
    targetTaskId = firstIncomplete.id;
  }

  const updatedTasks = state.tasks.map((task) =>
    task.id === targetTaskId ? markTaskRunning(task) : task
  );

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
  const updatedTasks = state.tasks.map((task) => markTaskPaused(task));
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

  const resetTasks = toDomainTasks(state.activeList.tasks).map((task) => resetTaskProgress(task));

  return {
    ...state,
    tasks: updateRewardTimeInState(resetTasks, state.activeList),
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
  const updatedTasks = toDomainTasks(list.tasks).map((newTask) => {
    const existingTask = state.tasks.find((task) => task.id === newTask.id);
    if (existingTask) {
      // リスト定義（名前・予定時間）は新しい定義を優先し、進捗は現在状態を維持する。
      return {
        ...newTask,
        status: existingTask.status,
        elapsedSeconds: existingTask.elapsedSeconds,
        actualSeconds: existingTask.actualSeconds,
      };
    }

    return resetTaskProgress(newTask);
  });

  return {
    ...state,
    activeList: list,
    targetTimeSettings: list.targetTimeSettings,
    tasks: updateRewardTimeInState(updatedTasks, list),
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
  const initializedTasks = toDomainTasks(list.tasks).map((task) => resetTaskProgress(task));

  return {
    activeList: list,
    tasks: updateRewardTimeInState(initializedTasks, list),
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
  const currentIndex = state.tasks.findIndex((task) => task.id === state.selectedTaskId);
  if (currentIndex === -1) return state;

  const task = state.tasks[currentIndex];
  if (task.status === 'done') return state;

  // 10% または 10秒 早く進める
  const skipAmount = Math.max(10, Math.floor(task.plannedSeconds * 0.1));
  const newElapsed = Math.min(task.plannedSeconds, task.elapsedSeconds + skipAmount);

  let updatedTasks = state.tasks.map((candidate) =>
    candidate.id === state.selectedTaskId ? withElapsedSeconds(candidate, newElapsed) : candidate
  );

  updatedTasks = updateRewardTimeInState(updatedTasks, state.activeList);

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
  SET_TASKS: (state, action) => ({ ...state, tasks: toDomainTasks(action.tasks) }),
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
    // 復元時は「現在のタスク定義 + 保存済み進捗」を合成する。
    const restored = restoreSession(
      state.tasks,
      toDomainTasks(tasks),
      selectedTaskId,
      isTimerRunning
    );

    return {
      ...state,
      tasks: updateRewardTimeInState(restored.tasks, state.activeList),
      selectedTaskId: restored.selectedTaskId,
      isTimerRunning: restored.isTimerRunning,
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
    // AUTO_RESTOREもRESTORE_SESSIONと同じ合成規則を使う。
    const restored = restoreSession(
      state.tasks,
      toDomainTasks(tasks),
      selectedTaskId,
      isTimerRunning
    );

    return {
      ...state,
      tasks: updateRewardTimeInState(restored.tasks, state.activeList),
      selectedTaskId: restored.selectedTaskId,
      isTimerRunning: restored.isTimerRunning,
      lastTickTimestamp,
      pendingRestorableState: null,
    };
  },
  SET_TARGET_TIME_SETTINGS: (state, action) => {
    const settings = action.settings;
    return {
      ...state,
      targetTimeSettings: settings,
      tasks: updateRewardTimeInState(state.tasks, state.activeList),
    };
  },
  REFRESH_REWARD_TIME: (state) => ({
    ...state,
    tasks: updateRewardTimeInState(state.tasks, state.activeList),
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
    const updatedTasks = updateRewardTimeInState(newTasks, state.activeList);

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
