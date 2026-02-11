import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TODO_LISTS } from '../constants';
import * as storage from '../storage';
import { useTodoListsData } from './useTodoListsData';

vi.mock('../storage', () => ({
  loadTodoLists: vi.fn(),
  saveTodoLists: vi.fn(),
}));

describe('useTodoListsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load lists from storage on init', () => {
    const mockLists = [{ id: 'l1', title: 'L1', tasks: [] }];
    vi.mocked(storage.loadTodoLists).mockReturnValue(mockLists);

    const { result } = renderHook(() => useTodoListsData());

    expect(result.current.todoLists).toEqual(mockLists);
    expect(storage.loadTodoLists).toHaveBeenCalledWith(DEFAULT_TODO_LISTS);
  });

  it('should add a new list', () => {
    vi.mocked(storage.loadTodoLists).mockReturnValue([]);
    const { result } = renderHook(() => useTodoListsData());

    act(() => {
      result.current.addNewList();
    });

    expect(result.current.todoLists.length).toBe(1);
    expect(storage.saveTodoLists).toHaveBeenCalled();
  });

  it('should delete a list', () => {
    const mockLists = [{ id: 'l1', title: 'L1', tasks: [] }];
    vi.mocked(storage.loadTodoLists).mockReturnValue(mockLists);
    const { result } = renderHook(() => useTodoListsData());

    act(() => {
      result.current.deleteList('l1');
    });

    expect(result.current.todoLists.length).toBe(0);
    expect(storage.saveTodoLists).toHaveBeenCalledWith([]);
  });

  it('should save a list (add if not exists)', () => {
    vi.mocked(storage.loadTodoLists).mockReturnValue([]);
    const { result } = renderHook(() => useTodoListsData());
    const newList = { id: 'new', title: 'New', tasks: [] };

    act(() => {
      result.current.saveList(newList);
    });

    expect(result.current.todoLists).toContainEqual(newList);
  });

  it('should save a list (update if exists)', () => {
    const mockLists = [{ id: 'l1', title: 'L1', tasks: [] }];
    vi.mocked(storage.loadTodoLists).mockReturnValue(mockLists);
    const { result } = renderHook(() => useTodoListsData());
    const updatedList = { id: 'l1', title: 'Updated', tasks: [] };

    act(() => {
      result.current.saveList(updatedList);
    });

    expect(result.current.todoLists[0].title).toBe('Updated');
  });

  it('should reorder lists', () => {
    const mockLists = [
      { id: 'l1', title: 'L1', tasks: [] },
      { id: 'l2', title: 'L2', tasks: [] },
    ];
    vi.mocked(storage.loadTodoLists).mockReturnValue(mockLists);
    const { result } = renderHook(() => useTodoListsData());

    const reordered = [mockLists[1], mockLists[0]];
    act(() => {
      result.current.reorderTodoLists(reordered);
    });

    expect(result.current.todoLists).toEqual(reordered);
    expect(storage.saveTodoLists).toHaveBeenCalledWith(reordered);
  });
});
