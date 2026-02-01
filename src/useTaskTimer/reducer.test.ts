/**
 * timerReducerの動作を確認するためのユニットテスト
 */
import { describe, expect, it } from 'vitest';

import type { TargetTimeSettings, Task, TimerSettings } from '../types';
import { timerReducer } from './reducer';
import type { Action, State } from './types';

const mockTask: Task = {
  id: '1',
  name: 'Test Task',
  icon: 'icon',
  plannedSeconds: 300,
  kind: 'todo',
  status: 'todo',
  elapsedSeconds: 0,
  actualSeconds: 0,
};

const initialState: State = {
  tasks: [mockTask],
  selectedTaskId: null,
  isTimerRunning: false,
  targetTimeSettings: { mode: 'duration', targetHour: 18, targetMinute: 0 },
  activeList: null,
  timerSettings: { shape: 'circle', color: 'blue' },
  lastTickTimestamp: null,
};

describe('timerReducer', () => {
  it('should handle SET_TIMER_SETTINGS', () => {
    const newSettings: TimerSettings = { shape: 'star', color: 'pink' };
    const action: Action = { type: 'SET_TIMER_SETTINGS', settings: newSettings };
    const newState = timerReducer(initialState, action);
    expect(newState.timerSettings).toEqual(newSettings);
  });

  it('should handle SET_TASKS', () => {
    const newTasks: Task[] = [{ ...mockTask, id: '2', name: 'New Task' }];
    const action: Action = { type: 'SET_TASKS', tasks: newTasks };
    const newState = timerReducer(initialState, action);
    expect(newState.tasks).toEqual(newTasks);
  });

  it('should handle RESTORE_SESSION by merging progress with existing definitions', () => {
    // initialState uses 'Test Task' and 300s
    const restoredTasks: Task[] = [
      {
        ...mockTask,
        name: 'Old Task Name',
        plannedSeconds: 10,
        status: 'running',
        elapsedSeconds: 100,
      },
    ];
    const action: Action = {
      type: 'RESTORE_SESSION',
      tasks: restoredTasks,
      selectedTaskId: '1',
      isTimerRunning: true,
      lastTickTimestamp: 123456789,
    };
    const newState = timerReducer(initialState, action);

    // Should keep current definition (name, plannedSeconds) but restore progress
    expect(newState.tasks[0].name).toBe('Test Task');
    expect(newState.tasks[0].plannedSeconds).toBe(300);
    expect(newState.tasks[0].status).toBe('running');
    expect(newState.tasks[0].elapsedSeconds).toBe(100);

    expect(newState.selectedTaskId).toBe('1');
    expect(newState.isTimerRunning).toBe(true);
    expect(newState.lastTickTimestamp).toBe(123456789);
  });

  it('should handle SET_TARGET_TIME_SETTINGS', () => {
    const newTargetSettings: TargetTimeSettings = {
      mode: 'target-time',
      targetHour: 20,
      targetMinute: 30,
    };
    const action: Action = { type: 'SET_TARGET_TIME_SETTINGS', settings: newTargetSettings };
    const newState = timerReducer(initialState, action);
    expect(newState.targetTimeSettings).toEqual(newTargetSettings);
    // updateRewardTime is called inside, so we check if it doesn't crash and updates state
    expect(newState.tasks).toBeDefined();
  });
});
