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
    if (t.kind === 'todo') {
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
    // ただし、12時間以上先になる場合は、おそらくすでに目標時刻を過ぎている（当日）と判断する
    // 例：目標 8:00 で現在 8:01 の場合、翌日 8:00 になると 23時間後になってしまう。
    // ここでは単純化のため、目標時刻の前後12時間は当日のものとして扱う、といったロジックも検討できるが
    // 現状は単純に「目標時刻を過ぎたら負の値になる」ようにしたいので、
    // 「今から12時間以上前」なら翌日、「12時間以内」なら当日（＝負の値）とする。
    const diff = target.getTime() - currentTime.getTime();
    if (diff < -12 * 60 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
    } else {
      // 当日の目標時刻を過ぎた状態（負の値になる）
    }
  }

  // 利用可能な時間（秒）
  const availableSeconds = (target.getTime() - currentTime.getTime()) / 1000;

  // ごほうびの時間 = 利用可能時間 - やることの時間
  return Math.floor(availableSeconds - todoTasksSeconds);
};
