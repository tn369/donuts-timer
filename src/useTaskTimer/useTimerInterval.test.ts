import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { State } from './types';
import { useTimerInterval } from './useTimerInterval';

const baseState: State = {
  tasks: [],
  selectedTaskId: null,
  isTimerRunning: false,
  targetTimeSettings: { mode: 'duration', targetHour: 0, targetMinute: 0 },
  activeList: null,
  timerSettings: { shape: 'circle', color: 'blue' },
  lastTickTimestamp: null,
  pendingRestorableState: null,
  rewardGainNotice: null,
};

describe('useTimerInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should dispatch TICK every second while running with selected task', () => {
    const dispatch = vi.fn();
    const state: State = {
      ...baseState,
      isTimerRunning: true,
      selectedTaskId: 'task-1',
    };

    renderHook(() => {
      useTimerInterval(state, dispatch);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'TICK',
      now: Date.parse('2026-01-01T00:00:01.000Z'),
    });
  });

  it('should dispatch REFRESH_REWARD_TIME in target-time mode when timer is stopped', () => {
    const dispatch = vi.fn();
    const state: State = {
      ...baseState,
      tasks: [
        {
          id: 'reward-1',
          name: 'Reward',
          icon: '',
          plannedSeconds: 600,
          kind: 'reward',
          status: 'todo',
          elapsedSeconds: 0,
          actualSeconds: 0,
          rewardSettings: { mode: 'target-time', targetHour: 7, targetMinute: 30 },
        },
      ],
    };

    renderHook(() => {
      useTimerInterval(state, dispatch);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(dispatch).toHaveBeenCalledWith({ type: 'REFRESH_REWARD_TIME' });
  });

  it('should dispatch TICK on visibilitychange when page becomes visible', () => {
    const dispatch = vi.fn();
    const state: State = {
      ...baseState,
      isTimerRunning: true,
      selectedTaskId: 'task-1',
    };
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });

    renderHook(() => {
      useTimerInterval(state, dispatch);
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'TICK',
      now: Date.parse('2026-01-01T00:00:00.000Z'),
    });
  });

  it('should stop dispatching after unmount', () => {
    const dispatch = vi.fn();
    const state: State = {
      ...baseState,
      isTimerRunning: true,
      selectedTaskId: 'task-1',
    };

    const { unmount } = renderHook(() => {
      useTimerInterval(state, dispatch);
    });
    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
