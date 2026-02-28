/**
 * タイマーの各種状態遷移（時間更新、タスク選択、開始/停止など）を管理するリデューサー
 */
import { deriveRewardGainNotice } from '../domain/timer/policies/rewardGainNoticePolicy';
import {
  applyActiveListRuntime,
  type DomainRuntimeState,
  fastForwardRuntime,
  initRuntimeFromList,
  refreshRewardRuntime,
  reorderTasksRuntime,
  resetRuntime,
  restoreRuntime,
  selectTaskRuntime,
  startRuntime,
  stopRuntime,
  tickRuntime,
} from '../domain/timer/services/runtimeTransition';
import type { Action, State } from './types';

type Handler<T extends Action['type']> = (
  state: State,
  action: Extract<Action, { type: T }>
) => State;

const toRuntimeState = (state: State): DomainRuntimeState => ({
  tasks: state.tasks,
  selectedTaskId: state.selectedTaskId,
  isTimerRunning: state.isTimerRunning,
  lastTickTimestamp: state.lastTickTimestamp,
});

const withRuntimeState = (state: State, runtimeState: DomainRuntimeState): State => ({
  ...state,
  tasks: runtimeState.tasks,
  selectedTaskId: runtimeState.selectedTaskId,
  isTimerRunning: runtimeState.isTimerRunning,
  lastTickTimestamp: runtimeState.lastTickTimestamp,
});

const handlers: { [K in Action['type']]?: Handler<K> } = {
  TICK: (state, action) =>
    withRuntimeState(state, tickRuntime(toRuntimeState(state), action.now, state.activeList)),

  SELECT_TASK: (state, action) =>
    (() => {
      const nextRuntimeState = selectTaskRuntime(
        toRuntimeState(state),
        action.taskId,
        action.now,
        state.activeList
      );

      return {
        ...withRuntimeState(state, nextRuntimeState),
        rewardGainNotice: deriveRewardGainNotice(state.tasks, nextRuntimeState.tasks, action.now),
      };
    })(),

  START: (state, action) =>
    withRuntimeState(state, startRuntime(toRuntimeState(state), action.now)),

  STOP: (state) => withRuntimeState(state, stopRuntime(toRuntimeState(state))),

  RESET: (state) => ({
    ...withRuntimeState(state, resetRuntime(toRuntimeState(state), state.activeList)),
    rewardGainNotice: null,
  }),

  UPDATE_ACTIVE_LIST: (state, action) => {
    const runtimeState = applyActiveListRuntime(toRuntimeState(state), action.list);
    return {
      ...withRuntimeState(state, runtimeState),
      activeList: action.list,
      targetTimeSettings: action.list.targetTimeSettings,
      rewardGainNotice: null,
    };
  },

  INIT_LIST: (state, action) => {
    const runtimeState = initRuntimeFromList(action.list);
    return {
      ...state,
      ...runtimeState,
      activeList: action.list,
      targetTimeSettings: action.list.targetTimeSettings,
      timerSettings: action.list.timerSettings ?? { shape: 'circle', color: 'blue' },
      pendingRestorableState: null,
      rewardGainNotice: null,
    };
  },

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
    if (!state.pendingRestorableState) {
      return state;
    }

    const runtimeState = restoreRuntime(
      toRuntimeState(state),
      state.pendingRestorableState,
      state.activeList
    );

    return {
      ...withRuntimeState(state, runtimeState),
      pendingRestorableState: null,
      rewardGainNotice: null,
    };
  },

  CANCEL_RESTORE: (state) => ({
    ...state,
    pendingRestorableState: null,
    rewardGainNotice: null,
  }),

  AUTO_RESTORE: (state, action) => {
    const runtimeState = restoreRuntime(
      toRuntimeState(state),
      {
        tasks: action.tasks,
        selectedTaskId: action.selectedTaskId,
        isTimerRunning: action.isTimerRunning,
        lastTickTimestamp: action.lastTickTimestamp,
      },
      state.activeList
    );

    return {
      ...withRuntimeState(state, runtimeState),
      pendingRestorableState: null,
      rewardGainNotice: null,
    };
  },

  CLEAR_REWARD_GAIN_NOTICE: (state) => ({
    ...state,
    rewardGainNotice: null,
  }),

  SET_TARGET_TIME_SETTINGS: (state, action) => {
    const runtimeState = refreshRewardRuntime(toRuntimeState(state), state.activeList);
    return {
      ...withRuntimeState(state, runtimeState),
      targetTimeSettings: action.settings,
    };
  },

  REFRESH_REWARD_TIME: (state) =>
    withRuntimeState(state, refreshRewardRuntime(toRuntimeState(state), state.activeList)),

  REORDER_TASKS: (state, action) =>
    withRuntimeState(
      state,
      reorderTasksRuntime(toRuntimeState(state), action.fromIndex, action.toIndex, state.activeList)
    ),

  FAST_FORWARD: (state) =>
    withRuntimeState(state, fastForwardRuntime(toRuntimeState(state), state.activeList)),
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
