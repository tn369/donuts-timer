/**
 * 各種図形（円、正方形、多角形、ハート）のレンダラーのテスト
 */
import { describe, expect, it } from 'vitest';

import { approximateHeartPerimeter } from './heartPath';
import {
  CircleRenderer,
  createRenderer,
  HeartRenderer,
  PolygonRenderer,
  SquareRenderer,
} from './shapeUtils';

// 図形レンダラーの生成と計算結果
describe('createRenderer', () => {
  // 正しい外周を持つ円形レンダラーを作成できることを確認
  it('creates a circle renderer with the correct perimeter', () => {
    // Arrange
    const shape = 'circle';
    const size = 100;
    const strokeWidth = 10;

    // Act
    const renderer = createRenderer(shape, size, strokeWidth);

    // Assert
    expect(renderer).toBeInstanceOf(CircleRenderer);
    expect(renderer.getPerimeter()).toBeCloseTo(2 * Math.PI * 45, 5);
  });

  // 正方形レンダラーを作成できることを確認
  it('creates a square renderer', () => {
    // Arrange
    const shape = 'square';
    const size = 100;
    const strokeWidth = 10;

    // Act
    const renderer = createRenderer(shape, size, strokeWidth);

    // Assert
    expect(renderer).toBeInstanceOf(SquareRenderer);
    expect(renderer.getPerimeter()).toBe(360);
  });

  // 三角形のポリゴンレンダラーを作成できることを確認
  it('creates a polygon renderer for triangles', () => {
    // Arrange
    const shape = 'triangle';
    const size = 100;
    const strokeWidth = 10;

    // Act
    const renderer = createRenderer(shape, size, strokeWidth);

    // Assert
    expect(renderer).toBeInstanceOf(PolygonRenderer);
    expect(renderer.getTicksCount()).toBe(3);
  });

  // 5つの頂点を持つスターレンダラーを作成できることを確認
  it('creates a star renderer with 5 ticks', () => {
    // Arrange
    const shape = 'star';
    const size = 100;
    const strokeWidth = 10;

    // Act
    const renderer = createRenderer(shape, size, strokeWidth);

    // Assert
    expect(renderer).toBeInstanceOf(PolygonRenderer);
    expect(renderer.getTicksCount()).toBe(5);
  });

  // 近似外周を持つハート型レンダラーを作成できることを確認
  it('creates a heart renderer with an approximated perimeter', () => {
    // Arrange
    const shape = 'heart';
    const size = 100;
    const strokeWidth = 10;

    // Act
    const renderer = createRenderer(shape, size, strokeWidth);

    // Assert
    expect(renderer).toBeInstanceOf(HeartRenderer);
    expect(renderer.getPerimeter()).toBeCloseTo(approximateHeartPerimeter(45), 5);
  });
});
