import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
    totalSeconds: number;
    elapsedSeconds: number;
    size?: number;
    strokeWidth?: number;
    icon?: string | React.ReactNode;
    isOverdue?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
    totalSeconds,
    elapsedSeconds,
    size = 100,
    strokeWidth = 10,
    icon,
    isOverdue = false,
}) => {
    const CHUNK_MAX = 300; // 5分 = 300秒

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

    return (
        <div className="circular-timer-group">
            {chunks.map((capacity, i) => {
                const currentRemaining = chunkRemaining[i];
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

                        {/* アイコンは最初のタイマーにのみ表示 */}
                        {i === 0 && icon && (
                            <div className="circular-timer-icon-container">
                                <motion.div
                                    className="circular-timer-icon"
                                    style={{ fontSize: 40 * baseRadiusMultiplier }}
                                    animate={!isOverdue && progress > 0 ? {
                                        scale: [1, 1.05, 1],
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    {typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/')) ? (
                                        <img
                                            src={icon}
                                            alt=""
                                            style={{
                                                width: 60 * baseRadiusMultiplier,
                                                height: 60 * baseRadiusMultiplier,
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        icon
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
