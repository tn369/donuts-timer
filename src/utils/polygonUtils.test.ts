/**
 * 多角形や星型の頂点計算、パス生成、周長計算のテスト
 */
import { describe, expect, it } from 'vitest';

import { calculatePerimeter, getShapePoints, pointsToPath } from './polygonUtils';

// 多角形・星形の頂点生成
describe('getShapePoints', () => {
  it('creates the expected number of points for polygons', () => {
    const points = getShapePoints(10, 5, 4, 0, false);
    expect(points).toHaveLength(4);
    expect(points[0].x).toBeCloseTo(15, 5);
    expect(points[0].y).toBeCloseTo(10, 5);
  });

  it('creates inner points for star shapes', () => {
    const points = getShapePoints(10, 10, 5, 0, true);
    expect(points).toHaveLength(10);
    const distance = Math.hypot(points[1].x - 10, points[1].y - 10);
    expect(distance).toBeCloseTo(4.5, 5);
  });
});

// SVG パス変換
describe('pointsToPath', () => {
  it('returns a path string for given points', () => {
    expect(
      pointsToPath([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ])
    ).toBe('M 0 0 L 1 1 Z');
  });
});

// 周長計算
describe('calculatePerimeter', () => {
  it('calculates the perimeter of a square', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    expect(calculatePerimeter(square)).toBeCloseTo(4, 5);
  });
});
