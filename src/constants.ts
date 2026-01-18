import type { Task } from './types';

/**
 * 初期タスクデータ
 * 固定タスク: トイレ(5分)、おきがえ(10分)、ごはん(20分)
 * 変動タスク: あそび(15分) ※固定タスクの差分で増減
 */
export const INITIAL_TASKS: Task[] = [
  {
    id: 'toilet',
    name: 'トイレ',
    icon: '🚽',
    plannedSeconds: 5 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'change',
    name: 'きがえ',
    icon: '👕',
    plannedSeconds: 10 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'meal',
    name: 'ごはん',
    icon: '🍚',
    plannedSeconds: 20 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'play',
    name: 'あそぶ',
    icon: '🧸',
    plannedSeconds: 15 * 60,
    kind: 'variable',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
];

export const BASE_PLAY_SECONDS = 15 * 60; // あそびの基本時間（15分）
