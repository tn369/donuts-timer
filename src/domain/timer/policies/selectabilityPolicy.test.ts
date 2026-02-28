import { describe, expect, it } from 'vitest';

import type { Task } from '../../../types';
import { canSelectRewardTaskAtIndex, isTaskSelectable } from './selectabilityPolicy';

const makeTask = (partial: Partial<Task>): Task => ({
  id: partial.id ?? 'task-1',
  name: partial.name ?? 'task',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 300,
  kind: partial.kind ?? 'todo',
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
  rewardSettings: partial.rewardSettings,
});

describe('selectabilityPolicy', () => {
  it('should block reward selection when incomplete task exists before it', () => {
    const tasks = [
      makeTask({ id: 'todo-1', kind: 'todo', status: 'todo' }),
      makeTask({ id: 'reward-1', kind: 'reward', status: 'todo' }),
    ];

    expect(canSelectRewardTaskAtIndex(tasks, 1)).toBe(false);
    expect(isTaskSelectable(tasks, 'reward-1')).toBe(false);
  });

  it('should allow reward selection when all previous tasks are done', () => {
    const tasks = [
      makeTask({ id: 'todo-1', kind: 'todo', status: 'done' }),
      makeTask({ id: 'reward-1', kind: 'reward', status: 'todo' }),
    ];

    expect(canSelectRewardTaskAtIndex(tasks, 1)).toBe(true);
    expect(isTaskSelectable(tasks, 'reward-1')).toBe(true);
  });

  it('should always allow done task selection', () => {
    const tasks = [makeTask({ id: 'done-1', kind: 'todo', status: 'done' })];

    expect(isTaskSelectable(tasks, 'done-1')).toBe(true);
  });
});
