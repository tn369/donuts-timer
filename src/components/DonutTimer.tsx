import React from 'react';
import { motion } from 'framer-motion';
import styles from './DonutTimer.module.css';
import type { TimerTheme } from '../types';

interface DonutTimerProps {
    totalSeconds: number;
    elapsedSeconds: number;
    size?: number;
    strokeWidth?: number;
    isOverdue?: boolean;
    theme?: TimerTheme;
}

export const DonutTimer: React.FC<DonutTimerProps> = ({
    totalSeconds,
    elapsedSeconds,
    size = 100,
    strokeWidth = 10,
    isOverdue = false,
    theme = 'modern',
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
    const displayChunkRemaining = hasMore ? chunkRemaining.slice(0, MAX_DISPLAY_CHUNKS - 1) : chunkRemaining;

    const isClassic = theme === 'classic';
    const isTriangle = theme === 'triangle';

    return (
        <div className={styles.donutTimerGroup}>
            {displayChunks.map((capacity, i) => {
                const currentRemaining = displayChunkRemaining[i];
                const progress = capacity > 0 ? currentRemaining / capacity : 0;

                // 面積を時間に比例させる
                const baseRadiusMultiplier = Math.sqrt(capacity / CHUNK_MAX);
                const currentSize = size * baseRadiusMultiplier;
                const currentStrokeWidth = strokeWidth * baseRadiusMultiplier;

                const center = currentSize / 2;
                const radius = (currentSize - currentStrokeWidth) / 2;
                const side = currentSize - currentStrokeWidth;

                // 周囲の長さ
                let perimeter = 0;
                if (isClassic) {
                    perimeter = 2 * Math.PI * radius;
                } else if (isTriangle) {
                    // 正三角形の辺の長さ s = 2 * R * cos(30) = sqrt(3) * R
                    // Perimeter = 3s = 3 * sqrt(3) * radius
                    perimeter = 3 * Math.sqrt(3) * radius;
                } else {
                    perimeter = 4 * side;
                }
                const offset = perimeter * (1 - progress);

                const getThemeClass = () => {
                    if (isClassic) return styles.themeClassic;
                    if (isTriangle) return styles.themeTriangle;
                    return styles.themeModern;
                };

                const fillClassName = `
                    ${styles.donutTimerFill} 
                    ${isOverdue ? styles.overdue : ''} 
                    ${getThemeClass()}
                `.trim();

                const getTrianglePoints = (r: number) => {
                    const cos30 = Math.sqrt(3) / 2;
                    const v1 = `${center},${center - r}`;
                    const v2 = `${center + r * cos30},${center + 0.5 * r}`;
                    const v3 = `${center - r * cos30},${center + 0.5 * r}`;
                    return `${v1} ${v2} ${v3}`;
                };

                const getTrianglePath = (r: number) => {
                    const cos30 = Math.sqrt(3) / 2;
                    return `M ${center} ${center - r} L ${center + r * cos30} ${center + 0.5 * r} L ${center - r * cos30} ${center + 0.5 * r} Z`;
                };

                return (
                    <div key={i} className={styles.donutTimer} style={{ width: currentSize, height: currentSize }}>
                        <svg width={currentSize} height={currentSize} viewBox={`0 0 ${currentSize} ${currentSize}`} className={styles.donutTimerSvg}>
                            {/* 外枠 */}
                            {isClassic ? (
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius + 1}
                                    fill="none"
                                    stroke="rgba(0,0,0,0.03)"
                                    strokeWidth="1"
                                />
                            ) : isTriangle ? (
                                <polygon
                                    points={getTrianglePoints(radius + 1)}
                                    fill="none"
                                    stroke="rgba(0,0,0,0.03)"
                                    strokeWidth="1"
                                    strokeLinejoin="round"
                                />
                            ) : (
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
                            )}

                            {/* 背景 */}
                            {isClassic ? (
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    className={styles.donutTimerBg}
                                    strokeWidth={currentStrokeWidth}
                                    fill="none"
                                />
                            ) : isTriangle ? (
                                <polygon
                                    points={getTrianglePoints(radius)}
                                    className={styles.donutTimerBg}
                                    strokeWidth={currentStrokeWidth}
                                    fill="none"
                                    strokeLinejoin="round"
                                />
                            ) : (
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
                            )}

                            {/* 残り時間 */}
                            {isClassic ? (
                                <motion.circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    className={fillClassName}
                                    strokeWidth={currentStrokeWidth}
                                    strokeDasharray={perimeter}
                                    initial={{ strokeDashoffset: 0 }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 0.5, ease: "linear" }}
                                    strokeLinecap="butt"
                                    fill="none"
                                    transform={`rotate(-90 ${center} ${center})`}
                                />
                            ) : isTriangle ? (
                                <motion.path
                                    d={getTrianglePath(radius)}
                                    className={fillClassName}
                                    strokeWidth={currentStrokeWidth}
                                    strokeDasharray={perimeter}
                                    initial={{ strokeDashoffset: 0 }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 0.5, ease: "linear" }}
                                    strokeLinecap="butt"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            ) : (
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
                                    transition={{ duration: 0.5, ease: "linear" }}
                                    strokeLinecap="butt"
                                    fill="none"
                                    pathLength={perimeter}
                                />
                            )}

                            {/* 目盛り */}
                            {capacity >= 60 && [...Array(isTriangle ? 3 : 4)].map((_, j) => (
                                <line
                                    key={j}
                                    x1={center}
                                    y1={isClassic ? 0 : currentStrokeWidth / 2}
                                    x2={center}
                                    y2={currentStrokeWidth}
                                    transform={`rotate(${j * (isTriangle ? 120 : 90)} ${center} ${center})`}
                                    className={styles.donutTimerTick}
                                    style={{ stroke: 'rgba(0,0,0,0.2)' }}
                                />
                            ))}
                        </svg>
                    </div>
                );
            })}
            {hasMore && (
                <div className={styles.donutTimerMore}>
                    ...
                </div>
            )}
        </div>
    );
};
