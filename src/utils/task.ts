/**
 * タスクの計算に関連するユーティリティ
 */
import type { Task } from '../types';

/**
 * 「ごほうび」の時間を計算する
 * 予定より早く終わった分の時間を加算し、超過した分の時間を減算する
 * @param tasks タスク一覧
 * @param baseRewardSeconds 基本となるごほうび時間
 * @returns 計算後のごほうび時間（秒）
 */
export const calculateRewardSeconds = (tasks: Task[], baseRewardSeconds: number): number => {
  let totalDelta = 0;
  tasks.forEach((t) => {
    if (t.kind !== 'todo') return;

    if (t.status === 'done') {
      totalDelta += t.plannedSeconds - t.actualSeconds;
    } else if (t.status === 'running' || t.status === 'paused') {
      // 固定タスクが予定時間を超過している場合、超過分を減らす
      if (t.elapsedSeconds > t.plannedSeconds) {
        totalDelta += t.plannedSeconds - t.elapsedSeconds;
      }
    }
  });
  return Math.max(0, baseRewardSeconds + totalDelta);
};

/**
 * 全体の進捗（%）を計算する
 * @param tasks タスク一覧
 * @returns 進捗率（0-100）
 */
export const calculateOverallProgress = (tasks: Task[]): number => {
  const totalPlanned = tasks.reduce((sum, task) => sum + task.plannedSeconds, 0);
  let completedSeconds = 0;
  tasks.forEach((task) => {
    if (task.status === 'done') {
      completedSeconds += task.actualSeconds;
    } else if (task.status === 'running' || task.status === 'paused') {
      completedSeconds += task.elapsedSeconds;
    }
  });

  return totalPlanned > 0 ? (completedSeconds / totalPlanned) * 100 : 0;
};

/**
 * 目標時刻から必要な「ごほうび」の時間を逆算する
 * @param targetHour 目標時刻（時）
 * @param targetMinute 目標時刻（分）
 * @param currentTime 現在時刻
 * @param todoTasksSeconds 「やること」の合計時間（秒）
 * @returns ごほうびの時間（秒）
 */
export const calculateRewardSecondsFromTargetTime = (
  targetHour: number,
  targetMinute: number,
  currentTime: Date,
  todoTasksSeconds: number
): number => {
  // 目標時刻のDateオブジェクトを作成
  const target = new Date(currentTime);
  target.setHours(targetHour, targetMinute, 0, 0);

  // 目標時刻が現在時刻より前の場合は翌日とみなす
  if (target <= currentTime) {
    target.setDate(target.getDate() + 1);
  }

  // 利用可能な時間（秒）
  const availableSeconds = (target.getTime() - currentTime.getTime()) / 1000;

  // ごほうびの時間 = 利用可能時間 - やることの時間
  return Math.floor(availableSeconds - todoTasksSeconds);
};

/**
 * タスク一覧に進捗（経過時間がある、または完了している）が含まれているか判定する
 * @param tasks タスク一覧
 * @returns 進捗があればtrue
 */
export const hasTaskProgress = (tasks: Task[]): boolean => {
  return tasks.some((t) => t.elapsedSeconds > 0 || t.status === 'done');
};
