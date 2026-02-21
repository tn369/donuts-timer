import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Task } from '../types';
import { useTaskEffects } from './useTaskEffects';

const {
  confettiMock,
  playCelebrationSoundMock,
  playGentleAlarmMock,
  playTaskCompletionSoundMock,
  playTaskIncompleteSoundMock,
} = vi.hoisted(() => ({
  confettiMock: vi.fn(),
  playCelebrationSoundMock: vi.fn(),
  playGentleAlarmMock: vi.fn(),
  playTaskCompletionSoundMock: vi.fn(),
  playTaskIncompleteSoundMock: vi.fn(),
}));

vi.mock('canvas-confetti', () => ({
  default: confettiMock,
}));

vi.mock('../utils/audio', () => ({
  playCelebrationSound: playCelebrationSoundMock,
  playGentleAlarm: playGentleAlarmMock,
  playTaskCompletionSound: playTaskCompletionSoundMock,
  playTaskIncompleteSound: playTaskIncompleteSoundMock,
}));

const makeTodoTask = (id: string, status: Task['status'] = 'todo'): Task => ({
  id,
  name: `Task ${id}`,
  icon: 'icon',
  plannedSeconds: 60,
  kind: 'todo',
  status,
  elapsedSeconds: 0,
  actualSeconds: 0,
});

const makeRewardTask = (id: string, status: Task['status'] = 'todo'): Task => ({
  ...makeTodoTask(id, status),
  kind: 'reward',
});

describe('useTaskEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should play completion sound when normal task becomes done', () => {
    const { rerender } = renderHook(
      ({ tasks }) => {
        useTaskEffects(tasks);
      },
      {
        initialProps: {
          tasks: [makeTodoTask('1'), makeTodoTask('2')],
        },
      }
    );

    rerender({
      tasks: [makeTodoTask('1', 'done'), makeTodoTask('2')],
    });

    expect(playTaskCompletionSoundMock).toHaveBeenCalledTimes(1);
    expect(playCelebrationSoundMock).not.toHaveBeenCalled();
  });

  it('should trigger celebration when all todo tasks become done', () => {
    const { rerender } = renderHook(
      ({ tasks }) => {
        useTaskEffects(tasks);
      },
      {
        initialProps: {
          tasks: [makeTodoTask('1'), makeTodoTask('2')],
        },
      }
    );

    rerender({
      tasks: [makeTodoTask('1', 'done'), makeTodoTask('2', 'done')],
    });

    expect(playCelebrationSoundMock).toHaveBeenCalledTimes(1);
    expect(confettiMock).toHaveBeenCalledTimes(1);
    expect(playTaskCompletionSoundMock).not.toHaveBeenCalled();
  });

  it('should play gentle alarm when reward task becomes done', () => {
    const { rerender } = renderHook(
      ({ tasks }) => {
        useTaskEffects(tasks);
      },
      {
        initialProps: {
          tasks: [makeRewardTask('reward-1')],
        },
      }
    );

    rerender({
      tasks: [makeRewardTask('reward-1', 'done')],
    });

    expect(playGentleAlarmMock).toHaveBeenCalledTimes(1);
    expect(playCelebrationSoundMock).not.toHaveBeenCalled();
  });

  it('should play incomplete sound when completed task returns to todo', () => {
    const { rerender } = renderHook(
      ({ tasks }) => {
        useTaskEffects(tasks);
      },
      {
        initialProps: {
          tasks: [makeTodoTask('1', 'done')],
        },
      }
    );

    rerender({
      tasks: [makeTodoTask('1', 'todo')],
    });

    expect(playTaskIncompleteSoundMock).toHaveBeenCalledTimes(1);
  });
});
