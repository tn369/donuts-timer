import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as storage from '../storage';
import { useAppScreen } from './useAppScreen';

vi.mock('../storage', async () => {
  const actual = await vi.importActual('../storage');
  return {
    ...actual,
    loadTodoLists: vi.fn(),
    loadActiveListId: vi.fn(),
    saveActiveListId: vi.fn(),
  };
});

describe('useAppScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.loadTodoLists).mockReturnValue([{ id: 'list-1', title: 'A', tasks: [] }]);
    vi.mocked(storage.loadActiveListId).mockReturnValue(null);
  });

  it('should start at main when active list exists', () => {
    vi.mocked(storage.loadActiveListId).mockReturnValue('list-1');

    const { result } = renderHook(() => useAppScreen());

    expect(result.current.currentScreen).toBe('main');
  });

  it('should start at selection when active list is missing', () => {
    vi.mocked(storage.loadActiveListId).mockReturnValue('unknown-list');

    const { result } = renderHook(() => useAppScreen());

    expect(result.current.currentScreen).toBe('selection');
  });

  it('should open settings and return to source screen', () => {
    const { result } = renderHook(() => useAppScreen());

    act(() => {
      result.current.showSettings('list-1', 'main');
    });

    expect(result.current.currentScreen).toBe('settings');
    expect(result.current.editingListId).toBe('list-1');
    expect(result.current.settingsSource).toBe('main');

    act(() => {
      result.current.backFromSettings();
    });

    expect(result.current.currentScreen).toBe('main');
    expect(result.current.editingListId).toBeNull();
  });

  it('should clear active list id when returning to selection', () => {
    const { result } = renderHook(() => useAppScreen());

    act(() => {
      result.current.showSettings('list-1', 'selection');
      result.current.backToSelection();
    });

    expect(result.current.currentScreen).toBe('selection');
    expect(result.current.editingListId).toBeNull();
    expect(storage.saveActiveListId).toHaveBeenCalledWith(null);
  });
});
