/**
 * タイマーの内部状態（State）と、状態を更新するためのアクション（Action）の型定義
 */
import type { TargetTimeSettings, Task, TimerSettings, TodoList } from '../types';

/**
 * タイマーの内部状態
 */
export interface State {
  tasks: Task[]; // 現在表示中のタスク一覧
  selectedTaskId: string | null; // 現在選択中のタスクID
  isTimerRunning: boolean; // タイマーが動いているかどうか
  targetTimeSettings: TargetTimeSettings; // 目標時刻/所要時間の設定
  activeList: TodoList | null; // 現在アクティブなリストの全体定義
  timerSettings: TimerSettings; // タイマーの見た目設定
  lastTickTimestamp: number | null; // 前回の時刻更新時のタイムスタンプ
}

/**
 * タイマーの状態を更新するためのアクション定義
 */
export type Action =
  | { type: 'TICK'; now: number }
  | { type: 'SELECT_TASK'; taskId: string; now: number }
  | { type: 'START'; now: number }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'SET_TARGET_TIME_SETTINGS'; settings: TargetTimeSettings }
  | { type: 'REFRESH_REWARD_TIME' }
  | { type: 'UPDATE_ACTIVE_LIST'; list: TodoList }
  | { type: 'INIT_LIST'; list: TodoList }
  | { type: 'SET_TIMER_SETTINGS'; settings: TimerSettings }
  | {
      type: 'RESTORE_SESSION';
      tasks: Task[];
      selectedTaskId: string | null;
      isTimerRunning: boolean;
      lastTickTimestamp: number | null;
    }
  | { type: 'FAST_FORWARD' };
