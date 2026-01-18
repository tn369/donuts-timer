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
