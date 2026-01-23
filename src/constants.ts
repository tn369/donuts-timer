import type { Task, TargetTimeSettings, TodoList } from './types';

/**
 * デフォルトのやることリスト定義
 */
export const INITIAL_TASKS: Task[] = [
  {
    id: 'toilet',
    name: 'トイレ',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhx0t57NmexW6-RnpAFgwUpiBvrYZPjfX62AoLFuIpHpNtpD17HbGXoL5wYatAlk8kzhiLHfTAmehav2tpdYXtCaXuHl_XYWPNeja-p01TKberrUZFkkC18zLAOJwS0mrRDfhFOgjcMqHU/s400/toilet_boy.png',
    plannedSeconds: 5 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'change',
    name: 'きがえ',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhX22SjuvZe3AmsS9WyPflVzrKMW-VFSb1oZElVeq97FhCAgJUtwdvC_6f8Vn42dVCDTJLs0XcX4ZmZLJCi1yHhefBXdlSLJvOWOhOOjhAHjCtRso8KQnhdqHEwVYj2aGbgUeRKX7EMF8f2/s400/kid_kigae_boy.png',
    plannedSeconds: 10 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'meal',
    name: 'ごはん',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhVwE9KoG7AmbwXwC885pW00OmAgfa1SOyIbf1zfPorK-EGqU1SFIdwSBfzmpsozrxhmYXoTf11-EDwXQ3GtcxF3WygsBSHJ3dXAPEZKhsiNvOrMgLt8_d3XX_AnPzuxxk-V5blADdAeZ90/s400/syokuji_boy_silent.png',
    plannedSeconds: 20 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'play',
    name: 'あそぶ',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiU3bT8Om8wpYNBSphXDy0LAIrNKFvn6ONxElTN90ekuHals49c0dDv8jcCse07zwHauLyKM8hV-DVak1mzOixULI0egb3ZshzoytLn2BLcc1Xk6NRRKITJJbxRS6ZO-SRUKmDSbOC2CYrA/s400/omochabako.png',
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
