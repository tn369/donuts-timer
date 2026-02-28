import { isRewardTask } from '../entities/taskEntity';
import type { DomainTask } from '../model';

export interface DomainRewardGainNotice {
  taskId: string;
  taskName: string;
  deltaSeconds: number;
  occurredAt: number;
}

const getRewardPlannedSeconds = (tasks: DomainTask[]): number | null => {
  const rewardTask = tasks.find((task) => isRewardTask(task));
  return rewardTask ? rewardTask.plannedSeconds : null;
};

const findNewlyCompletedTodo = (
  prevTasks: DomainTask[],
  nextTasks: DomainTask[]
): DomainTask | undefined => {
  return nextTasks.find((nextTask) => {
    if (nextTask.kind !== 'todo' || nextTask.status !== 'done') {
      return false;
    }

    const prevTask = prevTasks.find((task) => task.id === nextTask.id);
    return prevTask ? prevTask.status !== 'done' : false;
  });
};

export const deriveRewardGainNotice = (
  prevTasks: DomainTask[],
  nextTasks: DomainTask[],
  now: number
): DomainRewardGainNotice | null => {
  const newlyCompletedTodo = findNewlyCompletedTodo(prevTasks, nextTasks);
  if (!newlyCompletedTodo) {
    return null;
  }

  const prevRewardPlannedSeconds = getRewardPlannedSeconds(prevTasks);
  const nextRewardPlannedSeconds = getRewardPlannedSeconds(nextTasks);
  if (prevRewardPlannedSeconds === null || nextRewardPlannedSeconds === null) {
    return null;
  }

  const deltaSeconds = nextRewardPlannedSeconds - prevRewardPlannedSeconds;
  if (deltaSeconds <= 0) {
    return null;
  }

  return {
    taskId: newlyCompletedTodo.id,
    taskName: newlyCompletedTodo.name,
    deltaSeconds,
    occurredAt: now,
  };
};
