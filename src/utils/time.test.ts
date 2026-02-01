/**
 * 時間フォーマットユーティリティのテスト
 */
import { describe, expect, it } from 'vitest';

import { formatTime } from './time';

// 時間表示のフォーマット
describe('formatTime', () => {
  it('should format as MM:SS when positive seconds are given', () => {
    // Arrange
    const seconds = 90;

    // Act
    const result = formatTime(seconds);

    // Assert
    expect(result).toBe('1:30');
  });

  it('should format with a minus sign when negative seconds are given', () => {
    // Arrange
    const seconds = -45;

    // Act
    const result = formatTime(seconds);

    // Assert
    expect(result).toBe('-0:45');
  });

  it('should format as 0:00 when zero seconds are given', () => {
    // Arrange
    const seconds = 0;

    // Act
    const result = formatTime(seconds);

    // Assert
    expect(result).toBe('0:00');
  });
});
