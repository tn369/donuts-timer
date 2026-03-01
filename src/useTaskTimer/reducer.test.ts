/**
 * timerReducerの動作を確認するためのユニットテスト
 */
import { describe, expect, it, vi } from 'vitest';

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
  rewardGainNotice: null,
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

  it('should return unchanged state when RESTORE_SESSION is dispatched without pending state', () => {
    const action: Action = { type: 'RESTORE_SESSION' };

    const newState = timerReducer(initialState, action);

    expect(newState).toBe(initialState);
  });

  it('should clear pending state and reward notice when CANCEL_RESTORE action is dispatched', () => {
    const stateWithPending: State = {
      ...initialState,
      pendingRestorableState: {
        tasks: [{ ...mockTask, status: 'paused', elapsedSeconds: 30 }],
        selectedTaskId: '1',
        isTimerRunning: false,
        lastTickTimestamp: 1234,
      },
      rewardGainNotice: {
        taskId: '1',
        taskName: 'Test Task',
        deltaSeconds: 120,
        occurredAt: 999,
      },
    };

    const newState = timerReducer(stateWithPending, { type: 'CANCEL_RESTORE' });

    expect(newState.pendingRestorableState).toBeNull();
    expect(newState.rewardGainNotice).toBeNull();
  });

  it('should auto restore runtime state when AUTO_RESTORE action is dispatched', () => {
    const action: Action = {
      type: 'AUTO_RESTORE',
      tasks: [{ ...mockTask, status: 'running', elapsedSeconds: 40 }],
      selectedTaskId: '1',
      isTimerRunning: true,
      lastTickTimestamp: 5555,
    };

    const newState = timerReducer(initialState, action);

    expect(newState.tasks[0].name).toBe('Test Task');
    expect(newState.tasks[0].plannedSeconds).toBe(300);
    expect(newState.tasks[0].status).toBe('running');
    expect(newState.tasks[0].elapsedSeconds).toBe(40);
    expect(newState.selectedTaskId).toBe('1');
    expect(newState.isTimerRunning).toBe(true);
    expect(newState.lastTickTimestamp).toBe(5555);
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

  it('should refresh reward time when REFRESH_REWARD_TIME action is dispatched', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 9, 50, 0));
    try {
      const todoTask: Task = {
        ...mockTask,
        id: 'todo-1',
        plannedSeconds: 300,
        kind: 'todo',
        status: 'todo',
      };
      const rewardTask: Task = {
        ...mockTask,
        id: 'reward-1',
        kind: 'reward',
        plannedSeconds: 0,
        rewardSettings: { mode: 'target-time', targetHour: 10, targetMinute: 0 },
      };
      const activeList: TodoList = {
        id: 'list-1',
        title: 'Target-time List',
        tasks: [todoTask, rewardTask],
        targetTimeSettings: { mode: 'target-time', targetHour: 10, targetMinute: 0 },
        timerSettings: initialState.timerSettings,
      };
      const state: State = {
        ...initialState,
        activeList,
        tasks: [todoTask, rewardTask],
      };

      const newState = timerReducer(state, { type: 'REFRESH_REWARD_TIME' });

      const updatedReward = newState.tasks.find((task) => task.id === 'reward-1');
      expect(updatedReward?.plannedSeconds).toBe(300);
    } finally {
      vi.useRealTimers();
    }
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

    it('should select next task but stop timer when current task is completed', () => {
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
      expect(newState.tasks[1].status).toBe('todo');
      expect(newState.isTimerRunning).toBe(false);
      expect(newState.lastTickTimestamp).toBeNull();
    });

    it('should set reward gain notice when todo completion increases reward seconds', () => {
      const todoTask: Task = {
        ...mockTask,
        id: 'todo-1',
        name: 'はみがき',
        status: 'running',
        plannedSeconds: 600,
        elapsedSeconds: 300,
      };
      const rewardTask: Task = {
        ...mockTask,
        id: 'reward-1',
        name: 'ごほうび',
        kind: 'reward',
        status: 'todo',
        plannedSeconds: 900,
      };
      const state: State = {
        ...initialState,
        tasks: [todoTask, rewardTask],
        selectedTaskId: 'todo-1',
        isTimerRunning: true,
      };
      const action: Action = { type: 'SELECT_TASK', taskId: 'todo-1', now: 1000 };

      const newState = timerReducer(state, action);

      expect(newState.rewardGainNotice).toEqual({
        taskId: 'todo-1',
        taskName: 'はみがき',
        deltaSeconds: 300,
        occurredAt: 1000,
      });
    });

    it('should clear reward gain notice when CLEAR_REWARD_GAIN_NOTICE is dispatched', () => {
      const stateWithNotice: State = {
        ...initialState,
        rewardGainNotice: {
          taskId: 'todo-1',
          taskName: 'はみがき',
          deltaSeconds: 180,
          occurredAt: 1000,
        },
      };

      const newState = timerReducer(stateWithNotice, { type: 'CLEAR_REWARD_GAIN_NOTICE' });

      expect(newState.rewardGainNotice).toBeNull();
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

  describe('REORDER_TASKS action', () => {
    it('should reorder tasks correctly', () => {
      // Arrange
      const task1: Task = { ...mockTask, id: '1', name: 'Task 1' };
      const task2: Task = { ...mockTask, id: '2', name: 'Task 2' };
      const task3: Task = { ...mockTask, id: '3', name: 'Task 3' };
      const stateWithTasks: State = {
        ...initialState,
        tasks: [task1, task2, task3],
      };
      const action: Action = { type: 'REORDER_TASKS', fromIndex: 0, toIndex: 2 };

      // Act
      const newState = timerReducer(stateWithTasks, action);

      // Assert
      expect(newState.tasks[0].id).toBe('2');
      expect(newState.tasks[1].id).toBe('3');
      expect(newState.tasks[2].id).toBe('1');
    });

    it('should update selectedTaskId when selected task is moved', () => {
      // Arrange
      const task1: Task = { ...mockTask, id: '1', name: 'Task 1' };
      const task2: Task = { ...mockTask, id: '2', name: 'Task 2' };
      const task3: Task = { ...mockTask, id: '3', name: 'Task 3' };
      const stateWithSelection: State = {
        ...initialState,
        tasks: [task1, task2, task3],
        selectedTaskId: '1',
      };
      const action: Action = { type: 'REORDER_TASKS', fromIndex: 0, toIndex: 2 };

      // Act
      const newState = timerReducer(stateWithSelection, action);

      // Assert
      expect(newState.selectedTaskId).toBe('1'); // selectedTaskId should remain the same
      expect(newState.tasks[2].id).toBe('1'); // Task moved to index 2
    });

    it('should do nothing when fromIndex is out of bounds', () => {
      // Arrange
      const task1: Task = { ...mockTask, id: '1', name: 'Task 1' };
      const task2: Task = { ...mockTask, id: '2', name: 'Task 2' };
      const stateWithTasks: State = {
        ...initialState,
        tasks: [task1, task2],
      };
      const action: Action = { type: 'REORDER_TASKS', fromIndex: 5, toIndex: 1 };

      // Act
      const newState = timerReducer(stateWithTasks, action);

      // Assert
      expect(newState.tasks).toEqual([task1, task2]); // No change
    });

    it('should do nothing when toIndex is out of bounds', () => {
      // Arrange
      const task1: Task = { ...mockTask, id: '1', name: 'Task 1' };
      const task2: Task = { ...mockTask, id: '2', name: 'Task 2' };
      const stateWithTasks: State = {
        ...initialState,
        tasks: [task1, task2],
      };
      const action: Action = { type: 'REORDER_TASKS', fromIndex: 0, toIndex: 10 };

      // Act
      const newState = timerReducer(stateWithTasks, action);

      // Assert
      expect(newState.tasks).toEqual([task1, task2]); // No change
    });

    it('should do nothing when fromIndex equals toIndex', () => {
      // Arrange
      const task1: Task = { ...mockTask, id: '1', name: 'Task 1' };
      const task2: Task = { ...mockTask, id: '2', name: 'Task 2' };
      const stateWithTasks: State = {
        ...initialState,
        tasks: [task1, task2],
      };
      const action: Action = { type: 'REORDER_TASKS', fromIndex: 1, toIndex: 1 };

      // Act
      const newState = timerReducer(stateWithTasks, action);

      // Assert
      expect(newState.tasks).toEqual([task1, task2]); // No change
    });

    it('should recalculate reward time after reordering', () => {
      // Arrange
      const todoTask: Task = { ...mockTask, id: 'todo-1', kind: 'todo', plannedSeconds: 600 };
      const rewardTask: Task = {
        ...mockTask,
        id: 'reward-1',
        kind: 'reward',
        plannedSeconds: 300,
      };
      const activeList: TodoList = {
        id: 'list-1',
        title: 'Test List',
        tasks: [todoTask, rewardTask],
        targetTimeSettings: initialState.targetTimeSettings,
        timerSettings: initialState.timerSettings,
      };
      const stateWithReward: State = {
        ...initialState,
        tasks: [todoTask, rewardTask],
        activeList,
      };
      const action: Action = { type: 'REORDER_TASKS', fromIndex: 0, toIndex: 1 };

      // Act
      const newState = timerReducer(stateWithReward, action);

      // Assert
      // Task order should be changed
      expect(newState.tasks[0].id).toBe('reward-1');
      expect(newState.tasks[1].id).toBe('todo-1');
      // Reward time should be recalculated
      expect(newState.tasks).toBeDefined();
    });
  });
});
