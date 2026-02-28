export type DomainTaskKind = 'todo' | 'reward';
export type DomainTaskStatus = 'todo' | 'running' | 'paused' | 'done';

export type DomainVariableTaskMode = 'duration' | 'target-time';

export interface DomainRewardSettings {
  mode: DomainVariableTaskMode;
  targetHour?: number;
  targetMinute?: number;
}

export interface DomainTargetTimeSettings {
  mode: DomainVariableTaskMode;
  targetHour: number;
  targetMinute: number;
}

export interface DomainTimerSettings {
  shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'heart';
  color:
    | 'red'
    | 'blue'
    | 'yellow'
    | 'green'
    | 'pink'
    | 'purple'
    | 'orange'
    | 'indigo'
    | 'cyan'
    | 'lime';
}

interface DomainTaskBase {
  id: string;
  name: string;
  icon: string;
  plannedSeconds: number;
  status: DomainTaskStatus;
  elapsedSeconds: number;
  actualSeconds: number;
}

export interface DomainTodoTask extends DomainTaskBase {
  kind: 'todo';
}

export interface DomainRewardTask extends DomainTaskBase {
  kind: 'reward';
  rewardSettings?: DomainRewardSettings;
}

export type DomainTask = DomainTodoTask | DomainRewardTask;

export interface DomainTodoList {
  id: string;
  title: string;
  tasks: DomainTask[];
  targetTimeSettings?: DomainTargetTimeSettings;
  timerSettings?: DomainTimerSettings;
}

export interface DomainTimerSession {
  tasks: DomainTask[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
}
