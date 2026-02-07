import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useTodoLists } from './useTodoLists';
import * as storage from '../storage';

vi.mock('../storage', async () => {
  const actual = (await vi.importActual('../storage')) as any;
  return {
    ...actual,
    loadTodoLists: vi.fn(() => []),
    saveTodoLists: vi.fn(),
    loadActiveListId: vi.fn(() => null),
    saveActiveListId: vi.fn(),
    loadExecutionState: vi.fn(),
    saveExecutionState: vi.fn(),
    clearExecutionState: vi.fn(),
  };
});

describe('useTodoLists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (storage.loadTodoLists as any).mockReturnValue([
      { id: 'list-1', title: 'List 1', tasks: [], targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 } }
    ]);
  });

  it('exitSiblingMode: 2人モードから1人モードに戻り、状態がコピーされること', () => {
    const { result } = renderHook(() => useTodoLists());

    // 初期状態：1人モードにする
    act(() => {
      result.current.selectList('list-1');
    });

    // 2人モードに切り替える（既存機能）
    act(() => {
      result.current.duplicateActiveListForSiblingMode();
    });

    expect(result.current.isSiblingMode).toBe(true);
    expect(result.current.activeLists.length).toBe(2);

    // mock storage state for sibling-0
    const mockState = { tasks: [], selectedTaskId: 'task-1', isTimerRunning: true, lastTickTimestamp: 123, listId: 'list-1', mode: 'sibling-0' };
    (storage.loadExecutionState as any).mockReturnValue(mockState);

    // ひとりモードに戻す（未実装：Red）
    act(() => {
      // @ts-ignore
      result.current.exitSiblingMode();
    });

    expect(result.current.isSiblingMode).toBe(false);
    expect(result.current.activeLists.length).toBe(1);
    
    // 状態が single モードへコピーされていることを確認
    expect(storage.saveExecutionState).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'single',
      selectedTaskId: 'task-1'
    }));
  });
});
