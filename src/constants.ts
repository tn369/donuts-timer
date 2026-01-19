import type { Task, TargetTimeSettings } from './types';

/**
 * 初期タスクデータ
 * 固定タスク: トイレ(5分)、おきがえ(10分)、ごはん(20分)
 * 変動タスク: あそび(15分) ※固定タスクの差分で増減
 */
export const INITIAL_TASKS: Task[] = [
  {
    id: 'toilet',
    name: 'トイレ',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhx0t57NmexW6-RnpAFgwUpiBvrYZPjfX62AoLFuIpHpNtpD17HbGXoL5wYatAlk8kzhiLHfTAmehav2tpdYXtCaXuHl_XYWPNeja-p01TKberrUZFkkC18zLAOJwS0mrRDfhFOgjcMqHU/s400/toilet_boy.png',
    plannedSeconds: 5 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'change',
    name: 'きがえ',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhX22SjuvZe3AmsS9WyPflVzrKMW-VFSb1oZElVeq97FhCAgJUtwdvC_6f8Vn42dVCDTJLs0XcX4ZmZLJCi1yHhefBXdlSLJvOWOhOOjhAHjCtRso8KQnhdqHEwVYj2aGbgUeRKX7EMF8f2/s400/kid_kigae_boy.png',
    plannedSeconds: 10 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'meal',
    name: 'ごはん',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhVwE9KoG7AmbwXwC885pW00OmAgfa1SOyIbf1zfPorK-EGqU1SFIdwSBfzmpsozrxhmYXoTf11-EDwXQ3GtcxF3WygsBSHJ3dXAPEZKhsiNvOrMgLt8_d3XX_AnPzuxxk-V5blADdAeZ90/s400/syokuji_boy_silent.png',
    plannedSeconds: 20 * 60,
    kind: 'fixed',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'play',
    name: 'あそぶ',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiU3bT8Om8wpYNBSphXDy0LAIrNKFvn6ONxElTN90ekuHals49c0dDv8jcCse07zwHauLyKM8hV-DVak1mzOixULI0egb3ZshzoytLn2BLcc1Xk6NRRKITJJbxRS6ZO-SRUKmDSbOC2CYrA/s400/omochabako.png',
    plannedSeconds: 15 * 60,
    kind: 'variable',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
];

export const BASE_PLAY_SECONDS = 15 * 60; // あそびの基本時間（15分）

export const DEFAULT_TARGET_TIME: TargetTimeSettings = {
  mode: 'duration',  // デフォルトは所要時間モード
  targetHour: 7,
  targetMinute: 55,
};
