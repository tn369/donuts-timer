import React from 'react';

import type { TimerColor, TimerShape } from '../../types';
import { calculateChunkRemaining, calculateChunks, getBaseMetrics } from '../../utils/timerLogic';
import styles from './DonutTimer.module.css';
import { TimerChunk } from './TimerChunk';

/**
 * DonutTimerのプロパティ
 */
interface DonutTimerProps {
  totalSeconds: number; // 合計秒数
  elapsedSeconds: number; // 経過秒数
  size?: number; // 基本サイズ
  strokeWidth?: number; // 線の太さ
  isOverdue?: boolean; // 時間超過しているかどうか
  shape?: TimerShape; // 形状
  color?: TimerColor; // 色
  children?: React.ReactNode; // 中央に表示する要素
}

const MAX_DISPLAY_CHUNKS = 10; // 最大表示チャンク数

/**
 * ドーナツ型（または多角形）のタイマーを表示するコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.totalSeconds 合計予定秒数
 * @param root0.elapsedSeconds 経過秒数
 * @param root0.size 表示サイズ
 * @param root0.strokeWidth 線の太さ
 * @param root0.isOverdue 時間超過しているかどうか
 * @param root0.shape タイマーの形状
 * @param root0.color タイマーの色
 * @param root0.children 中央に表示する子要素
 * @returns レンダリングされるJSX要素
 */
export const DonutTimer: React.FC<DonutTimerProps> = ({
  totalSeconds,
  elapsedSeconds,
  size = 100,
  strokeWidth = 10,
  isOverdue = false,
  shape = 'circle',
  color = 'blue',
  children,
}) => {
  const chunks = calculateChunks(totalSeconds);
  const { size: baseSize, stroke: baseStrokeWidth } = getBaseMetrics(
    chunks.length,
    size,
    strokeWidth
  );
  const chunkRemaining = calculateChunkRemaining(chunks, elapsedSeconds, totalSeconds);

  const hasMore = chunks.length > MAX_DISPLAY_CHUNKS;
  const displayChunks = hasMore ? chunks.slice(0, MAX_DISPLAY_CHUNKS - 1) : chunks;
  const displayChunkRemaining = hasMore
    ? chunkRemaining.slice(0, MAX_DISPLAY_CHUNKS - 1)
    : chunkRemaining;

  return (
    <div className={styles.donutTimerGroup} data-testid="donut-timer-group">
      {displayChunks.map((capacity, i) => {
        const currentRemaining = displayChunkRemaining[i];
        const CHUNK_MAX = 300; // 5分 = 300秒
        const baseRadiusMultiplier = Math.sqrt(capacity / CHUNK_MAX);
        const currentSize = baseSize * baseRadiusMultiplier;
        const shapeStrokeMultiplier = shape === 'star' ? 0.8 : 1.0;
        const currentStrokeWidth = baseStrokeWidth * baseRadiusMultiplier * shapeStrokeMultiplier;

        return (
          <TimerChunk
            key={i}
            capacity={capacity}
            currentRemaining={currentRemaining}
            size={currentSize}
            strokeWidth={currentStrokeWidth}
            shape={shape}
            color={color}
            isOverdue={isOverdue}
          >
            {i === 0 && children}
          </TimerChunk>
        );
      })}
      {hasMore && (
        <div className={styles.donutTimerMore} data-testid="donut-timer-more">
          ...
        </div>
      )}
    </div>
  );
};
