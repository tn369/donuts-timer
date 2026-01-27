import womanIcon from './assets/futon_derenai_woman.png';
import hamigakiIcon from './assets/hamigaki_boy.png';
import changeIcon from './assets/kid_kigae_boy.png';
import kidIcon from './assets/kid_seikaku_kachiki_boy.png';
import ofuroIcon from './assets/ofuro_kurage.png';
import playIcon from './assets/omochabako.png';
import studyIcon from './assets/study_wakaru_boy.png';
import mealIcon from './assets/syokuji_boy.png';
import familyIcon from './assets/syokuji_family_tanoshisou.png';
import toiletIcon from './assets/toilet_boy.png';
import type { TargetTimeSettings, Task, TodoList } from './types';

/**
 * プリセット画像の一覧
 */
export const PRESET_IMAGES = [
  toiletIcon,
  changeIcon,
  mealIcon,
  playIcon,
  hamigakiIcon,
  ofuroIcon,
  studyIcon,
  kidIcon,
  familyIcon,
  womanIcon,
];

/**
 * タスク名からプリセット画像へのマッピング
 */
export const TASK_NAME_TO_ICON: Record<string, string> = {
  トイレ: toiletIcon,
  きがえ: changeIcon,
  おきがえ: changeIcon,
  ごはん: mealIcon,
  おしょくじ: mealIcon,
  あそぶ: playIcon,
  おもちゃ: playIcon,
  かたづけ: playIcon,
  はみがき: hamigakiIcon,
  おふろ: ofuroIcon,
  べんきょう: studyIcon,
  しゅくだい: studyIcon,
  おきる: womanIcon,
  ねる: womanIcon,
  おけいこ: kidIcon,
  がっこう: kidIcon,
  だんらん: familyIcon,
};

/**
 * タスクのアイコンが空の場合、名前から推測してアイコンを設定する
 */
export const migrateTasksWithDefaultIcons = (tasks: Task[]): Task[] => {
  return tasks.map((task) => {
    if (task.icon) return task;
    const defaultIcon = TASK_NAME_TO_ICON[task.name];
    if (defaultIcon) {
      return { ...task, icon: defaultIcon };
    }
    return task;
  });
};

/**
 * デフォルトのやることリスト定義
 */
export const INITIAL_TASKS: Task[] = [
  {
    id: 'toilet',
    name: 'トイレ',
    icon: toiletIcon,
    plannedSeconds: 5 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'change',
    name: 'きがえ',
    icon: changeIcon,
    plannedSeconds: 10 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'meal',
    name: 'ごはん',
    icon: mealIcon,
    plannedSeconds: 20 * 60,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  },
  {
    id: 'play',
    name: 'あそぶ',
    icon: playIcon,
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
