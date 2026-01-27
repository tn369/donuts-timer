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
  it('creates a circle renderer with the correct perimeter', () => {
    const renderer = createRenderer('circle', 100, 10);
    expect(renderer).toBeInstanceOf(CircleRenderer);
    expect(renderer.getPerimeter()).toBeCloseTo(2 * Math.PI * 45, 5);
  });

  it('creates a square renderer', () => {
    const renderer = createRenderer('square', 100, 10);
    expect(renderer).toBeInstanceOf(SquareRenderer);
    expect(renderer.getPerimeter()).toBe(360);
  });

  it('creates a polygon renderer for triangles', () => {
    const renderer = createRenderer('triangle', 100, 10);
    expect(renderer).toBeInstanceOf(PolygonRenderer);
    expect(renderer.getTicksCount()).toBe(3);
  });

  it('creates a star renderer with 5 ticks', () => {
    const renderer = createRenderer('star', 100, 10);
    expect(renderer).toBeInstanceOf(PolygonRenderer);
    expect(renderer.getTicksCount()).toBe(5);
  });

  it('creates a heart renderer with an approximated perimeter', () => {
    const renderer = createRenderer('heart', 100, 10);
    expect(renderer).toBeInstanceOf(HeartRenderer);
    expect(renderer.getPerimeter()).toBeCloseTo(approximateHeartPerimeter(45), 5);
  });
});
