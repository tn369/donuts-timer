/**
 * 時間フォーマットユーティリティのテスト
 */
import { describe, expect, it } from 'vitest';

import { formatTime } from './time';

// 時間表示のフォーマット
describe('formatTime', () => {
  it('formats positive seconds as MM:SS', () => {
    // Arrange
    const seconds = 90;

    // Act
    const result = formatTime(seconds);

    // Assert
    expect(result).toBe('1:30');
  });

  it('formats negative seconds with a minus sign', () => {
    // Arrange
    const seconds = -45;

    // Act
    const result = formatTime(seconds);

    // Assert
    expect(result).toBe('-0:45');
  });

  it('formats zero seconds', () => {
    // Arrange
    const seconds = 0;

    // Act
    const result = formatTime(seconds);

    // Assert
    expect(result).toBe('0:00');
  });
});
