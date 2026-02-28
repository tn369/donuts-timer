import { describe, expect, it } from 'vitest';

import type { DomainTask } from '../model';
import { convertSiblingPrimaryToSingle, duplicateSingleSessionForSibling } from './modeTransition';

const tasks: DomainTask[] = [
  {
    id: 'task-1',
    name: 'Task',
    icon: '',
    plannedSeconds: 300,
    kind: 'todo',
    status: 'paused',
    elapsedSeconds: 10,
    actualSeconds: 0,
  },
];

describe('modeTransition', () => {
  it('duplicates single snapshot into sibling snapshots', () => {
    const [left, right] = duplicateSingleSessionForSibling({
      tasks,
      selectedTaskId: 'task-1',
      isTimerRunning: false,
      lastTickTimestamp: 123,
      listId: 'list-1',
    });

    expect(left.mode).toBe('sibling-0');
    expect(right.mode).toBe('sibling-1');
    expect(left.isAutoResume).toBe(true);
    expect(right.isAutoResume).toBe(true);
  });

  it('converts sibling snapshot to single snapshot', () => {
    const converted = convertSiblingPrimaryToSingle({
      tasks,
      selectedTaskId: null,
      isTimerRunning: false,
      lastTickTimestamp: null,
      listId: 'list-1',
    });

    expect(converted.mode).toBe('single');
    expect(converted.isAutoResume).toBe(true);
  });
});
