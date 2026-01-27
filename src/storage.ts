import { DEFAULT_TODO_LISTS } from './constants';
import type { Task, TodoList } from './types';

const LISTS_STORAGE_KEY = 'task-timer-lists';
const ACTIVE_LIST_ID_KEY = 'task-timer-active-id';
const EXECUTION_STATE_KEY = 'task-timer-execution-state';

export type TimerMode = 'single' | 'sibling-0' | 'sibling-1';

const getExecutionStateKey = (listId: string, mode: TimerMode): string =>
  `${EXECUTION_STATE_KEY}-${mode}-${listId}`;

export interface ExecutionState {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  lastTickTimestamp: number | null;
  listId: string;
  mode?: TimerMode;
}

/**
 * localStorageからすべてのやることリストを読み込み
 */
export const loadTodoLists = (): TodoList[] => {
  try {
    const stored = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_TODO_LISTS;
    }

    return JSON.parse(stored) as TodoList[];
  } catch (error) {
    console.error('Failed to load todo lists:', error);
    return DEFAULT_TODO_LISTS;
  }
};

/**
 * localStorageにすべてのやることリストを保存
 */
export const saveTodoLists = (lists: TodoList[]): void => {
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Failed to save todo lists:', error);
  }
};

/**
 * 現在選択されているリストIDを読み込み
 */
export const loadActiveListId = (): string | null => {
  return localStorage.getItem(ACTIVE_LIST_ID_KEY);
};

/**
 * 現在選択されているリストIDを保存
 */
export const saveActiveListId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(ACTIVE_LIST_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_LIST_ID_KEY);
  }
};

export const saveExecutionState = (state: ExecutionState): void => {
  try {
    const mode = state.mode ?? 'single';
    localStorage.setItem(getExecutionStateKey(state.listId, mode), JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save execution state:', error);
  }
};

export const loadExecutionState = (listId: string, mode: TimerMode): ExecutionState | null => {
  try {
    const stored = localStorage.getItem(getExecutionStateKey(listId, mode));
    if (stored) {
      return JSON.parse(stored) as ExecutionState;
    }

    // singleモードの場合のみ、移行前のキーもチェックする
    if (mode === 'single') {
      const perListKey = `${EXECUTION_STATE_KEY}-${listId}`;
      const perListStored = localStorage.getItem(perListKey);
      if (perListStored) {
        const parsed = JSON.parse(perListStored) as ExecutionState;
        localStorage.setItem(getExecutionStateKey(listId, 'single'), perListStored);
        localStorage.removeItem(perListKey);
        return parsed;
      }

      const legacyStored = localStorage.getItem(EXECUTION_STATE_KEY);
      if (legacyStored) {
        const parsed = JSON.parse(legacyStored) as ExecutionState;
        if (parsed.listId === listId) {
          localStorage.setItem(getExecutionStateKey(listId, 'single'), legacyStored);
          localStorage.removeItem(EXECUTION_STATE_KEY);
          return parsed;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to load execution state:', error);
    return null;
  }
};

export const clearExecutionState = (listId?: string, mode?: TimerMode): void => {
  if (listId && mode) {
    localStorage.removeItem(getExecutionStateKey(listId, mode));
  } else if (listId) {
    // 古い形式も含めて削除を試みる
    localStorage.removeItem(`${EXECUTION_STATE_KEY}-${listId}`);
    localStorage.removeItem(getExecutionStateKey(listId, 'single'));
    localStorage.removeItem(getExecutionStateKey(listId, 'sibling-0'));
    localStorage.removeItem(getExecutionStateKey(listId, 'sibling-1'));
  }
  localStorage.removeItem(EXECUTION_STATE_KEY);
};
