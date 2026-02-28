import { describe, expect, it } from 'vitest';

import type { Task, TodoList } from '../../../types';
import { fromAppList, fromAppTask, fromAppTasks, toAppTask, toAppTasks } from './taskFactory';

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

describe('taskFactory', () => {
  it('should normalize reward settings when converting app reward task to domain', () => {
    const reward = makeTask({ id: 'reward-1', kind: 'reward', rewardSettings: undefined });

    const domainTask = fromAppTask(reward);

    expect(domainTask.kind).toBe('reward');
    if (domainTask.kind === 'reward') {
      expect(domainTask.rewardSettings).toEqual({
        mode: 'duration',
        targetHour: undefined,
        targetMinute: undefined,
      });
    }
  });

  it('should convert app tasks to domain and back without losing values', () => {
    const tasks = [
      makeTask({ id: 'todo-1', kind: 'todo', status: 'running', elapsedSeconds: 22 }),
      makeTask({
        id: 'reward-1',
        kind: 'reward',
        rewardSettings: { mode: 'target-time', targetHour: 18, targetMinute: 0 },
      }),
    ];

    const roundTrip = toAppTasks(fromAppTasks(tasks));

    expect(roundTrip).toEqual(tasks);
    expect(roundTrip).not.toBe(tasks);
    expect(roundTrip[0]).not.toBe(tasks[0]);
  });

  it('should convert todo list and clone nested tasks', () => {
    const list: TodoList = {
      id: 'list-1',
      title: 'list',
      tasks: [makeTask({ id: 't1' })],
    };

    const domainList = fromAppList(list);

    expect(domainList).toEqual(list);
    expect(domainList).not.toBe(list);
    expect(domainList?.tasks).not.toBe(list.tasks);
  });

  it('should convert domain task to app task', () => {
    const task = fromAppTask(makeTask({ id: 'r1', kind: 'reward' }));

    const appTask = toAppTask(task);

    expect(appTask.id).toBe('r1');
    expect(appTask.kind).toBe('reward');
  });
});
