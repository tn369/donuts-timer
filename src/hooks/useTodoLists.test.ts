import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as storage from '../storage';
import { useTodoLists } from './useTodoLists';

vi.mock('../storage', async () => {
  const actual = await vi.importActual('../storage');
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
    vi.mocked(storage.loadTodoLists).mockReturnValue([
      {
        id: 'list-1',
        title: 'List 1',
        tasks: [],
        targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
      },
    ]);
  });

  it('should select single list when selectList is called', () => {
    const { result } = renderHook(() => useTodoLists());

    act(() => {
      result.current.selectList('list-1');
    });

    expect(result.current.activeLists.length).toBe(1);
    expect(result.current.activeLists[0].id).toBe('list-1');
    expect(storage.saveActiveListId).toHaveBeenCalledWith('list-1');
    expect(result.current.isSiblingMode).toBe(false);
  });

  it('should select two lists when selectSiblingLists is called', () => {
    vi.mocked(storage.loadTodoLists).mockReturnValue([
      {
        id: 'list-1',
        title: 'L1',
        tasks: [],
        targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
      },
      {
        id: 'list-2',
        title: 'L2',
        tasks: [],
        targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
      },
    ]);
    const { result } = renderHook(() => useTodoLists());

    act(() => {
      result.current.selectSiblingLists('list-1', 'list-2');
    });

    expect(result.current.activeLists.length).toBe(2);
    expect(result.current.activeLists[0].id).toBe('list-1');
    expect(result.current.activeLists[1].id).toBe('list-2');
    expect(result.current.isSiblingMode).toBe(true);
  });

  it('should add new list and save it when addNewList is called', () => {
    const { result } = renderHook(() => useTodoLists());
    let newList;
    act(() => {
      newList = result.current.addNewList();
    });

    expect(result.current.todoLists).toContainEqual(newList);
    expect(storage.saveTodoLists).toHaveBeenCalledWith(expect.arrayContaining([newList]));
  });

  it('should delete list and save when deleteList is called', () => {
    const { result } = renderHook(() => useTodoLists());
    act(() => {
      result.current.deleteList('list-1');
    });

    expect(result.current.todoLists.find((l) => l.id === 'list-1')).toBeUndefined();
    expect(storage.saveTodoLists).toHaveBeenCalled();
  });

  it('should copy list and save when copyList is called', () => {
    const { result } = renderHook(() => useTodoLists());
    act(() => {
      result.current.copyList('list-1');
    });

    expect(result.current.todoLists.length).toBe(2);
    expect(result.current.todoLists[1].title).toBe('List 1 (コピー)');
    expect(storage.saveTodoLists).toHaveBeenCalled();
  });

  it('should update list content when saveList is called', () => {
    const { result } = renderHook(() => useTodoLists());
    const updated = { ...result.current.todoLists[0], title: 'Updated Title' };

    act(() => {
      result.current.saveList(updated);
    });

    expect(result.current.todoLists[0].title).toBe('Updated Title');
    expect(storage.saveTodoLists).toHaveBeenCalled();
  });

  it('should clear selection when clearActiveList is called', () => {
    const { result } = renderHook(() => useTodoLists());
    act(() => {
      result.current.selectList('list-1');
      result.current.clearActiveList();
    });

    expect(result.current.activeLists).toEqual([]);
    expect(storage.saveActiveListId).toHaveBeenCalledWith(null);
  });

  it('should return unique icons from all lists when getAllUniqueIcons is called', () => {
    vi.mocked(storage.loadTodoLists).mockReturnValue([
      {
        id: 'list-1',
        title: 'L1',
        tasks: [
          {
            id: 't1',
            name: 'T1',
            icon: 'icon-a',
            plannedSeconds: 0,
            actualSeconds: 0,
            elapsedSeconds: 0,
            kind: 'todo',
            status: 'todo',
          },
        ],
        targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
      },
    ]);
    const { result } = renderHook(() => useTodoLists());

    const icons = result.current.getAllUniqueIcons();
    expect(icons).toContain('icon-a');
  });

  it('should copy execution state to both sides when duplicateActiveListForSiblingMode is called', () => {
    const { result } = renderHook(() => useTodoLists());
    act(() => {
      result.current.selectList('list-1');
    });

    const mockState = {
      listId: 'list-1',
      tasks: [],
      selectedTaskId: 't1',
      isTimerRunning: true,
      lastTickTimestamp: 100,
    };
    vi.mocked(storage.loadExecutionState).mockReturnValue(mockState);

    act(() => {
      result.current.duplicateActiveListForSiblingMode();
    });

    expect(result.current.isSiblingMode).toBe(true);
    expect(result.current.activeLists.length).toBe(2);
    expect(storage.saveExecutionState).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'sibling-0' })
    );
    expect(storage.saveExecutionState).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'sibling-1' })
    );
  });

  it('should exit sibling mode and copy state back to single when exitSiblingMode is called', () => {
    const { result } = renderHook(() => useTodoLists());

    act(() => {
      result.current.selectList('list-1');
    });
    act(() => {
      result.current.duplicateActiveListForSiblingMode();
    });

    const mockState = {
      listId: 'list-1',
      tasks: [],
      selectedTaskId: 't1',
      isTimerRunning: true,
      lastTickTimestamp: 100,
      mode: 'sibling-0' as const,
    };
    vi.mocked(storage.loadExecutionState).mockReturnValue(mockState);

    act(() => {
      result.current.exitSiblingMode();
    });

    expect(result.current.isSiblingMode).toBe(false);
    expect(result.current.activeLists.length).toBe(1);
    expect(storage.saveExecutionState).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'single', isAutoResume: true })
    );
  });

  it('should restore active list from storage on initialization', () => {
    vi.mocked(storage.loadActiveListId).mockReturnValue('list-1');
    const { result } = renderHook(() => useTodoLists());

    expect(result.current.activeLists.length).toBe(1);
    expect(result.current.activeLists[0].id).toBe('list-1');
  });

  it('should perform migration and save if loaded lists need it', () => {
    // Return a list that needs migration (e.g. icon is missing and migrateTodoList would fix it)
    const unmigrated = {
      id: 'l1',
      title: 'L1',
      tasks: [
        {
          id: 't1',
          name: 'トイレ',
          icon: '',
          plannedSeconds: 0,
          actualSeconds: 0,
          elapsedSeconds: 0,
          kind: 'todo' as const,
          status: 'todo' as const,
        },
      ],
      targetTimeSettings: { mode: 'duration' as const, targetHour: 0, targetMinute: 0 },
    };
    vi.mocked(storage.loadTodoLists).mockReturnValue([unmigrated]);

    renderHook(() => useTodoLists());

    expect(storage.saveTodoLists).toHaveBeenCalled();
  });

  it('should copy tasks correctly including reward tasks when copyList is called', () => {
    const listWithTasks = {
      id: 'l1',
      title: 'L1',
      tasks: [
        {
          id: 't1',
          name: 'T1',
          icon: 'i1',
          plannedSeconds: 10,
          actualSeconds: 0,
          elapsedSeconds: 0,
          kind: 'todo' as const,
          status: 'done' as const,
        },
        {
          id: 'reward-task',
          name: 'R1',
          icon: 'i2',
          plannedSeconds: 20,
          actualSeconds: 0,
          elapsedSeconds: 0,
          kind: 'reward' as const,
          status: 'done' as const,
        },
      ],
      targetTimeSettings: { mode: 'duration' as const, targetHour: 0, targetMinute: 0 },
    };
    vi.mocked(storage.loadTodoLists).mockReturnValue([listWithTasks]);
    const { result } = renderHook(() => useTodoLists());

    act(() => {
      result.current.copyList('l1');
    });

    const copied = result.current.todoLists[1];
    expect(copied.tasks[0].id).not.toBe('t1');
    expect(copied.tasks[0].status).toBe('todo');
    expect(copied.tasks[1].id).toBe('reward-task');
    expect(copied.tasks[1].status).toBe('todo');
  });
});
