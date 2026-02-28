import { describe, expect, it } from 'vitest';

import type { DomainTask } from '../model';
import { hasSessionProgress, shouldDiscardPersistedSession } from './sessionPersistence';

const todoTask = (overrides: Partial<DomainTask> = {}): DomainTask => ({
  id: 'task-1',
  name: 'Task',
  icon: '',
  plannedSeconds: 300,
  kind: 'todo',
  status: 'todo',
  elapsedSeconds: 0,
  actualSeconds: 0,
  ...overrides,
});

describe('sessionPersistence', () => {
  it('detects progress from elapsed seconds', () => {
    expect(hasSessionProgress([todoTask({ elapsedSeconds: 10 })])).toBe(true);
  });

  it('returns true for discard when all tasks are done', () => {
    const tasks = [todoTask({ status: 'done', actualSeconds: 120 })];
    expect(shouldDiscardPersistedSession(tasks)).toBe(true);
  });

  it('returns true for discard when no progress exists', () => {
    expect(shouldDiscardPersistedSession([todoTask()])).toBe(true);
  });

  it('returns false for discard when partial progress exists', () => {
    expect(
      shouldDiscardPersistedSession([todoTask({ status: 'paused', elapsedSeconds: 12 })])
    ).toBe(false);
  });
});
