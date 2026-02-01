/**
 * 多角形や星型の頂点計算、パス生成、周長計算のテスト
 */
import { describe, expect, it } from 'vitest';

import { calculatePerimeter, getShapePoints, pointsToPath } from './polygonUtils';

// 多角形・星形の頂点生成
describe('getShapePoints', () => {
  it('creates the expected number of points for polygons', () => {
    // Arrange
    const center = 10;
    const radius = 5;
    const sides = 4;
    const rotation = 0;
    const isStar = false;

    // Act
    const points = getShapePoints(center, radius, sides, rotation, isStar);

    // Assert
    expect(points).toHaveLength(sides);
    expect(points[0].x).toBeCloseTo(15, 5);
    expect(points[0].y).toBeCloseTo(10, 5);
  });

  it('creates inner points for star shapes', () => {
    // Arrange
    const center = 10;
    const radius = 10;
    const sides = 5;
    const rotation = 0;
    const isStar = true;

    // Act
    const points = getShapePoints(center, radius, sides, rotation, isStar);

    // Assert
    expect(points).toHaveLength(sides * 2);
    const distance = Math.hypot(points[1].x - center, points[1].y - center);
    expect(distance).toBeCloseTo(4.5, 5);
  });
});

// SVG パス変換
describe('pointsToPath', () => {
  it('returns a path string for given points', () => {
    // Arrange
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];

    // Act
    const result = pointsToPath(points);

    // Assert
    expect(result).toBe('M 0 0 L 1 1 Z');
  });
});

// 周長計算
describe('calculatePerimeter', () => {
  it('calculates the perimeter of a square', () => {
    // Arrange
    const square = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    // Act
    const result = calculatePerimeter(square);

    // Assert
    expect(result).toBeCloseTo(4, 5);
  });
});
