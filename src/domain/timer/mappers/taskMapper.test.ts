import { describe, expect, it } from 'vitest';

import type { Task, TodoList } from '../../../types';
import { toAppTasks, toDomainList, toDomainTasks } from './taskMapper';

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

describe('taskMapper', () => {
  it('should clone tasks into domain tasks', () => {
    const tasks = [makeTask({ id: 't1' })];

    const mapped = toDomainTasks(tasks);

    expect(mapped).toEqual(tasks);
    expect(mapped).not.toBe(tasks);
    expect(mapped[0]).not.toBe(tasks[0]);
  });

  it('should clone domain tasks into app tasks', () => {
    const tasks = [makeTask({ id: 't1' })];

    const mapped = toAppTasks(tasks);

    expect(mapped).toEqual(tasks);
    expect(mapped).not.toBe(tasks);
    expect(mapped[0]).not.toBe(tasks[0]);
  });

  it('should map list and clone nested tasks', () => {
    const list: TodoList = { id: 'list-1', title: 'list', tasks: [makeTask({ id: 't1' })] };

    const mapped = toDomainList(list);

    expect(mapped).toEqual(list);
    expect(mapped).not.toBe(list);
    expect(mapped?.tasks).not.toBe(list.tasks);
  });

  it('should return null when list is null', () => {
    expect(toDomainList(null)).toBeNull();
  });
});
