/**
 * タスクタイマーアプリ全体で使用される型定義
 */

/**
 * タスクの種類（やること: todo | ごほうび: reward）
 */
export type TaskKind = 'todo' | 'reward';

/**
 * タスクの状態
 */
export type TaskStatus = 'todo' | 'running' | 'paused' | 'done';

/**
 * ごほうび（可変タスク）のモード
 */
export type VariableTaskMode = 'duration' | 'target-time';

/**
 * ごほうびタスクの時間計算設定
 */
export interface RewardTaskSettings {
  mode: 'duration' | 'target-time';
  targetHour?: number; // 0-23、target-timeモード時のみ使用
  targetMinute?: number; // 0-59、target-timeモード時のみ使用
}

/**
 * 目標時刻設定
 */
export interface TargetTimeSettings {
  mode: VariableTaskMode;
  targetHour: number; // 0-23
  targetMinute: number; // 0-59
}

/**
 * タスク型定義（やること / ごほうび）
 */
export interface Task {
  id: string; // タスクID
  name: string; // タスク名（トイレ、おきがえ等）
  icon: string; // アイコン（画像URL）
  plannedSeconds: number; // 予定時間（秒）
  kind: TaskKind; // やること(todo) or ごほうび(reward)
  status: TaskStatus; // 現在の状態
  elapsedSeconds: number; // 経過時間（秒）
  actualSeconds: number; // 実績時間（秒、完了時に確定）
  rewardSettings?: RewardTaskSettings; // ごほうびタスク専用設定（kind === 'reward'の場合のみ使用）
}

/**
 * タイマーの形状
 */
export type TimerShape =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'heart';

/**
 * タイマーのカラー
 */
export type TimerColor =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'indigo'
  | 'cyan'
  | 'lime';

/**
 * タイマーの見た目設定
 */
export interface TimerSettings {
  shape: TimerShape;
  color: TimerColor;
}

/**
 * やることリスト型定義
 */
export interface TodoList {
  id: string;
  title: string;
  tasks: Task[];
  targetTimeSettings?: TargetTimeSettings; // オプショナル（後方互換性のため、将来的に削除予定）
  timerSettings?: TimerSettings; // オプショナル（互換性のため）
}
