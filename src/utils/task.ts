/**
 * タスクの計算に関連するユーティリティ
 */
import type { Task } from '../types';

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
 * タスク一覧に進捗（経過時間がある、または完了している）が含まれているか判定する
 * @param tasks タスク一覧
 * @returns 進捗があればtrue
 */
export const hasTaskProgress = (tasks: Task[]): boolean => {
  return tasks.some((t) => t.elapsedSeconds > 0 || t.status === 'done');
};
