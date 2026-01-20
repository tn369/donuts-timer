import React from 'react';
import { motion } from 'framer-motion';
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

    return (
        <div className="donut-timer-group">
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
                const perimeter = isClassic ? 2 * Math.PI * radius : 4 * side;
                const offset = perimeter * (1 - progress);

                return (
                    <div key={i} className="donut-timer" style={{ width: currentSize, height: currentSize }}>
                        <svg width={currentSize} height={currentSize} viewBox={`0 0 ${currentSize} ${currentSize}`} className="donut-timer-svg">
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
                                    className="donut-timer-bg"
                                    strokeWidth={currentStrokeWidth}
                                    fill="none"
                                />
                            ) : (
                                    <rect
                                        x={currentStrokeWidth / 2}
                                        y={currentStrokeWidth / 2}
                                        width={side}
                                        height={side}
                                        rx={2}
                                        ry={2}
                                        className="donut-timer-bg"
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
                                    className={`donut-timer-fill ${isOverdue ? 'overdue' : ''} theme-classic`}
                                    strokeWidth={currentStrokeWidth}
                                    strokeDasharray={perimeter}
                                    initial={{ strokeDashoffset: 0 }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 0.5, ease: "linear" }}
                                    strokeLinecap="butt"
                                    fill="none"
                                    transform={`rotate(-90 ${center} ${center})`}
                                />
                            ) : (
                                    <motion.rect
                                        x={currentStrokeWidth / 2}
                                        y={currentStrokeWidth / 2}
                                        width={side}
                                        height={side}
                                        rx={2}
                                        ry={2}
                                        className={`donut-timer-fill ${isOverdue ? 'overdue' : ''} theme-modern`}
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
                            {capacity >= 60 && [...Array(4)].map((_, j) => (
                                <line
                                    key={j}
                                    x1={center}
                                    y1={isClassic ? 0 : currentStrokeWidth / 2}
                                    x2={center}
                                    y2={currentStrokeWidth}
                                    transform={`rotate(${j * 90} ${center} ${center})`}
                                    className="donut-timer-tick"
                                    style={{ stroke: 'rgba(0,0,0,0.2)' }}
                                />
                            ))}
                        </svg>
                    </div>
                );
            })}
            {hasMore && (
                <div className="donut-timer-more">
                    ...
                </div>
            )}
        </div>
    );
};
