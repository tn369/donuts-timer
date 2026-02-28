import { describe, expect, it } from 'vitest';

import type { Task } from '../../../types';
import { mergeRestoredTasks, resolveRestoredSelection, restoreSession } from './sessionTransition';

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

describe('sessionTransition', () => {
  it('should merge saved progress while keeping current task definitions', () => {
    const currentTasks = [
      makeTask({ id: 't1', name: 'new-name', plannedSeconds: 500, status: 'todo' }),
    ];
    const savedTasks = [
      makeTask({
        id: 't1',
        name: 'old-name',
        plannedSeconds: 100,
        status: 'paused',
        elapsedSeconds: 40,
      }),
    ];

    const merged = mergeRestoredTasks(currentTasks, savedTasks);

    expect(merged[0].name).toBe('new-name');
    expect(merged[0].plannedSeconds).toBe(500);
    expect(merged[0].status).toBe('paused');
    expect(merged[0].elapsedSeconds).toBe(40);
  });

  it('should return saved tasks when current tasks are empty', () => {
    const savedTasks = [makeTask({ id: 't1' })];

    expect(mergeRestoredTasks([], savedTasks)).toEqual(savedTasks);
  });

  it('should clear invalid selectedTaskId and stop timer', () => {
    const tasks = [makeTask({ id: 't1' })];

    const resolved = resolveRestoredSelection(tasks, 'missing', true);

    expect(resolved.selectedTaskId).toBeNull();
    expect(resolved.isTimerRunning).toBe(false);
  });

  it('should restore session with merged tasks and valid selection', () => {
    const currentTasks = [makeTask({ id: 't1', plannedSeconds: 600, status: 'todo' })];
    const savedTasks = [makeTask({ id: 't1', status: 'running', elapsedSeconds: 100 })];

    const restored = restoreSession(currentTasks, savedTasks, 't1', true);

    expect(restored.tasks[0].plannedSeconds).toBe(600);
    expect(restored.tasks[0].status).toBe('running');
    expect(restored.selectedTaskId).toBe('t1');
    expect(restored.isTimerRunning).toBe(true);
  });
});
