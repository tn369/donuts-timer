import type { DomainTask } from '../model';

export const hasSessionProgress = (tasks: DomainTask[]): boolean =>
  tasks.some((task) => task.elapsedSeconds > 0 || task.status === 'done');

export const shouldDiscardPersistedSession = (tasks: DomainTask[]): boolean => {
  const allCompleted = tasks.length > 0 && tasks.every((task) => task.status === 'done');
  return allCompleted || !hasSessionProgress(tasks);
};
