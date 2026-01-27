import { describe, expect, it } from 'vitest';

import { approximateHeartPerimeter, getHeartPath, HEART_PERIMETER_FACTOR } from './heartPath';

// ハートパス生成
describe('getHeartPath', () => {
  it('returns the expected path for the base size', () => {
    const expected =
      'M 12 21.35 l -1.45 -1.32 C 5.4 15.36 2 12.28 2 8.5 C 2 5.42 4.42 3 7.5 3 c 1.74 0 3.41 0.81 4.5 2.09 C 13.09 3.81 14.76 3 16.5 3 C 19.58 3 22 5.42 22 8.5 c 0 3.78 -3.4 6.86 -8.55 11.54 L 12 21.35 z';

    expect(getHeartPath(24)).toBe(expected);
  });
});

// ハート周長の近似計算
describe('approximateHeartPerimeter', () => {
  it('uses the default factor', () => {
    expect(approximateHeartPerimeter(10)).toBeCloseTo(2 * Math.PI * 10 * HEART_PERIMETER_FACTOR, 5);
  });

  it('allows a custom factor', () => {
    expect(approximateHeartPerimeter(10, 2)).toBeCloseTo(2 * Math.PI * 10 * 2, 5);
  });
});
