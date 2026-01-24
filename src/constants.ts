import type { Task, TargetTimeSettings, TodoList } from './types';

/**
 * デフォルトのやることリスト定義
 */
export const INITIAL_TASKS: Task[] = [
  {
    id: 'toilet',
    name: 'トイレ',
    icon: '',
    plannedSeconds: 5 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'change',
    name: 'きがえ',
    icon: '',
    plannedSeconds: 10 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'meal',
    name: 'ごはん',
    icon: '',
    plannedSeconds: 20 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'play',
    name: 'あそぶ',
    icon: '',
    plannedSeconds: 15 * 60,
    kind: 'reward',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
];

export const BASE_REWARD_SECONDS = 15 * 60; // ごほうびの基本時間（15分）

export const DEFAULT_TARGET_TIME: TargetTimeSettings = {
  mode: 'duration', // デフォルトは所要時間モード
  targetHour: 7,
  targetMinute: 55,
};

export const DEFAULT_TODO_LISTS: TodoList[] = [
  {
    id: 'default-morning',
    title: 'あさのやることリスト',
    tasks: INITIAL_TASKS,
    targetTimeSettings: DEFAULT_TARGET_TIME,
    timerSettings: { shape: 'square', color: 'blue' },
  },
];
