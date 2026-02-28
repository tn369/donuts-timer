import type { DomainTask, DomainTodoList } from '../model';

/**
 * リスト内のごほうびタスクを基準に、ベースのごほうび秒数を返す。
 * @param list 現在のやることリスト。
 * @returns ごほうびタスクの予定秒数。未定義の場合は15分（900秒）。
 */
export function getBaseRewardSeconds(list: DomainTodoList | null): number {
  const rewardTask = list?.tasks.find((task) => task.kind === 'reward');
  return rewardTask ? rewardTask.plannedSeconds : 15 * 60;
}

const calculateRewardSecondsDuration = (tasks: DomainTask[], baseRewardSeconds: number): number => {
  let totalDelta = 0;

  tasks.forEach((task) => {
    if (task.kind !== 'todo') return;

    if (task.status === 'done') {
      totalDelta += task.plannedSeconds - task.actualSeconds;
      return;
    }

    if (task.status === 'running' || task.status === 'paused') {
      if (task.elapsedSeconds > task.plannedSeconds) {
        totalDelta += task.plannedSeconds - task.elapsedSeconds;
      }
    }
  });

  return Math.max(0, baseRewardSeconds + totalDelta);
};

const calculateRewardSecondsFromTargetTime = (
  targetHour: number,
  targetMinute: number,
  now: Date,
  todoTasksSeconds: number
): number => {
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const availableSeconds = (target.getTime() - now.getTime()) / 1000;
  return Math.floor(availableSeconds - todoTasksSeconds);
};

const calculateRemainingTodoSeconds = (tasks: DomainTask[]): number => {
  let todoTasksSeconds = 0;

  tasks.forEach((task) => {
    if (task.kind !== 'todo') return;

    if (task.status === 'todo') {
      todoTasksSeconds += task.plannedSeconds;
      return;
    }

    if (task.status === 'running' || task.status === 'paused') {
      const remaining = task.plannedSeconds - task.elapsedSeconds;
      if (remaining > 0) {
        todoTasksSeconds += remaining;
      }
    }
  });

  return todoTasksSeconds;
};

export const updateRewardTime = (
  tasks: DomainTask[],
  baseRewardSeconds: number,
  now: Date = new Date()
): DomainTask[] => {
  const rewardTask = tasks.find((task) => task.kind === 'reward');
  if (!rewardTask) return tasks;

  const rewardElapsed = rewardTask.elapsedSeconds;

  const newRewardSeconds =
    rewardTask.rewardSettings?.mode === 'target-time'
      ? calculateRewardSecondsFromTargetTime(
          rewardTask.rewardSettings.targetHour ?? 0,
          rewardTask.rewardSettings.targetMinute ?? 0,
          now,
          calculateRemainingTodoSeconds(tasks)
        ) + rewardElapsed
      : calculateRewardSecondsDuration(tasks, baseRewardSeconds);

  return tasks.map((task) =>
    task.kind === 'reward' ? { ...task, plannedSeconds: newRewardSeconds } : task
  );
};
