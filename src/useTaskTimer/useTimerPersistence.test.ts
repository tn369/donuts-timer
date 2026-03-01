import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as storage from '../storage';
import type { Task, TodoList } from '../types';
import type { Action, State } from './types';
import { useTimerPersistence } from './useTimerPersistence';

vi.mock('../storage', async () => {
  const actual = await vi.importActual('../storage');
  return {
    ...actual,
    loadExecutionState: vi.fn(),
    saveExecutionState: vi.fn(),
    clearExecutionState: vi.fn(),
  };
});

const baseTask: Task = {
  id: 'task-1',
  name: 'Task 1',
  icon: '',
  plannedSeconds: 300,
  kind: 'todo',
  status: 'todo',
  elapsedSeconds: 0,
  actualSeconds: 0,
};

const baseList: TodoList = {
  id: 'list-1',
  title: 'List',
  tasks: [baseTask],
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
  timerSettings: { shape: 'circle', color: 'blue' },
};

const makeState = (partial: Partial<State> = {}): State => ({
  tasks: [],
  selectedTaskId: null,
  isTimerRunning: false,
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
  activeList: baseList,
  timerSettings: { shape: 'circle', color: 'blue' },
  lastTickTimestamp: null,
  pendingRestorableState: null,
  rewardGainNotice: null,
  ...partial,
});

describe('useTimerPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.loadExecutionState).mockReturnValue(null);
  });

  it('does nothing when active list is not available', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    const state = makeState({ activeList: null });

    renderHook(() => {
      useTimerPersistence(state, dispatch, 'single');
    });

    expect(storage.loadExecutionState).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('clears persisted state when restored tasks have no progress', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    vi.mocked(storage.loadExecutionState).mockReturnValue({
      listId: 'list-1',
      tasks: [{ ...baseTask }],
      selectedTaskId: null,
      isTimerRunning: false,
      lastTickTimestamp: null,
      mode: 'single',
    });
    const state = makeState();

    renderHook(() => {
      useTimerPersistence(state, dispatch, 'single');
    });

    expect(storage.clearExecutionState).toHaveBeenCalledWith('list-1', 'single');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches AUTO_RESTORE when persisted state is marked auto-resume', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    vi.mocked(storage.loadExecutionState).mockReturnValue({
      listId: 'list-1',
      tasks: [{ ...baseTask, status: 'running', elapsedSeconds: 12 }],
      selectedTaskId: 'task-1',
      isTimerRunning: true,
      lastTickTimestamp: 12000,
      mode: 'single',
      isAutoResume: true,
    });
    const state = makeState();

    renderHook(() => {
      useTimerPersistence(state, dispatch, 'single');
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'AUTO_RESTORE',
      tasks: [{ ...baseTask, status: 'running', elapsedSeconds: 12 }],
      selectedTaskId: 'task-1',
      isTimerRunning: true,
      lastTickTimestamp: 12000,
    });
  });

  it('dispatches RESTORE_AVAILABLE when persisted state requires confirmation', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    vi.mocked(storage.loadExecutionState).mockReturnValue({
      listId: 'list-1',
      tasks: [{ ...baseTask, status: 'paused', elapsedSeconds: 5 }],
      selectedTaskId: 'task-1',
      isTimerRunning: false,
      lastTickTimestamp: null,
      mode: 'single',
      isAutoResume: false,
    });
    const state = makeState();

    renderHook(() => {
      useTimerPersistence(state, dispatch, 'single');
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'RESTORE_AVAILABLE',
      tasks: [{ ...baseTask, status: 'paused', elapsedSeconds: 5 }],
      selectedTaskId: 'task-1',
      isTimerRunning: false,
      lastTickTimestamp: null,
    });
  });

  it('saves execution state when tasks are available', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    const state = makeState({
      tasks: [{ ...baseTask, status: 'running', elapsedSeconds: 3 }],
      selectedTaskId: 'task-1',
      isTimerRunning: true,
      lastTickTimestamp: 3000,
    });

    renderHook(() => {
      useTimerPersistence(state, dispatch, 'sibling-0');
    });

    expect(storage.saveExecutionState).toHaveBeenCalledWith({
      tasks: [{ ...baseTask, status: 'running', elapsedSeconds: 3 }],
      selectedTaskId: 'task-1',
      isTimerRunning: true,
      lastTickTimestamp: 3000,
      listId: 'list-1',
      mode: 'sibling-0',
    });
  });

  it('does not save execution state when task list is empty', () => {
    const dispatch = vi.fn<(action: Action) => void>();
    const state = makeState({ tasks: [] });

    renderHook(() => {
      useTimerPersistence(state, dispatch, 'single');
    });

    expect(storage.saveExecutionState).not.toHaveBeenCalled();
  });
});
