import { isRewardTask } from '../entities/taskEntity';
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
      // 早く終われば加点、遅ければ減点（actualSecondsがplannedを超えると減る）。
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

  // 目標時刻が過ぎている場合は「翌日の同時刻」を締切として扱う。
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
  const rewardTask = tasks.find((task) => isRewardTask(task));
  if (!rewardTask) return tasks;

  const rewardElapsed = rewardTask.elapsedSeconds;
  const rewardSettings = rewardTask.rewardSettings;

  // target-timeは「締切までの空き時間 - 未完了todo時間」をごほうび予定時間にする。
  // 既に消費済みのごほうび時間は消えないように加算する。
  const newRewardSeconds =
    rewardSettings?.mode === 'target-time'
      ? calculateRewardSecondsFromTargetTime(
          rewardSettings.targetHour ?? 0,
          rewardSettings.targetMinute ?? 0,
          now,
          calculateRemainingTodoSeconds(tasks)
        ) + rewardElapsed
      : calculateRewardSecondsDuration(tasks, baseRewardSeconds);

  return tasks.map((task) =>
    isRewardTask(task) ? { ...task, plannedSeconds: newRewardSeconds } : task
  );
};

export const isTargetTimeRewardMode = (tasks: DomainTask[]): boolean => {
  const rewardTask = tasks.find((task) => isRewardTask(task));
  return rewardTask?.rewardSettings?.mode === 'target-time';
};
