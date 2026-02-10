/**
 * 複数の「チャンク」を組み合わせて時間を視覚化するタイマーコンポーネント
 */
import React from 'react';

import type { TimerColor, TimerShape } from '../../types';
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

const CHUNK_MAX = 300; // 5分 = 300秒
const MAX_DISPLAY_CHUNKS = 10; // 最大表示チャンク数

/**
 * チャンク数に基づいて基本メトリクスを計算する
 * @param count チャンク数
 * @param size 基本サイズ
 * @param strokeWidth 基本の線の太さ
 * @returns 計算されたサイズと線の太さ
 */
const getBaseMetrics = (count: number, size: number, strokeWidth: number) => {
  if (count === 1) return { size, stroke: strokeWidth };
  if (count === 2) return { size: size * 0.85, stroke: strokeWidth * 0.9 };
  if (count <= 4) return { size: size * 0.7, stroke: strokeWidth * 0.8 };
  if (count <= 9) return { size: size * 0.54, stroke: strokeWidth * 0.7 };
  return { size: size * 0.48, stroke: strokeWidth * 0.6 };
};

/**
 * 合計秒数をチャンクに分割する
 * @param totalSeconds 合計秒数
 * @returns チャンクの容量リスト（秒）
 */
const calculateChunks = (totalSeconds: number) => {
  const chunks: number[] = [];
  let remainingPlanned = totalSeconds;
  while (remainingPlanned > 0) {
    const chunkSize = Math.min(CHUNK_MAX, remainingPlanned);
    chunks.push(chunkSize);
    remainingPlanned -= chunkSize;
  }
  if (chunks.length === 0) chunks.push(0);
  return chunks;
};

/**
 * 各チャンクの残り時間を計算する
 * @param chunks チャンクの容量リスト
 * @param elapsedSeconds 既に経過した秒数
 * @param totalSeconds 全体の予定秒数
 * @returns 各チャンクの残り秒数リスト
 */
const calculateChunkRemaining = (
  chunks: number[],
  elapsedSeconds: number,
  totalSeconds: number
) => {
  const totalRemaining = Math.max(0, totalSeconds - elapsedSeconds);
  const chunkRemaining: number[] = [];
  let tempRemaining = totalRemaining;
  for (const capacity of chunks) {
    const r = Math.min(capacity, tempRemaining);
    chunkRemaining.push(r);
    tempRemaining -= r;
  }
  return chunkRemaining;
};

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
