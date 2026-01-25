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

    // 複数チャンクの場合は基本サイズ（sizeプロップ）を基準に縮小
    // 線の太さ（strokeWidth）も、つぶれないように段階的に細く調整する
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

  const isCircle = shape === 'circle';
  const isSquare = shape === 'square';
  const isTriangle = shape === 'triangle';
  const isDiamond = shape === 'diamond';
  const isPentagon = shape === 'pentagon';
  const isHexagon = shape === 'hexagon';
  const isOctagon = shape === 'octagon';
  const isStar = shape === 'star';
  const isHeart = shape === 'heart';

  return (
    <div className={styles.donutTimerGroup}>
      {displayChunks.map((capacity, i) => {
        const currentRemaining = displayChunkRemaining[i];
        const progress = capacity > 0 ? currentRemaining / capacity : 0;

        // 面積を時間に比例させる
        const baseRadiusMultiplier = Math.sqrt(capacity / CHUNK_MAX);
        const currentSize = baseSize * baseRadiusMultiplier;
        // 形状が星型の場合は、線が密集して見えるため少し細く調整する
        const shapeStrokeMultiplier = isStar ? 0.8 : 1.0;
        const currentStrokeWidth = baseStrokeWidth * baseRadiusMultiplier * shapeStrokeMultiplier;

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
        } else if (isOctagon) {
          points = getShapePoints(radius, 8, -Math.PI / 2);
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        } else if (isStar) {
          points = getShapePoints(radius, 5, -Math.PI / 2, true);
          perimeter = calculatePerimeter(points);
          path = pointsToPath(points);
        } else if (isHeart) {
          // ハート型のパス近似（24x24のものをリサイズ）
          const scale = currentSize / 24;
          path = `M ${12 * scale} ${21.35 * scale} l ${-1.45 * scale} ${-1.32 * scale} C ${5.4 * scale} ${15.36 * scale} ${2 * scale} ${12.28 * scale} ${2 * scale} ${8.5 * scale} C ${2 * scale} ${5.42 * scale} ${4.42 * scale} ${3 * scale} ${7.5 * scale} ${3 * scale} c ${1.74 * scale} 0 ${3.41 * scale} ${0.81 * scale} ${4.5 * scale} ${2.09 * scale} C ${13.09 * scale} ${3.81 * scale} ${14.76 * scale} ${3 * scale} ${16.5 * scale} ${3 * scale} C ${19.58 * scale} ${3 * scale} ${22 * scale} ${5.42 * scale} ${22 * scale} ${8.5 * scale} c 0 ${3.78 * scale} ${-3.4 * scale} ${6.86 * scale} ${-8.55 * scale} ${11.54 * scale} L ${12 * scale} ${21.35 * scale} z`;
          // パスの長さを概算（簡易的）
          perimeter = 2 * Math.PI * radius * 1.2;
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
            case 'orange':
              return styles.colorOrange;
            case 'teal':
              return styles.colorTeal;
            case 'indigo':
              return styles.colorIndigo;
            case 'cyan':
              return styles.colorCyan;
            case 'lime':
              return styles.colorLime;
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
                      isStar ? 5 : isTriangle ? 3 : isDiamond ? 4 : isPentagon ? 5 : isHexagon ? 6 : isOctagon ? 8 : 5,
                      -Math.PI / 2,
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
                  strokeWidth={currentStrokeWidth * 1.1}
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
                    strokeWidth={currentStrokeWidth * 1.1}
                  fill="none"
                />
              ) : (
                <path
                  d={path}
                  className={styles.donutTimerBg}
                      strokeWidth={currentStrokeWidth * 1.1}
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
                                : isOctagon
                                  ? 8
                                  : 5
                  ),
              ].map((_, j) => {
                const getTicksCount = () => {
                  if (isCircle) return 4;
                  if (isSquare) return 4;
                  if (isTriangle) return 3;
                  if (isDiamond) return 4;
                  if (isPentagon) return 5;
                  if (isHexagon) return 6;
                  if (isOctagon) return 8;
                  return 5;
                };
                const ticksCount = getTicksCount();
                const rotationDegree = 360 / ticksCount;

                return (
                  <line
                    key={j}
                    x1={center}
                    y1={isCircle ? 0 : currentStrokeWidth / 2}
                    x2={center}
                    y2={currentStrokeWidth}
                      transform={`rotate(${j * rotationDegree} ${center} ${center})`}
                      className={styles.donutTimerTick}
                      style={{ stroke: 'rgba(0,0,0,0.2)' }}
                    />
                  );
                })}
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
