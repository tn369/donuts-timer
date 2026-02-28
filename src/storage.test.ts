import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearExecutionState,
  loadActiveListId,
  loadExecutionState,
  loadTodoLists,
  loadUiSettings,
  saveActiveListId,
  saveExecutionState,
  saveTodoLists,
  saveUiSettings,
} from './storage';
import type { TodoList } from './types';

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('loadTodoLists', () => {
    it('should return fallbackLists when localStorage is empty', () => {
      const fallback: TodoList[] = [
        {
          id: '1',
          title: 'Test',
          tasks: [],
          targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
        },
      ];
      const result = loadTodoLists(fallback);
      expect(result).toEqual(fallback);
    });

    it('should return stored lists when they exist in localStorage', () => {
      const stored: TodoList[] = [
        {
          id: 'stored',
          title: 'Stored',
          tasks: [],
          targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
        },
      ];
      localStorage.setItem('task-timer-lists', JSON.stringify(stored));
      const result = loadTodoLists();
      expect(result).toEqual(stored);
    });

    it('should return fallbackLists and log error when JSON is invalid', () => {
      localStorage.setItem('task-timer-lists', 'invalid-json');
      const spy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
      const fallback: TodoList[] = [];
      const result = loadTodoLists(fallback);
      expect(result).toEqual(fallback);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('saveTodoLists', () => {
    it('should save lists to localStorage', () => {
      const lists: TodoList[] = [
        {
          id: '1',
          title: 'Test',
          tasks: [],
          targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
        },
      ];
      saveTodoLists(lists);
      expect(localStorage.getItem('task-timer-lists')).toBe(JSON.stringify(lists));
    });

    it('should log error when save fails', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
      const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      saveTodoLists([]);
      expect(spy).toHaveBeenCalled();

      mockSetItem.mockRestore();
      spy.mockRestore();
    });
  });

  describe('loadActiveListId / saveActiveListId', () => {
    it('should return null when no active list id is stored', () => {
      // 保存されているリストIDがない場合はnullを返すこと
      expect(loadActiveListId()).toBeNull();
    });

    it('should correctly save and load the active list id', () => {
      // リストIDを正しく保存し、読み込めること
      saveActiveListId('list-123');
      expect(loadActiveListId()).toBe('list-123');
    });

    it('should remove the active list id from storage when saving null', () => {
      // nullを保存したときに、保存されているIDを削除すること
      saveActiveListId('list-123');
      saveActiveListId(null);
      expect(loadActiveListId()).toBeNull();
    });
  });

  describe('saveExecutionState', () => {
    it('should save execution state with default single mode', () => {
      const state = {
        tasks: [],
        selectedTaskId: null,
        isTimerRunning: false,
        lastTickTimestamp: null,
        listId: 'list-1',
      };
      saveExecutionState(state);
      const stored: unknown = JSON.parse(
        localStorage.getItem('task-timer-execution-state-single-list-1') ?? '{}'
      );
      expect(stored).toEqual(state);
    });

    it('should save execution state with explicit mode', () => {
      const state = {
        tasks: [],
        selectedTaskId: null,
        isTimerRunning: false,
        lastTickTimestamp: null,
        listId: 'list-1',
        mode: 'sibling-0' as const,
      };
      saveExecutionState(state);
      const stored: unknown = JSON.parse(
        localStorage.getItem('task-timer-execution-state-sibling-0-list-1') ?? '{}'
      );
      expect(stored).toEqual(state);
    });

    it('should log error when save fails', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
      const mockSetItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      saveExecutionState({
        listId: '1',
        tasks: [],
        selectedTaskId: null,
        isTimerRunning: false,
        lastTickTimestamp: null,
      });
      expect(spy).toHaveBeenCalledWith('Failed to save execution state:', expect.any(Error));

      mockSetItem.mockRestore();
      spy.mockRestore();
    });
  });

  describe('loadExecutionState', () => {
    it('should return null when no state exists', () => {
      expect(loadExecutionState('list-1', 'single')).toBeNull();
    });

    it('should load state with matching mode and listId', () => {
      const state = {
        listId: 'list-1',
        tasks: [],
        selectedTaskId: null,
        isTimerRunning: false,
        lastTickTimestamp: null,
      };
      localStorage.setItem('task-timer-execution-state-single-list-1', JSON.stringify(state));
      expect(loadExecutionState('list-1', 'single')).toEqual(state);
    });

    it('should migrate from per-list legacy key for single mode', () => {
      const legacyState = {
        listId: 'list-1',
        tasks: [],
        selectedTaskId: 'task-1',
        isTimerRunning: true,
        lastTickTimestamp: 100,
      };
      localStorage.setItem('task-timer-execution-state-list-1', JSON.stringify(legacyState));

      const result = loadExecutionState('list-1', 'single');
      expect(result).toEqual(legacyState);
      expect(localStorage.getItem('task-timer-execution-state-single-list-1')).toBe(
        JSON.stringify(legacyState)
      );
      expect(localStorage.getItem('task-timer-execution-state-list-1')).toBeNull();
    });

    it('should migrate from global legacy key for single mode', () => {
      const legacyState = {
        listId: 'list-1',
        tasks: [],
        selectedTaskId: 'task-1',
        isTimerRunning: true,
        lastTickTimestamp: 100,
      };
      localStorage.setItem('task-timer-execution-state', JSON.stringify(legacyState));

      const result = loadExecutionState('list-1', 'single');
      expect(result).toEqual(legacyState);
      expect(localStorage.getItem('task-timer-execution-state-single-list-1')).toBe(
        JSON.stringify(legacyState)
      );
      expect(localStorage.getItem('task-timer-execution-state')).toBeNull();
    });

    it('should return null if global legacy key listId mismatch', () => {
      const legacyState = {
        listId: 'list-other',
        tasks: [],
        selectedTaskId: 'task-1',
        isTimerRunning: true,
        lastTickTimestamp: 100,
      };
      localStorage.setItem('task-timer-execution-state', JSON.stringify(legacyState));

      expect(loadExecutionState('list-1', 'single')).toBeNull();
      expect(localStorage.getItem('task-timer-execution-state')).toBe(JSON.stringify(legacyState));
    });

    it('should log error and return null when JSON is invalid', () => {
      localStorage.setItem('task-timer-execution-state-single-list-1', 'invalid-json');
      const spy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

      const result = loadExecutionState('list-1', 'single');
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe('clearExecutionState', () => {
    it('should clear specific state when listId and mode provided', () => {
      localStorage.setItem('task-timer-execution-state-single-list-1', '{}');
      clearExecutionState('list-1', 'single');
      expect(localStorage.getItem('task-timer-execution-state-single-list-1')).toBeNull();
    });

    it('should clear all modes for a list when only listId provided', () => {
      localStorage.setItem('task-timer-execution-state-single-list-1', '{}');
      localStorage.setItem('task-timer-execution-state-sibling-0-list-1', '{}');
      localStorage.setItem('task-timer-execution-state-list-1', '{}');

      clearExecutionState('list-1');

      expect(localStorage.getItem('task-timer-execution-state-single-list-1')).toBeNull();
      expect(localStorage.getItem('task-timer-execution-state-sibling-0-list-1')).toBeNull();
      expect(localStorage.getItem('task-timer-execution-state-list-1')).toBeNull();
    });

    it('should always clear global legacy key', () => {
      localStorage.setItem('task-timer-execution-state', '{}');
      clearExecutionState();
      expect(localStorage.getItem('task-timer-execution-state')).toBeNull();
    });
  });

  describe('loadUiSettings / saveUiSettings', () => {
    it('should return default settings when not stored', () => {
      expect(loadUiSettings()).toEqual({ simpleListView: false });
    });

    it('should save and load ui settings', () => {
      saveUiSettings({ simpleListView: true });
      expect(loadUiSettings()).toEqual({ simpleListView: true });
    });

    it('should return defaults and log error when JSON is invalid', () => {
      localStorage.setItem('task-timer-ui-settings', 'invalid-json');
      const spy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

      expect(loadUiSettings()).toEqual({ simpleListView: false });
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
