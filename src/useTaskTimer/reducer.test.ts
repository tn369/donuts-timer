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
  it('should update timer settings when SET_TIMER_SETTINGS action is dispatched', () => {
    // Arrange
    const newSettings: TimerSettings = { shape: 'star', color: 'pink' };
    const action: Action = { type: 'SET_TIMER_SETTINGS', settings: newSettings };

    // Act
    const newState = timerReducer(initialState, action);

    // Assert
    expect(newState.timerSettings).toEqual(newSettings);
  });

  it('should update tasks when SET_TASKS action is dispatched', () => {
    // Arrange
    const newTasks: Task[] = [{ ...mockTask, id: '2', name: 'New Task' }];
    const action: Action = { type: 'SET_TASKS', tasks: newTasks };

    // Act
    const newState = timerReducer(initialState, action);

    // Assert
    expect(newState.tasks).toEqual(newTasks);
  });

  it('should merge progress with existing definitions when RESTORE_SESSION action is dispatched', () => {
    // Arrange
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

    // Act
    const newState = timerReducer(initialState, action);

    // Assert
    // Should keep current definition (name, plannedSeconds) but restore progress
    expect(newState.tasks[0].name).toBe('Test Task');
    expect(newState.tasks[0].plannedSeconds).toBe(300);
    expect(newState.tasks[0].status).toBe('running');
    expect(newState.tasks[0].elapsedSeconds).toBe(100);

    expect(newState.selectedTaskId).toBe('1');
    expect(newState.isTimerRunning).toBe(true);
    expect(newState.lastTickTimestamp).toBe(123456789);
  });

  it('should update target time settings when SET_TARGET_TIME_SETTINGS action is dispatched', () => {
    // Arrange
    const newTargetSettings: TargetTimeSettings = {
      mode: 'target-time',
      targetHour: 20,
      targetMinute: 30,
    };
    const action: Action = { type: 'SET_TARGET_TIME_SETTINGS', settings: newTargetSettings };

    // Act
    const newState = timerReducer(initialState, action);

    // Assert
    expect(newState.targetTimeSettings).toEqual(newTargetSettings);
    // updateRewardTime is called inside, so we check if it doesn't crash and updates state
    expect(newState.tasks).toBeDefined();
  });
});
