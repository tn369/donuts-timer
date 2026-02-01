/**
 * タスク進捗管理やごほうび時間の計算ロジックのテスト
 */
import { describe, expect, it } from 'vitest';

import type { Task } from '../types';
import {
  calculateOverallProgress,
  calculateRewardSeconds,
  calculateRewardSecondsFromTargetTime,
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
  it('adds saved time and subtracts overruns for todo tasks', () => {
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

  it('never returns less than zero', () => {
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
  it('calculates progress using actual and elapsed seconds', () => {
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

  it('returns 0 when there is no planned time', () => {
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
  it('subtracts todo time from available seconds before target time', () => {
    // Arrange
    const current = new Date(2024, 0, 1, 10, 0, 0);
    const targetHour = 11;
    const targetMinute = 0;
    const todoSeconds = 600;

    // Act
    const result = calculateRewardSecondsFromTargetTime(targetHour, targetMinute, current, todoSeconds);

    // Assert
    expect(result).toBe(3000);
  });

  it('treats earlier target time as next day', () => {
    // Arrange
    const current = new Date(2024, 0, 1, 10, 0, 0);
    const targetHour = 9;
    const targetMinute = 0;
    const todoSeconds = 3600;

    // Act
    const result = calculateRewardSecondsFromTargetTime(targetHour, targetMinute, current, todoSeconds);

    // Assert
    expect(result).toBe(79200);
  });
});
