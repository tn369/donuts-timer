import { describe, expect, it } from 'vitest';

import type { Task } from '../types';
import {
  calculateOverallProgress,
  calculateRewardSeconds,
  calculateRewardSecondsFromTargetTime,
} from './task';

const createTask = (overrides: Partial<Task>): Task => ({
  id: 'task',
  name: 'Task',
  icon: '',
  plannedSeconds: 300,
  kind: 'todo',
  status: 'todo',
  elapsedSeconds: 0,
  actualSeconds: 0,
  ...overrides,
});

describe('calculateRewardSeconds', () => {
  it('adds saved time and subtracts overruns for todo tasks', () => {
    const tasks: Task[] = [
      createTask({ id: 'done', status: 'done', plannedSeconds: 300, actualSeconds: 240 }),
      createTask({
        id: 'over',
        status: 'running',
        plannedSeconds: 300,
        elapsedSeconds: 400,
      }),
      createTask({ id: 'reward', kind: 'reward', status: 'todo', plannedSeconds: 600 }),
    ];

    expect(calculateRewardSeconds(tasks, 600)).toBe(560);
  });

  it('never returns less than zero', () => {
    const tasks: Task[] = [
      createTask({
        id: 'over',
        status: 'running',
        plannedSeconds: 100,
        elapsedSeconds: 250,
      }),
    ];

    expect(calculateRewardSeconds(tasks, 50)).toBe(0);
  });
});

describe('calculateOverallProgress', () => {
  it('calculates progress using actual and elapsed seconds', () => {
    const tasks: Task[] = [
      createTask({ id: 'done', status: 'done', plannedSeconds: 300, actualSeconds: 200 }),
      createTask({ id: 'running', status: 'running', plannedSeconds: 200, elapsedSeconds: 50 }),
      createTask({ id: 'paused', status: 'paused', plannedSeconds: 100, elapsedSeconds: 100 }),
    ];

    expect(calculateOverallProgress(tasks)).toBeCloseTo((350 / 600) * 100, 5);
  });

  it('returns 0 when there is no planned time', () => {
    expect(calculateOverallProgress([])).toBe(0);
  });
});

describe('calculateRewardSecondsFromTargetTime', () => {
  it('subtracts todo time from available seconds before target time', () => {
    const current = new Date(2024, 0, 1, 10, 0, 0);
    expect(calculateRewardSecondsFromTargetTime(11, 0, current, 600)).toBe(3000);
  });

  it('treats earlier target time as next day', () => {
    const current = new Date(2024, 0, 1, 10, 0, 0);
    expect(calculateRewardSecondsFromTargetTime(9, 0, current, 3600)).toBe(79200);
  });
});
