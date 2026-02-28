import { describe, expect, it } from 'vitest';

import type { DomainTask } from '../model';
import { deriveRewardGainNotice } from './rewardGainNoticePolicy';

const makeTodoTask = (partial: Partial<DomainTask> = {}): DomainTask => ({
  id: partial.id ?? 'task-1',
  name: partial.name ?? 'task',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 600,
  kind: 'todo',
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
});

const makeRewardTask = (partial: Partial<DomainTask> = {}): DomainTask => ({
  id: partial.id ?? 'reward-1',
  name: partial.name ?? 'reward',
  icon: partial.icon ?? '',
  plannedSeconds: partial.plannedSeconds ?? 900,
  kind: 'reward',
  status: partial.status ?? 'todo',
  elapsedSeconds: partial.elapsedSeconds ?? 0,
  actualSeconds: partial.actualSeconds ?? 0,
});

describe('rewardGainNoticePolicy', () => {
  it('returns notice when a todo task is newly completed and reward planned seconds increase', () => {
    const prevTasks: DomainTask[] = [
      makeTodoTask({
        id: 'todo-1',
        name: 'はみがき',
        status: 'running',
      }),
      makeRewardTask({
        id: 'reward-1',
        plannedSeconds: 900,
        status: 'todo',
      }),
    ];
    const nextTasks: DomainTask[] = [
      makeTodoTask({
        id: 'todo-1',
        name: 'はみがき',
        status: 'done',
      }),
      makeRewardTask({
        id: 'reward-1',
        plannedSeconds: 1200,
        status: 'todo',
      }),
    ];

    expect(deriveRewardGainNotice(prevTasks, nextTasks, 1000)).toEqual({
      taskId: 'todo-1',
      taskName: 'はみがき',
      deltaSeconds: 300,
      occurredAt: 1000,
    });
  });

  it('returns null when reward planned seconds do not increase', () => {
    const prevTasks: DomainTask[] = [
      makeTodoTask({ id: 'todo-1', status: 'running' }),
      makeRewardTask({ id: 'reward-1', plannedSeconds: 900, status: 'todo' }),
    ];
    const nextTasks: DomainTask[] = [
      makeTodoTask({ id: 'todo-1', status: 'done' }),
      makeRewardTask({ id: 'reward-1', plannedSeconds: 900, status: 'todo' }),
    ];

    expect(deriveRewardGainNotice(prevTasks, nextTasks, 1000)).toBeNull();
  });

  it('returns null when reward task does not exist', () => {
    const prevTasks: DomainTask[] = [makeTodoTask({ id: 'todo-1', status: 'running' })];
    const nextTasks: DomainTask[] = [makeTodoTask({ id: 'todo-1', status: 'done' })];

    expect(deriveRewardGainNotice(prevTasks, nextTasks, 1000)).toBeNull();
  });

  it('returns null when no todo task is newly completed', () => {
    const prevTasks: DomainTask[] = [
      makeTodoTask({ id: 'todo-1', status: 'done' }),
      makeRewardTask({ id: 'reward-1', plannedSeconds: 900, status: 'todo' }),
    ];
    const nextTasks: DomainTask[] = [
      makeTodoTask({ id: 'todo-1', status: 'done' }),
      makeRewardTask({ id: 'reward-1', plannedSeconds: 1200, status: 'todo' }),
    ];

    expect(deriveRewardGainNotice(prevTasks, nextTasks, 1000)).toBeNull();
  });
});
