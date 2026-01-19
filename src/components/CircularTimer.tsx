import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
    totalSeconds: number;
    elapsedSeconds: number;
    size?: number;
    strokeWidth?: number;
    isOverdue?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
    totalSeconds,
    elapsedSeconds,
    size = 100,
    strokeWidth = 10,
    isOverdue = false,
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

    // 残り時間を各チャンクに分配 (残り時間が少ない方から、あるいは合計が合うように)
    // ここでは、最初のチャンクから順に埋めていく (残り13分なら、5, 5, 3)
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

    return (
        <div className="circular-timer-group">
            {displayChunks.map((capacity, i) => {
                const currentRemaining = displayChunkRemaining[i];
                const progress = capacity > 0 ? currentRemaining / capacity : 0;

                // 面積を時間に比例させる: area = pi * r^2 -> r = R * sqrt(time / 5min)
                const baseRadiusMultiplier = Math.sqrt(capacity / CHUNK_MAX);
                const currentSize = size * baseRadiusMultiplier;
                const currentStrokeWidth = strokeWidth * baseRadiusMultiplier;

                const radius = (currentSize - currentStrokeWidth) / 2;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference * (1 - progress);

                return (
                    <div key={i} className="circular-timer" style={{ width: currentSize, height: currentSize }}>
                        <svg width={currentSize} height={currentSize} viewBox={`0 0 ${currentSize} ${currentSize}`} className="circular-timer-svg">
                            {/* 外枠 */}
                            <circle
                                cx={currentSize / 2}
                                cy={currentSize / 2}
                                r={radius + 1}
                                fill="none"
                                stroke="rgba(0,0,0,0.03)"
                                strokeWidth="1"
                            />

                            {/* 背景 */}
                            <circle
                                cx={currentSize / 2}
                                cy={currentSize / 2}
                                r={radius}
                                className="circular-timer-bg"
                                strokeWidth={currentStrokeWidth}
                            />

                            {/* 残り時間 */}
                            <motion.circle
                                cx={currentSize / 2}
                                cy={currentSize / 2}
                                r={radius}
                                className={`circular-timer-fill ${isOverdue ? 'overdue' : ''}`}
                                strokeWidth={currentStrokeWidth}
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: 0 }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 0.5, ease: "linear" }}
                                strokeLinecap="butt"
                            />

                            {/* 目盛り (5分計の場合のみ、あるいはサイズに応じて調整) */}
                            {capacity >= 60 && [...Array(12)].map((_, j) => (
                                <line
                                    key={j}
                                    x1={currentSize / 2}
                                    y1={currentSize / 2 - radius - currentStrokeWidth / 2}
                                    x2={currentSize / 2}
                                    y2={currentSize / 2 - radius + currentStrokeWidth / 2}
                                    transform={`rotate(${j * 30} ${currentSize / 2} ${currentSize / 2})`}
                                    className="circular-timer-tick"
                                    style={{ stroke: j % 3 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)' }}
                                />
                            ))}
                        </svg>


                    </div>
                );
            })}
            {hasMore && (
                <div className="circular-timer-more">
                    ...
                </div>
            )}
        </div>
    );
};
