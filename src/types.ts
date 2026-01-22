/**
 * タスクタイマーアプリの型定義
 */

// タスクの種類（やること: todo | ごほうび: reward）
export type TaskKind = 'todo' | 'reward';

// タスクの状態
export type TaskStatus = 'todo' | 'running' | 'paused' | 'done';

// ごほうび（可変タスク）のモード
export type VariableTaskMode = 'duration' | 'target-time';

// 目標時刻設定
export interface TargetTimeSettings {
  mode: VariableTaskMode;
  targetHour: number;    // 0-23
  targetMinute: number;  // 0-59
}

// タスク型定義（やること / ごほうび）
export interface Task {
  id: string;               // タスクID
  name: string;             // タスク名（トイレ、おきがえ等）
  icon: string;             // アイコン（画像URL）
  plannedSeconds: number;   // 予定時間（秒）
  kind: TaskKind;           // やること(todo) or ごほうび(reward)
  status: TaskStatus;       // 現在の状態
  elapsedSeconds: number;   // 経過時間（秒）
  actualSeconds: number;    // 実績時間（秒、完了時に確定）
}

// タイマーの見た目設定
export type TimerShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star';
export type TimerColor = 'red' | 'blue' | 'yellow' | 'green' | 'pink' | 'purple';

export interface TimerSettings {
  shape: TimerShape;
  color: TimerColor;
}

// やることリスト型定義
export interface TodoList {
  id: string;
  title: string;
  tasks: Task[];
  targetTimeSettings: TargetTimeSettings;
  timerSettings?: TimerSettings; // オプショナル（互換性のため）
}
