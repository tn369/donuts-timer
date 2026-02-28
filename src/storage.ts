/**
 * localStorageを使用したデータの保存と読み込みに関連するユーティリティ
 */
import type { Task, TodoList } from './types';

const LISTS_STORAGE_KEY = 'task-timer-lists';
const ACTIVE_LIST_ID_KEY = 'task-timer-active-id';
const EXECUTION_STATE_KEY = 'task-timer-execution-state';
const UI_SETTINGS_KEY = 'task-timer-ui-settings';

export interface UiSettings {
  simpleListView: boolean;
  countdownWarningEnabled: boolean;
}

/**
 * タイマーの表示モード
 */
export type TimerMode = 'single' | 'sibling-0' | 'sibling-1';

/**
 * 実行状態を保存するためのキーを取得する
 * @param listId リストID
 * @param mode タイマーモード
 * @returns localStorageのキー
 */
const getExecutionStateKey = (listId: string, mode: TimerMode): string =>
  `${EXECUTION_STATE_KEY}-${mode}-${listId}`;

/**
 * 実行状態の型定義
 */
export interface ExecutionState {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  lastTickTimestamp: number | null;
  listId: string;
  mode?: TimerMode;
  isAutoResume?: boolean;
}

/**
 * 古いデータ構造から新しいデータ構造への移行
 * グローバルのtargetTimeSettingsをごほうびタスクのrewardSettingsに移行する
 * タイトルから「のやることリスト」サフィックスを除去する
 * @param list 移行対象のリスト
 * @returns 移行後のリスト
 */
const migrateTodoList = (list: TodoList): TodoList => {
  const TITLE_SUFFIX = 'のやることリスト';

  // タイトルからサフィックスを除去
  const migratedTitle = list.title.endsWith(TITLE_SUFFIX)
    ? list.title.slice(0, -TITLE_SUFFIX.length)
    : list.title;

  // targetTimeSettingsが存在し、rewardタスクが設定を持っていない場合
  if (list.targetTimeSettings) {
    const migratedTasks = list.tasks.map((task) => {
      if (task.kind === 'reward' && !task.rewardSettings) {
        return {
          ...task,
          rewardSettings: {
            mode: list.targetTimeSettings?.mode ?? 'duration',
            targetHour: list.targetTimeSettings?.targetHour ?? 9,
            targetMinute: list.targetTimeSettings?.targetMinute ?? 0,
          },
        };
      }
      return task;
    });

    return {
      ...list,
      title: migratedTitle,
      tasks: migratedTasks,
      // targetTimeSettingsは保持(後方互換性のため)
    };
  }

  return {
    ...list,
    title: migratedTitle,
  };
};

/**
 * localStorageからすべてのやることリストを読み込み
 * @param fallbackLists 読み込み失敗時のデフォルト値
 * @returns 読み込まれたリストの配列
 */
export const loadTodoLists = (fallbackLists: TodoList[] = []): TodoList[] => {
  try {
    const stored = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!stored) {
      return fallbackLists;
    }

    const parsed = JSON.parse(stored) as TodoList[];
    return parsed.map(migrateTodoList); // マイグレーション適用
  } catch (error) {
    console.error('Failed to load todo lists:', error);
    return fallbackLists;
  }
};

/**
 * localStorageにすべてのやることリストを保存
 * @param lists リスト一覧
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
 * @returns リストIDまたはnull
 */
export const loadActiveListId = (): string | null => {
  return localStorage.getItem(ACTIVE_LIST_ID_KEY);
};

/**
 * 現在選択されているリストIDを保存
 * @param id リストID（消去する場合はnull）
 */
export const saveActiveListId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(ACTIVE_LIST_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_LIST_ID_KEY);
  }
};

/**
 * 実行状態を保存する
 * @param state 実行状態オブジェクト
 */
export const saveExecutionState = (state: ExecutionState): void => {
  try {
    const mode = state.mode ?? 'single';
    localStorage.setItem(getExecutionStateKey(state.listId, mode), JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save execution state:', error);
  }
};

/**
 * 実行状態を読み込む
 * @param listId リストID
 * @param mode タイマーモード
 * @returns 実行状態またはnull
 */
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

/**
 * 実行状態を消去する
 * @param listId リストID（任意）
 * @param mode タイマーモード（任意）
 */
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

/**
 * UI設定を読み込む
 * @returns UI設定
 */
export const loadUiSettings = (): UiSettings => {
  try {
    const stored = localStorage.getItem(UI_SETTINGS_KEY);
    if (!stored) {
      return { simpleListView: false, countdownWarningEnabled: true };
    }

    const parsed = JSON.parse(stored) as Partial<UiSettings>;
    return {
      simpleListView: parsed.simpleListView ?? false,
      countdownWarningEnabled: parsed.countdownWarningEnabled ?? true,
    };
  } catch (error) {
    console.error('Failed to load ui settings:', error);
    return { simpleListView: false, countdownWarningEnabled: true };
  }
};

/**
 * UI設定を保存する
 * @param settings UI設定
 */
export const saveUiSettings = (settings: UiSettings): void => {
  try {
    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save ui settings:', error);
  }
};
