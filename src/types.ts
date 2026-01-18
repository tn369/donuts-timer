/**
 * タスクタイマーアプリの型定義
 */

// タスクの種類（固定タスク or 変動タスク）
export type TaskKind = 'fixed' | 'variable';

// タスクの状態
export type TaskStatus = 'todo' | 'running' | 'paused' | 'done';

// タスク型定義
export interface Task {
  id: string;               // タスクID
  name: string;             // タスク名（トイレ、おきがえ等）
  icon: string;             // アイコン（絵文字）
  plannedSeconds: number;   // 予定時間（秒）
  kind: TaskKind;           // 固定 or 変動
  status: TaskStatus;       // 現在の状態
  elapsedSeconds: number;   // 経過時間（秒）
  actualSeconds: number;    // 実績時間（秒、完了時に確定）
}
