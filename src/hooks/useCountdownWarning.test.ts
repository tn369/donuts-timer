import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Task } from '../types';
import { useCountdownWarning } from './useCountdownWarning';

const playCountdownWarningSoundMock = vi.fn();

vi.mock('../utils/audio', () => ({
  playCountdownWarningSound: () => {
    playCountdownWarningSoundMock();
  },
}));

const createRunningTodoTask = (elapsedSeconds: number): Task => ({
  id: 'todo-1',
  name: 'はみがき',
  icon: '',
  plannedSeconds: 400,
  elapsedSeconds,
  actualSeconds: 0,
  kind: 'todo',
  status: 'running',
});

const createRunningRewardTask = (elapsedSeconds: number): Task => ({
  ...createRunningTodoTask(elapsedSeconds),
  id: 'reward-1',
  kind: 'reward',
});

describe('useCountdownWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playCountdownWarningSoundMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('残り3分を跨いだときに1回だけ予告を表示する', () => {
    const { result, rerender } = renderHook(
      ({
        tasks,
        selectedTaskId,
        isTimerRunning,
        enabled,
      }: {
        tasks: Task[];
        selectedTaskId: string | null;
        isTimerRunning: boolean;
        enabled: boolean;
      }) => useCountdownWarning(tasks, selectedTaskId, isTimerRunning, enabled),
      {
        initialProps: {
          tasks: [createRunningTodoTask(219)],
          selectedTaskId: 'todo-1',
          isTimerRunning: true,
          enabled: true,
        },
      }
    );

    expect(result.current).toBeNull();

    rerender({
      tasks: [createRunningTodoTask(220)],
      selectedTaskId: 'todo-1',
      isTimerRunning: true,
      enabled: true,
    });

    expect(result.current).toBe('あと 3ふん');
    expect(playCountdownWarningSoundMock).toHaveBeenCalledTimes(1);

    rerender({
      tasks: [createRunningTodoTask(221)],
      selectedTaskId: 'todo-1',
      isTimerRunning: true,
      enabled: true,
    });

    expect(playCountdownWarningSoundMock).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current).toBeNull();
  });

  it('残り1分を跨いだときに予告を表示する', () => {
    const { result, rerender } = renderHook(
      ({ tasks }: { tasks: Task[] }) => useCountdownWarning(tasks, 'todo-1', true, true),
      {
        initialProps: {
          tasks: [createRunningTodoTask(339)],
        },
      }
    );

    expect(result.current).toBeNull();

    rerender({ tasks: [createRunningTodoTask(340)] });

    expect(result.current).toBe('あと 1ぷん');
    expect(playCountdownWarningSoundMock).toHaveBeenCalledTimes(1);
  });

  it('ごほうびタスクでは予告しない', () => {
    const { result, rerender } = renderHook(
      ({ tasks }: { tasks: Task[] }) => useCountdownWarning(tasks, 'reward-1', true, true),
      {
        initialProps: {
          tasks: [createRunningRewardTask(219)],
        },
      }
    );

    rerender({ tasks: [createRunningRewardTask(220)] });

    expect(result.current).toBeNull();
    expect(playCountdownWarningSoundMock).not.toHaveBeenCalled();
  });

  it('無効化されている場合は予告しない', () => {
    const { result, rerender } = renderHook(
      ({ tasks }: { tasks: Task[] }) => useCountdownWarning(tasks, 'todo-1', true, false),
      {
        initialProps: {
          tasks: [createRunningTodoTask(219)],
        },
      }
    );

    rerender({ tasks: [createRunningTodoTask(220)] });

    expect(result.current).toBeNull();
    expect(playCountdownWarningSoundMock).not.toHaveBeenCalled();
  });

  it('同一tickで3分と1分を跨いだ場合は1分予告を優先する', () => {
    const { result, rerender } = renderHook(
      ({ tasks }: { tasks: Task[] }) => useCountdownWarning(tasks, 'todo-1', true, true),
      {
        initialProps: {
          tasks: [createRunningTodoTask(218)],
        },
      }
    );

    rerender({ tasks: [createRunningTodoTask(342)] });

    expect(result.current).toBe('あと 1ぷん');
    expect(playCountdownWarningSoundMock).toHaveBeenCalledTimes(1);
  });

  it('タスク切り替え後は同じ閾値で再度予告できる', () => {
    const task2: Task = {
      id: 'todo-2',
      name: 'おきがえ',
      icon: '',
      plannedSeconds: 400,
      elapsedSeconds: 0,
      actualSeconds: 0,
      kind: 'todo',
      status: 'running',
    };

    const { rerender } = renderHook(
      ({ tasks, selectedTaskId }: { tasks: Task[]; selectedTaskId: string | null }) =>
        useCountdownWarning(tasks, selectedTaskId, true, true),
      {
        initialProps: {
          tasks: [createRunningTodoTask(219), task2],
          selectedTaskId: 'todo-1',
        },
      }
    );

    rerender({
      tasks: [createRunningTodoTask(220), task2],
      selectedTaskId: 'todo-1',
    });
    expect(playCountdownWarningSoundMock).toHaveBeenCalledTimes(1);

    rerender({
      tasks: [createRunningTodoTask(220), { ...task2, elapsedSeconds: 50 }],
      selectedTaskId: 'todo-2',
    });

    rerender({
      tasks: [createRunningTodoTask(219), { ...task2, elapsedSeconds: 50 }],
      selectedTaskId: 'todo-1',
    });
    rerender({
      tasks: [createRunningTodoTask(220), { ...task2, elapsedSeconds: 50 }],
      selectedTaskId: 'todo-1',
    });

    expect(playCountdownWarningSoundMock).toHaveBeenCalledTimes(2);
  });
});
