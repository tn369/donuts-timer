import type { DomainTask } from '../model';

export const canSelectRewardTaskAtIndex = (tasks: DomainTask[], index: number): boolean => {
  if (index < 0 || index >= tasks.length) return false;
  return !tasks.slice(0, index).some((task) => task.status !== 'done');
};

export const isTaskSelectable = (tasks: DomainTask[], taskId: string): boolean => {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) return false;

  const task = tasks[index];
  if (task.status === 'done') return true;
  if (task.kind !== 'reward') return true;

  return canSelectRewardTaskAtIndex(tasks, index);
};
