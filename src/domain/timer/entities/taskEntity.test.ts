import { describe, expect, it } from 'vitest';

import type { DomainTask } from '../model';
import {
  canSelectRewardTaskAtIndex,
  getNextIncompleteTaskId,
  isTaskSelectable,
  markTaskDone,
  markTaskPaused,
  markTaskRunning,
  reopenTask,
  resetTaskProgress,
  withElapsedSeconds,
} from './taskEntity';

const makeTask = (partial: Partial<DomainTask> & { kind: DomainTask['kind'] }): DomainTask => ({
  id: partial.id ?? 'task-1',
  name: partial.name ?? 'task',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 300,
  kind: partial.kind,
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
  ...(partial.kind === 'reward' ? { rewardSettings: partial.rewardSettings } : {}),
});

describe('taskEntity', () => {
  it('should transition task status with dedicated operations', () => {
    const todo = makeTask({ kind: 'todo' });

    const running = markTaskRunning(todo);
    const paused = markTaskPaused(running);
    const elapsed = withElapsedSeconds(paused, 120);
    const done = markTaskDone(elapsed);
    const reopened = reopenTask(done);
    const reset = resetTaskProgress(reopened);

    expect(running.status).toBe('running');
    expect(paused.status).toBe('paused');
    expect(elapsed.elapsedSeconds).toBe(120);
    expect(done.status).toBe('done');
    expect(done.actualSeconds).toBe(120);
    expect(reopened.status).toBe('todo');
    expect(reopened.actualSeconds).toBe(0);
    expect(reset.elapsedSeconds).toBe(0);
  });

  it('should block reward selection when previous task is incomplete', () => {
    const tasks = [
      makeTask({ id: 'todo-1', kind: 'todo', status: 'todo' }),
      makeTask({ id: 'reward-1', kind: 'reward', status: 'todo' }),
    ];

    expect(canSelectRewardTaskAtIndex(tasks, 1)).toBe(false);
    expect(isTaskSelectable(tasks, 'reward-1')).toBe(false);
  });

  it('should derive next incomplete task id when current task is completed', () => {
    const tasks = [
      makeTask({ id: 'todo-1', kind: 'todo', status: 'done' }),
      makeTask({ id: 'todo-2', kind: 'todo', status: 'todo' }),
      makeTask({ id: 'reward-1', kind: 'reward', status: 'todo' }),
    ];

    expect(getNextIncompleteTaskId(tasks, 0)).toBe('todo-2');
  });
});
