import type { Task, TargetTimeSettings, TodoList, TimerSettings } from '../types';

export interface State {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  targetTimeSettings: TargetTimeSettings;
  activeList: TodoList | null;
  timerSettings: TimerSettings;
  lastTickTimestamp: number | null;
}

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
  | { type: 'RESTORE_SESSION'; tasks: Task[]; selectedTaskId: string | null; isTimerRunning: boolean; lastTickTimestamp: number | null }
  | { type: 'FAST_FORWARD' };
