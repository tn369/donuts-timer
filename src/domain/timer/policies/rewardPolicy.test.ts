import { describe, expect, it } from 'vitest';

import type { Task, TodoList } from '../../../types';
import { getBaseRewardSeconds, updateRewardTime } from './rewardPolicy';

const makeTodoTask = (partial: Partial<Task> = {}): Task => ({
  id: partial.id ?? 'todo-1',
  name: partial.name ?? 'todo',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 600,
  kind: 'todo',
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
});

const makeRewardTask = (partial: Partial<Task> = {}): Task => ({
  id: partial.id ?? 'reward-1',
  name: partial.name ?? 'reward',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 900,
  kind: 'reward',
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
  rewardSettings: partial.rewardSettings,
});

describe('rewardPolicy', () => {
  it('should return fallback reward seconds when list is null', () => {
    expect(getBaseRewardSeconds(null)).toBe(900);
  });

  it('should return reward planned seconds from list', () => {
    const list: TodoList = {
      id: 'list-1',
      title: 'list',
      tasks: [makeTodoTask(), makeRewardTask({ plannedSeconds: 1200 })],
    };

    expect(getBaseRewardSeconds(list)).toBe(1200);
  });

  it('should recalculate reward time in duration mode', () => {
    const tasks = [
      makeTodoTask({ status: 'done', plannedSeconds: 600, actualSeconds: 500 }),
      makeRewardTask({ plannedSeconds: 900 }),
    ];

    const updated = updateRewardTime(tasks, 900);
    const reward = updated.find((task) => task.kind === 'reward');

    expect(reward?.plannedSeconds).toBe(1000);
  });

  it('should recalculate reward time in target-time mode and include elapsed reward time', () => {
    const tasks = [
      makeTodoTask({ id: 'todo-1', status: 'todo', plannedSeconds: 600 }),
      makeTodoTask({ id: 'todo-2', status: 'running', plannedSeconds: 1200, elapsedSeconds: 300 }),
      makeRewardTask({
        elapsedSeconds: 120,
        rewardSettings: { mode: 'target-time', targetHour: 11, targetMinute: 0 },
      }),
    ];

    const now = new Date(2025, 0, 1, 10, 0, 0);
    const updated = updateRewardTime(tasks, 900, now);
    const reward = updated.find((task) => task.kind === 'reward');

    expect(reward?.plannedSeconds).toBe(2220);
  });

  it('should return the original array when reward task does not exist', () => {
    const tasks = [makeTodoTask()];
    const updated = updateRewardTime(tasks, 900);

    expect(updated).toBe(tasks);
  });
});
