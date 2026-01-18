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
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // 残り時間の割合（0〜1）
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

    // strokeDashoffset: 0 が全周、circumference が 0
    const offset = circumference * (1 - progress);

    return (
        <div className="circular-timer" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="circular-timer-svg">
                {/* 外枠（時計のベゼル風） */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius + 2}
                    fill="none"
                    stroke="rgba(0,0,0,0.03)"
                    strokeWidth="1"
                />

                {/* 背景の円（薄いベース） */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="circular-timer-bg"
                    strokeWidth={strokeWidth}
                />

                {/* 残り時間の表示（赤色） */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className={`circular-timer-fill ${isOverdue ? 'overdue' : ''}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    strokeLinecap="butt" // 時計の針のようにきっちり区切りたい場合は butt がおすすめ
                />

                {/* 時計の目盛り */}
                {[...Array(12)].map((_, i) => (
                    <line
                        key={i}
                        x1={size / 2}
                        y1={size / 2 - radius - strokeWidth / 2}
                        x2={size / 2}
                        y2={size / 2 - radius + strokeWidth / 2}
                        transform={`rotate(${i * 30} ${size / 2} ${size / 2})`}
                        className="circular-timer-tick"
                        style={{ stroke: i % 3 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)' }}
                    />
                ))}
            </svg>

            {icon && (
                <div className="circular-timer-icon-container">
                    <motion.div
                        className="circular-timer-icon"
                        animate={!isOverdue && progress > 0 ? {
                            scale: [1, 1.05, 1],
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        {icon}
                    </motion.div>
                </div>
            )}
        </div>
    );
};
