import { describe, expect, it } from 'vitest';

import {
  calculateChunkRemaining,
  calculateChunks,
  fitDonutMetricsToBounds,
  getBaseMetrics,
} from './timerLogic';

describe('timerLogic', () => {
  describe('calculateChunks', () => {
    it('300秒（5分）以下の場合、1つのチャンクになること', () => {
      expect(calculateChunks(300)).toEqual([300]);
      expect(calculateChunks(150)).toEqual([150]);
    });

    it('300秒を超える場合、5分単位のチャンクに分割されること', () => {
      expect(calculateChunks(600)).toEqual([300, 300]);
      expect(calculateChunks(750)).toEqual([300, 300, 150]);
    });

    it('0秒の場合、0のチャンクが1つ返されること', () => {
      expect(calculateChunks(0)).toEqual([0]);
    });
  });

  describe('calculateChunkRemaining', () => {
    it('経過時間が0の場合、すべてのチャンクが満たされていること', () => {
      const chunks = [300, 300];
      expect(calculateChunkRemaining(chunks, 0, 600)).toEqual([300, 300]);
    });

    it('経過時間が1つのチャンク内の場合、残りが正しく計算されること', () => {
      const chunks = [300, 300];
      expect(calculateChunkRemaining(chunks, 100, 600)).toEqual([300, 200]);
    });

    it('経過時間が複数のチャンクにまたがる場合、残りが正しく計算されること', () => {
      const chunks = [300, 300, 300];
      expect(calculateChunkRemaining(chunks, 400, 900)).toEqual([300, 200, 0]); // 合計残り500秒
    });

    it('すべて経過した場合、すべてのチャンクの残りが0になること', () => {
      const chunks = [300, 300];
      expect(calculateChunkRemaining(chunks, 600, 600)).toEqual([0, 0]);
      expect(calculateChunkRemaining(chunks, 700, 600)).toEqual([0, 0]);
    });
  });

  describe('getBaseMetrics', () => {
    it('チャンク数に応じて適切なスケーリングが返されること', () => {
      // 1チャンク
      expect(getBaseMetrics(1, 100, 10)).toEqual({ size: 100, stroke: 10 });
      // 2チャンク
      expect(getBaseMetrics(2, 100, 10)).toEqual({ size: 85, stroke: 9 });
      // 4チャンク
      expect(getBaseMetrics(4, 100, 10)).toEqual({ size: 70, stroke: 8 });
      // 9チャンク
      expect(getBaseMetrics(9, 100, 10)).toEqual({ size: 54, stroke: 7 });
      // 10チャンク以上
      expect(getBaseMetrics(10, 100, 10)).toEqual({ size: 48, stroke: 6 });
    });
  });

  describe('fitDonutMetricsToBounds', () => {
    it('maxDiameterPxがない場合は希望サイズをそのまま返すこと', () => {
      expect(fitDonutMetricsToBounds(100, 10)).toEqual({ size: 100, stroke: 10 });
    });

    it('利用可能サイズに合わせてサイズと線幅を縮小すること', () => {
      expect(fitDonutMetricsToBounds(100, 20, 72)).toEqual({ size: 60, stroke: 12 });
    });

    it('利用可能サイズが最小サイズより小さい時は利用可能サイズを優先すること', () => {
      const result = fitDonutMetricsToBounds(100, 10, 30);
      expect(result.size).toBe(18);
      expect(result.stroke).toBeCloseTo(1.8);
    });
  });
});
