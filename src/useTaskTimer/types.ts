/**
 * タイマーの内部状態（State）と、状態を更新するためのアクション（Action）の型定義
 */
import type { DomainTargetTimeSettings, DomainTask, DomainTodoList } from '../domain/timer/model';
import type { RewardGainNotice, TimerSettings } from '../types';

/**
 * 復元待ちの状態データ
 */
export interface RestorableState {
  tasks: DomainTask[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  lastTickTimestamp: number | null;
}

/**
 * タイマーの内部状態
 */
export interface State {
  tasks: DomainTask[]; // 現在表示中のタスク一覧（ドメインモデル）
  selectedTaskId: string | null; // 現在選択中のタスクID
  isTimerRunning: boolean; // タイマーが動いているかどうか
  targetTimeSettings?: DomainTargetTimeSettings; // 目標時刻/所要時間の設定（後方互換性のため、将来的に削除予定）
  activeList: DomainTodoList | null; // 現在アクティブなリストの全体定義
  timerSettings: TimerSettings; // タイマーの見た目設定
  lastTickTimestamp: number | null; // 前回の時刻更新時のタイムスタンプ
  pendingRestorableState: RestorableState | null; // 確認待ちの復元データ
  rewardGainNotice: RewardGainNotice | null; // 完了時に増えたごほうび時間の通知
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
  | { type: 'SET_TASKS'; tasks: DomainTask[] }
  | { type: 'SET_TARGET_TIME_SETTINGS'; settings: DomainTargetTimeSettings }
  | { type: 'REFRESH_REWARD_TIME' }
  | { type: 'UPDATE_ACTIVE_LIST'; list: DomainTodoList }
  | { type: 'INIT_LIST'; list: DomainTodoList }
  | { type: 'SET_TIMER_SETTINGS'; settings: TimerSettings }
  | { type: 'REORDER_TASKS'; fromIndex: number; toIndex: number }
  | {
      type: 'RESTORE_AVAILABLE';
      tasks: DomainTask[];
      selectedTaskId: string | null;
      isTimerRunning: boolean;
      lastTickTimestamp: number | null;
    }
  | { type: 'RESTORE_SESSION' }
  | { type: 'CANCEL_RESTORE' }
  | { type: 'CLEAR_REWARD_GAIN_NOTICE' }
  | {
      type: 'AUTO_RESTORE';
      tasks: DomainTask[];
      selectedTaskId: string | null;
      isTimerRunning: boolean;
      lastTickTimestamp: number | null;
    }
  | { type: 'FAST_FORWARD' };
