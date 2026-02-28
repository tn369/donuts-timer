import type { DomainTask } from '../model';

export type DomainTimerMode = 'single' | 'sibling-0' | 'sibling-1';

export interface DomainExecutionSnapshot {
  tasks: DomainTask[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  lastTickTimestamp: number | null;
  listId: string;
}

export interface DomainExecutionState extends DomainExecutionSnapshot {
  mode: DomainTimerMode;
  isAutoResume?: boolean;
}

export const duplicateSingleSessionForSibling = (
  snapshot: DomainExecutionSnapshot
): [DomainExecutionState, DomainExecutionState] => [
  { ...snapshot, mode: 'sibling-0', isAutoResume: true },
  { ...snapshot, mode: 'sibling-1', isAutoResume: true },
];

export const convertSiblingPrimaryToSingle = (
  snapshot: DomainExecutionSnapshot
): DomainExecutionState => ({
  ...snapshot,
  mode: 'single',
  isAutoResume: true,
});
