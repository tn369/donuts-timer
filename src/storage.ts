import type { TodoList, Task } from './types';
import { DEFAULT_TODO_LISTS } from './constants';

const LISTS_STORAGE_KEY = 'task-timer-lists';
const ACTIVE_LIST_ID_KEY = 'task-timer-active-id';
const EXECUTION_STATE_KEY = 'task-timer-execution-state';

const getExecutionStateKey = (listId: string): string =>
  `${EXECUTION_STATE_KEY}-${listId}`;

export interface ExecutionState {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  lastTickTimestamp: number | null;
  listId: string;
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
    localStorage.setItem(getExecutionStateKey(state.listId), JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save execution state:', error);
  }
};

export const loadExecutionState = (listId: string): ExecutionState | null => {
  try {
    const stored = localStorage.getItem(getExecutionStateKey(listId));
    if (stored) {
      return JSON.parse(stored) as ExecutionState;
    }

    const legacyStored = localStorage.getItem(EXECUTION_STATE_KEY);
    if (!legacyStored) return null;

    const parsed = JSON.parse(legacyStored) as ExecutionState;
    if (parsed.listId === listId) {
      localStorage.setItem(getExecutionStateKey(listId), legacyStored);
      localStorage.removeItem(EXECUTION_STATE_KEY);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Failed to load execution state:', error);
    return null;
  }
};

export const clearExecutionState = (listId?: string): void => {
  if (listId) {
    localStorage.removeItem(getExecutionStateKey(listId));
    localStorage.removeItem(EXECUTION_STATE_KEY);
  } else {
    localStorage.removeItem(EXECUTION_STATE_KEY);
  }
};
