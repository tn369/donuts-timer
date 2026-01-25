import React from 'react';
import styles from './DonutTimer.module.css';
import type { TimerShape, TimerColor } from '../types';
import { TimerChunk } from './TimerChunk';

interface DonutTimerProps {
  totalSeconds: number;
  elapsedSeconds: number;
  size?: number;
  strokeWidth?: number;
  isOverdue?: boolean;
  shape?: TimerShape;
  color?: TimerColor;
  children?: React.ReactNode;
}

const CHUNK_MAX = 300; // 5分 = 300秒
const MAX_DISPLAY_CHUNKS = 10; // 最大表示チャンク数

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
  // 計画時間を5分ずつのチャンクに分割
  const chunks: number[] = [];
  let remainingPlanned = totalSeconds;
  while (remainingPlanned > 0) {
    const chunkSize = Math.min(CHUNK_MAX, remainingPlanned);
    chunks.push(chunkSize);
    remainingPlanned -= chunkSize;
  }
  if (chunks.length === 0) chunks.push(0);

  // チャンク数に応じてサイズを調整
  const getBaseMetrics = () => {
    const count = chunks.length;
    if (count === 1) return { size, stroke: strokeWidth };
    if (count === 2) return { size: size * 0.85, stroke: strokeWidth * 0.9 };
    if (count <= 4) return { size: size * 0.7, stroke: strokeWidth * 0.8 };
    if (count <= 9) return { size: size * 0.54, stroke: strokeWidth * 0.7 };
    return { size: size * 0.48, stroke: strokeWidth * 0.6 };
  };

  const { size: baseSize, stroke: baseStrokeWidth } = getBaseMetrics();

  // 残り時間を各チャンクに分配
  const totalRemaining = Math.max(0, totalSeconds - elapsedSeconds);
  const chunkRemaining: number[] = [];
  let tempRemaining = totalRemaining;
  for (const capacity of chunks) {
    const r = Math.min(capacity, tempRemaining);
    chunkRemaining.push(r);
    tempRemaining -= r;
  }

  // 表示するチャンクを決定（最大10個）
  const hasMore = chunks.length > MAX_DISPLAY_CHUNKS;
  const displayChunks = hasMore ? chunks.slice(0, MAX_DISPLAY_CHUNKS - 1) : chunks;
  const displayChunkRemaining = hasMore
    ? chunkRemaining.slice(0, MAX_DISPLAY_CHUNKS - 1)
    : chunkRemaining;

  return (
    <div className={styles.donutTimerGroup}>
      {displayChunks.map((capacity, i) => {
        const currentRemaining = displayChunkRemaining[i];
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
      {hasMore && <div className={styles.donutTimerMore}>...</div>}
    </div>
  );
};
