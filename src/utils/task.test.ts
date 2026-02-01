/**
 * タスク進捗管理やごほうび時間の計算ロジックのテスト
 */
import { describe, expect, it } from 'vitest';

import type { Task } from '../types';
import {
  calculateOverallProgress,
  calculateRewardSeconds,
  calculateRewardSecondsFromTargetTime,
  hasTaskProgress,
} from './task';

// テスト用のタスクを作成するヘルパー
const createTask = (overrides: Partial<Task>): Task => ({
  id: 'task',
  name: 'Task',
  icon: '',
  plannedSeconds: 300,
  kind: 'todo',
  status: 'todo',
  elapsedSeconds: 0,
  actualSeconds: 0,
  ...overrides,
});

// ごほうび時間の計算ロジック
describe('calculateRewardSeconds', () => {
  it('should add saved time and subtract overruns when todo tasks are processed', () => {
    // Arrange
    const tasks: Task[] = [
      createTask({ id: 'done', status: 'done', plannedSeconds: 300, actualSeconds: 240 }),
      createTask({
        id: 'over',
        status: 'running',
        plannedSeconds: 300,
        elapsedSeconds: 400,
      }),
      createTask({ id: 'reward', kind: 'reward', status: 'todo', plannedSeconds: 600 }),
    ];
    const initialRewardTime = 600;

    // Act
    const result = calculateRewardSeconds(tasks, initialRewardTime);

    // Assert
    expect(result).toBe(560);
  });

  it('should return 0 when the calculated reward seconds would be negative', () => {
    // Arrange
    const tasks: Task[] = [
      createTask({
        id: 'over',
        status: 'running',
        plannedSeconds: 100,
        elapsedSeconds: 250,
      }),
    ];
    const initialRewardTime = 50;

    // Act
    const result = calculateRewardSeconds(tasks, initialRewardTime);

    // Assert
    expect(result).toBe(0);
  });
});

// 全体進捗の計算ロジック
describe('calculateOverallProgress', () => {
  it('should calculate progress using actual and elapsed seconds when tasks are provided', () => {
    // Arrange
    const tasks: Task[] = [
      createTask({ id: 'done', status: 'done', plannedSeconds: 300, actualSeconds: 200 }),
      createTask({ id: 'running', status: 'running', plannedSeconds: 200, elapsedSeconds: 50 }),
      createTask({ id: 'paused', status: 'paused', plannedSeconds: 100, elapsedSeconds: 100 }),
    ];

    // Act
    const result = calculateOverallProgress(tasks);

    // Assert
    expect(result).toBeCloseTo((350 / 600) * 100, 5);
  });

  it('should return 0 when there are no tasks', () => {
    // Arrange
    const tasks: Task[] = [];

    // Act
    const result = calculateOverallProgress(tasks);

    // Assert
    expect(result).toBe(0);
  });
});

// 目標時刻モードのごほうび時間計算
describe('calculateRewardSecondsFromTargetTime', () => {
  it('should subtract todo time from available seconds when target time is given', () => {
    // Arrange
    const current = new Date(2024, 0, 1, 10, 0, 0);
    const targetHour = 11;
    const targetMinute = 0;
    const todoSeconds = 600;

    // Act
    const result = calculateRewardSecondsFromTargetTime(
      targetHour,
      targetMinute,
      current,
      todoSeconds
    );

    // Assert
    expect(result).toBe(3000);
  });

  it('should treat the target time as the next day when it is earlier than the current time', () => {
    // Arrange
    const current = new Date(2024, 0, 1, 10, 0, 0);
    const targetHour = 9;
    const targetMinute = 0;
    const todoSeconds = 3600;

    // Act
    const result = calculateRewardSecondsFromTargetTime(
      targetHour,
      targetMinute,
      current,
      todoSeconds
    );

    // Assert
    expect(result).toBe(79200);
  });
});

describe('hasTaskProgress', () => {
  it('should return true when at least one task is done', () => {
    // Arrange
    const tasks: Task[] = [
      createTask({ id: '1', status: 'done' }),
      createTask({ id: '2', status: 'todo' }),
    ];

    // Act
    const result = hasTaskProgress(tasks);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when at least one task has elapsed time', () => {
    // Arrange
    const tasks: Task[] = [
      createTask({ id: '1', status: 'paused', elapsedSeconds: 10 }),
      createTask({ id: '2', status: 'todo', elapsedSeconds: 0 }),
    ];

    // Act
    const result = hasTaskProgress(tasks);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when no tasks have progress', () => {
    // Arrange
    const tasks: Task[] = [
      createTask({ id: '1', status: 'todo', elapsedSeconds: 0 }),
      createTask({ id: '2', status: 'todo', elapsedSeconds: 0 }),
    ];

    // Act
    const result = hasTaskProgress(tasks);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for empty task list', () => {
    // Arrange
    const tasks: Task[] = [];

    // Act
    const result = hasTaskProgress(tasks);

    // Assert
    expect(result).toBe(false);
  });
});
