/**
 * 時間を MM:SS 形式にフォーマットする
 */
export const formatTime = (seconds: number): string => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * あそび時間を計算する
 */
import type { Task } from './types';

export const calculatePlaySeconds = (tasks: Task[], basePlaySeconds: number): number => {
  let totalDelta = 0;
  tasks.forEach((t) => {
    if (t.kind === 'fixed') {
      if (t.status === 'done') {
        totalDelta += t.plannedSeconds - t.actualSeconds;
      } else if (t.status === 'running' || t.status === 'paused') {
        // 固定タスクが予定時間を超過している場合、超過分を減らす
        if (t.elapsedSeconds > t.plannedSeconds) {
          totalDelta += t.plannedSeconds - t.elapsedSeconds;
        }
      }
    }
  });
  return Math.max(0, basePlaySeconds + totalDelta);
};

/**
 * 全体の進捗（%）を計算する
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
 * 目標時刻から必要な遊び時間を逆算する
 * @param targetHour 目標時刻（時）
 * @param targetMinute 目標時刻（分）
 * @param currentTime 現在時刻
 * @param fixedTasksSeconds 固定タスクの合計時間（秒）
 * @param overdueSeconds 超過時間（秒、マイナス値）
 * @returns 遊び時間（秒）
 */
export const calculatePlaySecondsFromTargetTime = (
  targetHour: number,
  targetMinute: number,
  currentTime: Date,
  fixedTasksSeconds: number,
  overdueSeconds: number
): number => {
  // 目標時刻のDateオブジェクトを作成
  const target = new Date(currentTime);
  target.setHours(targetHour, targetMinute, 0, 0);
  
  // 目標時刻が現在時刻より前の場合は翌日とみなす
  if (target <= currentTime) {
    target.setDate(target.getDate() + 1);
  }
  
  // 利用可能な時間（秒）
  const availableSeconds = Math.floor((target.getTime() - currentTime.getTime()) / 1000);
  
  // 遊び時間 = 利用可能時間 - 固定タスク時間 - 超過時間
  const playSeconds = availableSeconds - fixedTasksSeconds - overdueSeconds;
  
  return Math.max(0, playSeconds);
};

