import { describe, expect, it } from 'vitest';

import type { DomainTask } from '../model';
import { type DomainRuntimeState, selectTaskRuntime } from './runtimeTransition';

const makeTask = (partial: Partial<DomainTask>): DomainTask => ({
  id: partial.id ?? 'task-1',
  name: partial.name ?? 'Task',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 300,
  kind: partial.kind ?? 'todo',
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
  ...(partial.kind === 'reward' ? { rewardSettings: partial.rewardSettings } : {}),
});

describe('runtimeTransition', () => {
  describe('selectTaskRuntime', () => {
    it('stops timer after completing a running task and selects next task', () => {
      const runningTask = makeTask({ id: 'todo-1', status: 'running' });
      const nextTask = makeTask({ id: 'todo-2', status: 'todo' });
      const state: DomainRuntimeState = {
        tasks: [runningTask, nextTask],
        selectedTaskId: 'todo-1',
        isTimerRunning: true,
        lastTickTimestamp: 1000,
      };

      const result = selectTaskRuntime(state, 'todo-1', 2000, null);

      expect(result.tasks[0].status).toBe('done');
      expect(result.selectedTaskId).toBe('todo-2');
      expect(result.tasks[1].status).toBe('todo');
      expect(result.isTimerRunning).toBe(false);
      expect(result.lastTickTimestamp).toBeNull();
    });

    it('stops timer and clears selection when no incomplete task remains', () => {
      const runningTask = makeTask({ id: 'todo-1', status: 'running' });
      const state: DomainRuntimeState = {
        tasks: [runningTask],
        selectedTaskId: 'todo-1',
        isTimerRunning: true,
        lastTickTimestamp: 1000,
      };

      const result = selectTaskRuntime(state, 'todo-1', 2000, null);

      expect(result.tasks[0].status).toBe('done');
      expect(result.selectedTaskId).toBeNull();
      expect(result.isTimerRunning).toBe(false);
      expect(result.lastTickTimestamp).toBeNull();
    });

    it('starts timer when tapping selected task while stopped', () => {
      const task = makeTask({ id: 'todo-1', status: 'paused' });
      const state: DomainRuntimeState = {
        tasks: [task],
        selectedTaskId: 'todo-1',
        isTimerRunning: false,
        lastTickTimestamp: null,
      };

      const result = selectTaskRuntime(state, 'todo-1', 3000, null);

      expect(result.isTimerRunning).toBe(true);
      expect(result.tasks[0].status).toBe('running');
      expect(result.lastTickTimestamp).toBe(3000);
    });
  });
});
