import React from 'react';
import { motion } from 'framer-motion';
import styles from './DonutTimer.module.css';
import type { TimerShape, TimerColor } from '../types';

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
  const CHUNK_MAX = 300; // 5分 = 300秒
  const MAX_DISPLAY_CHUNKS = 10; // 最大表示チャンク数

  // 計画時間を5分ずつのチャンクに分割
  const chunks: number[] = [];
  let remainingPlanned = totalSeconds;
  while (remainingPlanned > 0) {
    const chunkSize = Math.min(CHUNK_MAX, remainingPlanned);
    chunks.push(chunkSize);
    remainingPlanned -= chunkSize;
  }
  if (chunks.length === 0) chunks.push(0);

  // チャンク数に応じてサイズを調整（均等でバランスの良い配置のため）
  const getBaseMetrics = () => {
    const count = chunks.length;
    if (count === 1) return { size: size, stroke: strokeWidth };
    if (count === 2) return { size: 85, stroke: 18 };
    if (count <= 4) return { size: 70, stroke: 16 };
    if (count <= 9) return { size: 54, stroke: 14 };
    return { size: 48, stroke: 12 };
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

  const isCircle = shape === 'circle';
  const isSquare = shape === 'square';
  const isTriangle = shape === 'triangle';
  const isDiamond = shape === 'diamond';
  const isPentagon = shape === 'pentagon';
  const isHexagon = shape === 'hexagon';
  const isStar = shape === 'star';

  return (
    <div className={styles.donutTimerGroup}>
      {displayChunks.map((capacity, i) => {
        const currentRemaining = displayChunkRemaining[i];
        const progress = capacity > 0 ? currentRemaining / capacity : 0;

        // 面積を時間に比例させる
        const baseRadiusMultiplier = Math.sqrt(capacity / CHUNK_MAX);
        const currentSize = baseSize * baseRadiusMultiplier;
        const currentStrokeWidth = baseStrokeWidth * baseRadiusMultiplier;

        const center = currentSize / 2;
        const radius = (currentSize - currentStrokeWidth) / 2;
        const side = currentSize - currentStrokeWidth;

        // 汎用ポリゴン・スター生成
        const getShapePoints = (
          r: number,
          sides: number,
          rotation: number = -Math.PI / 2,
          isStarShape = false
        ) => {
          const pts: { x: number; y: number }[] = [];
          const totalPoints = isStarShape ? sides * 2 : sides;
          const innerR = r * 0.45;

          for (let j = 0; j < totalPoints; j++) {
            const currentR = isStarShape ? (j % 2 === 0 ? r : innerR) : r;
            const angle = rotation + (j * 2 * Math.PI) / totalPoints;
            pts.push({
              x: center + currentR * Math.cos(angle),
              y: center + currentR * Math.sin(angle),
            });
          }
          return pts;
        };

        const pointsToPath = (pts: { x: number; y: number }[]) => {
          return pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        };

        const calculatePerimeter = (pts: { x: number; y: number }[]) => {
          let p = 0;
          for (let j = 0; j < pts.length; j++) {
            const next = pts[(j + 1) % pts.length];
            p += Math.sqrt(Math.pow(next.x - pts[j].x, 2) + Math.pow(next.y - pts[j].y, 2));
          }
          return p;
        };

        // 形状ごとの設定
        let points: { x: number; y: number }[] = [];
        let perimeter = 0;
        let path = '';

        if (isCircle) {
          perimeter = 2 * Math.PI * radius;
        } else if (isSquare) {
          perimeter = 4 * side;
        } else if (isTriangle) {
          points = getShapePoints(radius, 3);
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        } else if (isDiamond) {
          points = getShapePoints(radius, 4, -Math.PI / 2); // 45度回転させなくても-90度から始めれば頂点の一つが上に来る
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        } else if (isPentagon) {
          points = getShapePoints(radius, 5);
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        } else if (isHexagon) {
          points = getShapePoints(radius, 6, -Math.PI / 2);
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        } else if (isStar) {
          points = getShapePoints(radius, 5, -Math.PI / 2, true);
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        }

        const offset = perimeter * (1 - progress);

        const getColorClass = () => {
          switch (color) {
            case 'red':
              return styles.colorRed;
            case 'blue':
              return styles.colorBlue;
            case 'yellow':
              return styles.colorYellow;
            case 'green':
              return styles.colorGreen;
            case 'pink':
              return styles.colorPink;
            case 'purple':
              return styles.colorPurple;
            default:
              return styles.colorBlue;
          }
        };

        const fillClassName = `
                    ${styles.donutTimerFill} 
                    ${isOverdue ? styles.overdue : ''} 
                    ${getColorClass()}
                `.trim();

        return (
          <div
            key={i}
            className={styles.donutTimer}
            style={{ width: currentSize, height: currentSize }}
          >
            <svg
              width={currentSize}
              height={currentSize}
              viewBox={`0 0 ${currentSize} ${currentSize}`}
              className={styles.donutTimerSvg}
            >
              {/* 外枠 */}
              {isCircle ? (
                <circle
                  cx={center}
                  cy={center}
                  r={radius + 1}
                  fill="none"
                  stroke="rgba(0,0,0,0.03)"
                  strokeWidth="1"
                />
              ) : isSquare ? (
                <rect
                  x={currentStrokeWidth / 2 - 1}
                  y={currentStrokeWidth / 2 - 1}
                  width={side + 2}
                  height={side + 2}
                  rx={4}
                  ry={4}
                  fill="none"
                  stroke="rgba(0,0,0,0.03)"
                  strokeWidth="1"
                />
              ) : (
                <path
                  d={pointsToPath(
                    getShapePoints(
                      radius + 1,
                      isStar ? 5 : isTriangle ? 3 : isDiamond ? 4 : isPentagon ? 5 : 6,
                      isHexagon ? -Math.PI / 2 : isDiamond ? -Math.PI / 2 : -Math.PI / 2,
                      isStar
                    )
                  )}
                  fill="none"
                  stroke="rgba(0,0,0,0.03)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              )}

              {/* 背景 */}
              {isCircle ? (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  className={styles.donutTimerBg}
                  strokeWidth={currentStrokeWidth}
                  fill="none"
                />
              ) : isSquare ? (
                <rect
                  x={currentStrokeWidth / 2}
                  y={currentStrokeWidth / 2}
                  width={side}
                  height={side}
                  rx={2}
                  ry={2}
                  className={styles.donutTimerBg}
                  strokeWidth={currentStrokeWidth}
                  fill="none"
                />
              ) : (
                <path
                  d={path}
                  className={styles.donutTimerBg}
                  strokeWidth={currentStrokeWidth}
                  fill="none"
                  strokeLinejoin="round"
                />
              )}

              {/* 残り時間 */}
              {isCircle ? (
                <motion.circle
                  cx={center}
                  cy={center}
                  r={radius}
                  className={fillClassName}
                  strokeWidth={currentStrokeWidth}
                  strokeDasharray={perimeter}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                  strokeLinecap="butt"
                  fill="none"
                  transform={`rotate(-90 ${center} ${center})`}
                />
              ) : isSquare ? (
                <motion.rect
                  x={currentStrokeWidth / 2}
                  y={currentStrokeWidth / 2}
                  width={side}
                  height={side}
                  rx={2}
                  ry={2}
                  className={fillClassName}
                  strokeWidth={currentStrokeWidth}
                  strokeDasharray={perimeter}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                  strokeLinecap="butt"
                  fill="none"
                  pathLength={perimeter}
                />
              ) : (
                <motion.path
                  d={path}
                  className={fillClassName}
                  strokeWidth={currentStrokeWidth}
                  strokeDasharray={perimeter}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}

              {/* 目盛り */}
              {capacity >= 60 &&
                [
                  ...Array(
                    isCircle
                      ? 4
                      : isSquare
                        ? 4
                        : isTriangle
                          ? 3
                          : isDiamond
                            ? 4
                            : isPentagon
                              ? 5
                              : isHexagon
                                ? 6
                                : 5
                  ),
                ].map((_, j) => (
                  <line
                    key={j}
                    x1={center}
                    y1={isCircle ? 0 : currentStrokeWidth / 2}
                    x2={center}
                    y2={currentStrokeWidth}
                    transform={`rotate(${j * (isCircle ? 90 : isSquare ? 90 : isTriangle ? 120 : isDiamond ? 90 : isPentagon ? 72 : isHexagon ? 60 : 72)} ${center} ${center})`}
                    className={styles.donutTimerTick}
                    style={{ stroke: 'rgba(0,0,0,0.2)' }}
                  />
                ))}
            </svg>
            {/* 最初のチャンクの中央に子供（画像など）を配置 */}
            {i === 0 && children && <div className={styles.donutTimerHole}>{children}</div>}
          </div>
        );
      })}
      {hasMore && <div className={styles.donutTimerMore}>...</div>}
    </div>
  );
};
