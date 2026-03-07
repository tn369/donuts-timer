import React from 'react';

import type { TimerColor, TimerShape } from '../../types';
import {
  calculateChunkRemaining,
  calculateChunks,
  fitDonutMetricsToBounds,
  getBaseMetrics,
} from '../../utils/timerLogic';
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
  maxDiameterPx?: number; // 利用可能な最大直径
  children?: React.ReactNode; // 中央に表示する要素
  rewardGainAnimation?: {
    previousTotalSeconds: number;
    deltaSeconds: number;
    phase: 'lazy-add';
  } | null;
}

const MAX_DISPLAY_CHUNKS = 10; // 最大表示チャンク数

const getDisplayChunks = (chunks: number[]) =>
  chunks.length > MAX_DISPLAY_CHUNKS ? chunks.slice(0, MAX_DISPLAY_CHUNKS - 1) : chunks;

const getRewardGainMode = (
  index: number,
  previousDisplayChunkCount: number,
  rewardGainAnimation: DonutTimerProps['rewardGainAnimation']
): 'none' | 'added' | 'expanded' => {
  if (!rewardGainAnimation) {
    return 'none';
  }

  if (index >= previousDisplayChunkCount) {
    return 'added';
  }

  return index === Math.max(0, previousDisplayChunkCount - 1) ? 'expanded' : 'none';
};

const getGroupClassName = (rewardGainAnimation: DonutTimerProps['rewardGainAnimation']) =>
  `${styles.donutTimerGroup} ${rewardGainAnimation ? styles.rewardGainGroup : ''}`.trim();

const renderTimerChunk = ({
  capacity,
  chunkIndex,
  currentRemaining,
  previousDisplayChunkCount,
  baseSize,
  baseStrokeWidth,
  shape,
  color,
  isOverdue,
  maxDiameterPx,
  rewardGainAnimation,
  children,
}: {
  capacity: number;
  chunkIndex: number;
  currentRemaining: number;
  previousDisplayChunkCount: number;
  baseSize: number;
  baseStrokeWidth: number;
  shape: TimerShape;
  color: TimerColor;
  isOverdue: boolean;
  maxDiameterPx?: number;
  rewardGainAnimation: DonutTimerProps['rewardGainAnimation'];
  children?: React.ReactNode;
}) => {
  const CHUNK_MAX = 300; // 5分 = 300秒
  const baseRadiusMultiplier = Math.sqrt(capacity / CHUNK_MAX);
  const desiredSize = baseSize * baseRadiusMultiplier;
  const shapeStrokeMultiplier = shape === 'star' ? 0.8 : 1.0;
  const desiredStrokeWidth = baseStrokeWidth * baseRadiusMultiplier * shapeStrokeMultiplier;
  const { size: currentSize, stroke: currentStrokeWidth } = fitDonutMetricsToBounds(
    desiredSize,
    desiredStrokeWidth,
    maxDiameterPx
  );

  return (
    <TimerChunk
      key={chunkIndex}
      capacity={capacity}
      currentRemaining={currentRemaining}
      size={currentSize}
      strokeWidth={currentStrokeWidth}
      shape={shape}
      color={color}
      isOverdue={isOverdue}
      rewardGainMode={getRewardGainMode(chunkIndex, previousDisplayChunkCount, rewardGainAnimation)}
      chunkIndex={chunkIndex}
    >
      {chunkIndex === 0 && children}
    </TimerChunk>
  );
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
 * @param root0.maxDiameterPx 利用可能な最大直径
 * @param root0.children 中央に表示する子要素
 * @param root0.rewardGainAnimation ごほうび増加アニメーション用の表示情報
 * @returns レンダリングされるJSX要素
 */
/* eslint-disable complexity */
export const DonutTimer: React.FC<DonutTimerProps> = ({
  totalSeconds,
  elapsedSeconds,
  size = 100,
  strokeWidth = 10,
  isOverdue = false,
  shape = 'circle',
  color = 'blue',
  maxDiameterPx,
  children,
  rewardGainAnimation = null,
}) => {
  const chunks = calculateChunks(totalSeconds);
  const previousChunks = rewardGainAnimation
    ? calculateChunks(rewardGainAnimation.previousTotalSeconds)
    : chunks;
  const { size: baseSize, stroke: baseStrokeWidth } = getBaseMetrics(
    chunks.length,
    size,
    strokeWidth
  );
  const chunkRemaining = calculateChunkRemaining(chunks, elapsedSeconds, totalSeconds);

  const hasMore = chunks.length > MAX_DISPLAY_CHUNKS;
  const displayChunks = getDisplayChunks(chunks);
  const displayChunkRemaining = getDisplayChunks(chunkRemaining);
  const previousDisplayChunks = getDisplayChunks(previousChunks);

  return (
    <div
      className={getGroupClassName(rewardGainAnimation)}
      data-testid="donut-timer-group"
      data-reward-gain-phase={rewardGainAnimation?.phase ?? undefined}
    >
      {displayChunks.map((capacity, i) =>
        renderTimerChunk({
          capacity,
          chunkIndex: i,
          currentRemaining: displayChunkRemaining[i],
          previousDisplayChunkCount: previousDisplayChunks.length,
          baseSize,
          baseStrokeWidth,
          shape,
          color,
          isOverdue,
          maxDiameterPx,
          rewardGainAnimation,
          children,
        })
      )}
      {hasMore && (
        <div className={styles.donutTimerMore} data-testid="donut-timer-more">
          ...
        </div>
      )}
    </div>
  );
};
/* eslint-enable complexity */
