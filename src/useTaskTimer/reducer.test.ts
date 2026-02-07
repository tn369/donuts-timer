/**
 * timerReducerの動作を確認するためのユニットテスト
 */
import { describe, expect, it } from 'vitest';

import type { TargetTimeSettings, Task, TimerSettings, TodoList } from '../types';
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
  pendingRestorableState: null,
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

  it('should store restorable state when RESTORE_AVAILABLE action is dispatched', () => {
    // Arrange
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
      type: 'RESTORE_AVAILABLE',
      tasks: restoredTasks,
      selectedTaskId: '1',
      isTimerRunning: true,
      lastTickTimestamp: 123456789,
    };

    // Act
    const newState = timerReducer(initialState, action);

    // Assert
    expect(newState.pendingRestorableState).toEqual({
      tasks: restoredTasks,
      selectedTaskId: '1',
      isTimerRunning: true,
      lastTickTimestamp: 123456789,
    });
  });

  it('should merge progress from pending state when RESTORE_SESSION action is dispatched', () => {
    // Arrange
    const restoredTasks: Task[] = [
      {
        ...mockTask,
        name: 'Old Task Name',
        plannedSeconds: 10,
        status: 'running',
        elapsedSeconds: 100,
      },
    ];
    const intermediateState: State = {
      ...initialState,
      pendingRestorableState: {
        tasks: restoredTasks,
        selectedTaskId: '1',
        isTimerRunning: true,
        lastTickTimestamp: 123456789,
      },
    };
    const action: Action = { type: 'RESTORE_SESSION' };

    // Act
    const newState = timerReducer(intermediateState, action);

    // Assert
    // Should keep current definition (name, plannedSeconds) but restore progress
    expect(newState.tasks[0].name).toBe('Test Task');
    expect(newState.tasks[0].plannedSeconds).toBe(300);
    expect(newState.tasks[0].status).toBe('running');
    expect(newState.tasks[0].elapsedSeconds).toBe(100);

    expect(newState.selectedTaskId).toBe('1');
    expect(newState.isTimerRunning).toBe(true);
    expect(newState.lastTickTimestamp).toBe(123456789);
    expect(newState.pendingRestorableState).toBeNull();
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

  it('should maintain isTimerRunning: false when selecting a done task while stopped', () => {
    // Arrange
    const doneTask: Task = { ...mockTask, id: 'done-1', status: 'done', actualSeconds: 100 };
    const stoppedState: State = {
      ...initialState,
      tasks: [doneTask, { ...mockTask, id: 'idle-reward', kind: 'reward', status: 'todo' }],
      selectedTaskId: 'idle-reward',
      isTimerRunning: false,
    };
    const action: Action = { type: 'SELECT_TASK', taskId: 'done-1', now: Date.now() };

    // Act
    const newState = timerReducer(stoppedState, action);

    // Assert
    expect(newState.selectedTaskId).toBe('done-1');
    expect(newState.isTimerRunning).toBe(false);
    expect(newState.tasks.find((t) => t.id === 'done-1')?.status).toBe('todo');
  });

  describe('TICK action', () => {
    it('should increment elapsed seconds of the running task', () => {
      // Arrange
      const startTime = 1000;
      const tickTime = 2500; // 1.5 seconds later
      const runningState: State = {
        ...initialState,
        tasks: [{ ...mockTask, status: 'running' }],
        selectedTaskId: mockTask.id,
        isTimerRunning: true,
        lastTickTimestamp: startTime,
      };
      const action: Action = { type: 'TICK', now: tickTime };

      // Act
      const newState = timerReducer(runningState, action);

      // Assert
      expect(newState.tasks[0].elapsedSeconds).toBe(1); // 1.5s -> 1s
      expect(newState.lastTickTimestamp).toBe(2000); // Progressed by 1s
    });

    it('should complete reward task if elapsed time reaches planned time', () => {
      // Arrange
      const startTime = 1000;
      const tickTime = 2000; // deltaMs = 1000, deltaSeconds = 1
      const rewardTask: Task = {
        ...mockTask,
        id: 'reward-1',
        kind: 'reward',
        status: 'running',
        plannedSeconds: 10,
        elapsedSeconds: 9,
      };
      // activeListを設定することでupdateRewardTimeの影響を制御
      const activeList: TodoList = {
        id: 'list-1',
        title: 'Test List',
        tasks: [rewardTask],
        targetTimeSettings: initialState.targetTimeSettings,
        timerSettings: initialState.timerSettings,
      };
      const runningState: State = {
        ...initialState,
        tasks: [rewardTask],
        selectedTaskId: 'reward-1',
        isTimerRunning: true,
        lastTickTimestamp: startTime,
        activeList,
      };
      const action: Action = { type: 'TICK', now: tickTime };

      // Act
      const newState = timerReducer(runningState, action);

      // Assert
      expect(newState.tasks[0].status).toBe('done');
      expect(newState.isTimerRunning).toBe(false);
      expect(newState.lastTickTimestamp).toBeNull();
    });
  });

  describe('START / STOP / RESET actions', () => {
    it('should start timer and set task to running', () => {
      // Arrange
      const action: Action = { type: 'START', now: 1000 };

      // Act
      const newState = timerReducer(initialState, action);

      // Assert
      expect(newState.isTimerRunning).toBe(true);
      expect(newState.tasks[0].status).toBe('running');
      expect(newState.selectedTaskId).toBe(mockTask.id);
      expect(newState.lastTickTimestamp).toBe(1000);
    });

    it('should stop timer and pause running task', () => {
      // Arrange
      const runningState: State = {
        ...initialState,
        tasks: [{ ...mockTask, status: 'running' }],
        selectedTaskId: mockTask.id,
        isTimerRunning: true,
        lastTickTimestamp: 1000,
      };
      const action: Action = { type: 'STOP' };

      // Act
      const newState = timerReducer(runningState, action);

      // Assert
      expect(newState.isTimerRunning).toBe(false);
      expect(newState.tasks[0].status).toBe('paused');
      expect(newState.lastTickTimestamp).toBeNull();
    });

    it('should reset all tasks when RESET action is dispatched', () => {
      // Arrange
      const activeList: TodoList = {
        id: 'list-1',
        title: 'Title 1',
        tasks: [{ ...mockTask, elapsedSeconds: 100, status: 'done' as const }],
        targetTimeSettings: initialState.targetTimeSettings,
        timerSettings: initialState.timerSettings,
      };
      const stateWithActiveList: State = {
        ...initialState,
        activeList,
        tasks: activeList.tasks,
        selectedTaskId: mockTask.id,
        isTimerRunning: true,
      };
      const action: Action = { type: 'RESET' };

      // Act
      const newState = timerReducer(stateWithActiveList, action);

      // Assert
      expect(newState.tasks[0].elapsedSeconds).toBe(0);
      expect(newState.tasks[0].status).toBe('todo');
      expect(newState.selectedTaskId).toBeNull();
      expect(newState.isTimerRunning).toBe(false);
    });
  });

  describe('UPDATE_ACTIVE_LIST / INIT_LIST actions', () => {
    it('should initialize state with INIT_LIST', () => {
      // Arrange
      const list: TodoList = {
        id: 'list-1',
        title: 'Title 1',
        tasks: [mockTask],
        targetTimeSettings: initialState.targetTimeSettings,
        timerSettings: initialState.timerSettings,
      };
      const action: Action = { type: 'INIT_LIST', list };

      // Act
      const newState = timerReducer(initialState, action);

      // Assert
      expect(newState.activeList).toEqual(list);
      expect(newState.tasks[0].status).toBe('todo');
    });

    it('should merge existing progress when UPDATE_ACTIVE_LIST is dispatched', () => {
      // Arrange
      const existingTask = { ...mockTask, status: 'done' as const, elapsedSeconds: 300 };
      const stateWithProgress: State = {
        ...initialState,
        tasks: [existingTask],
      };
      const newList: TodoList = {
        id: 'list-1',
        title: 'Title 1',
        tasks: [{ ...mockTask, name: 'Updated Name' }],
        targetTimeSettings: initialState.targetTimeSettings,
        timerSettings: initialState.timerSettings,
      };
      const action: Action = { type: 'UPDATE_ACTIVE_LIST', list: newList };

      // Act
      const newState = timerReducer(stateWithProgress, action);

      // Assert
      expect(newState.tasks[0].name).toBe('Updated Name');
      expect(newState.tasks[0].status).toBe('done');
      expect(newState.tasks[0].elapsedSeconds).toBe(300);
    });
  });

  describe('Complex SELECT_TASK scenarios', () => {
    it('should not allow selecting a reward task if incomplete tasks exist before it', () => {
      // Arrange
      const rewardTask: Task = { ...mockTask, id: 'reward-1', kind: 'reward' };
      const stateWithIncomplete: State = {
        ...initialState,
        tasks: [mockTask, rewardTask],
      };
      const action: Action = { type: 'SELECT_TASK', taskId: 'reward-1', now: 1000 };

      // Act
      const newState = timerReducer(stateWithIncomplete, action);

      // Assert
      expect(newState.selectedTaskId).toBeNull(); // Should not change
    });

    it('should auto-select next task when current task is completed', () => {
      // Arrange
      const task1: Task = { ...mockTask, id: '1', status: 'running' };
      const task2: Task = { ...mockTask, id: '2', status: 'todo' };
      const runningState: State = {
        ...initialState,
        tasks: [task1, task2],
        selectedTaskId: '1',
        isTimerRunning: true,
      };
      const action: Action = { type: 'SELECT_TASK', taskId: '1', now: 1000 };

      // Act
      const newState = timerReducer(runningState, action);

      // Assert
      expect(newState.tasks[0].status).toBe('done');
      expect(newState.selectedTaskId).toBe('2');
      expect(newState.tasks[1].status).toBe('running');
    });
  });

  describe('FAST_FORWARD action', () => {
    it('should jump forward in time for selected task', () => {
      // Arrange
      const stateWithSelected: State = {
        ...initialState,
        tasks: [{ ...mockTask, status: 'running', plannedSeconds: 300, elapsedSeconds: 0 }],
        selectedTaskId: mockTask.id,
        isTimerRunning: true,
      };
      const action: Action = { type: 'FAST_FORWARD' };

      // Act
      const newState = timerReducer(stateWithSelected, action);

      // Assert
      expect(newState.tasks[0].elapsedSeconds).toBeGreaterThan(0);
    });
  });
});
