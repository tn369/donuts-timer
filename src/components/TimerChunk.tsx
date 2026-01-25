import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './DonutTimer.module.css';
import type { TimerShape, TimerColor } from '../types';
import { createRenderer } from '../utils/shapeUtils';

interface TimerChunkProps {
  capacity: number;
  currentRemaining: number;
  size: number;
  strokeWidth: number;
  shape: TimerShape;
  color: TimerColor;
  isOverdue: boolean;
  children?: React.ReactNode;
}

const getColorClass = (color: TimerColor) => {
  const colorMap: Record<TimerColor, string> = {
    red: styles.colorRed,
    blue: styles.colorBlue,
    yellow: styles.colorYellow,
    green: styles.colorGreen,
    pink: styles.colorPink,
    purple: styles.colorPurple,
    orange: styles.colorOrange,
    teal: styles.colorTeal,
    indigo: styles.colorIndigo,
    cyan: styles.colorCyan,
    lime: styles.colorLime,
  };
  return colorMap[color] || styles.colorBlue;
};

export const TimerChunk: React.FC<TimerChunkProps> = ({
  capacity,
  currentRemaining,
  size,
  strokeWidth,
  shape,
  color,
  isOverdue,
  children,
}) => {
  const renderer = useMemo(
    () => createRenderer(shape, size, strokeWidth),
    [shape, size, strokeWidth]
  );
  const progress = capacity > 0 ? currentRemaining / capacity : 0;
  const perimeter = renderer.getPerimeter();
  const offset = perimeter * (1 - progress);
  const ticksCount = renderer.getTicksCount();
  const rotationDegree = 360 / ticksCount;

  const fillClassName = `
    ${styles.donutTimerFill} 
    ${isOverdue ? styles.overdue : ''} 
    ${getColorClass(color)}
  `.trim();

  const renderShape = (componentProps: any, isProgress = false) => {
    const commonProps = {
      className: isProgress ? fillClassName : styles.donutTimerBg,
      strokeWidth: isProgress ? strokeWidth : strokeWidth * 1.1,
      fill: 'none',
      ...componentProps,
    };

    if (isProgress) {
      const motionProps = {
        strokeDasharray: perimeter,
        initial: { strokeDashoffset: 0 },
        animate: { strokeDashoffset: offset },
        transition: { duration: 0.5, ease: 'linear' },
        strokeLinecap: 'butt' as const,
        ...(renderer.type === 'circle'
          ? { transform: `rotate(-90 ${size / 2} ${size / 2})` }
          : { pathLength: perimeter }),
      };

      switch (renderer.type) {
        case 'circle':
          return <motion.circle {...commonProps} {...motionProps} />;
        case 'rect':
          return <motion.rect {...commonProps} {...motionProps} />;
        case 'path':
          return <motion.path {...commonProps} {...motionProps} strokeLinejoin="round" />;
      }
    } else {
      switch (renderer.type) {
        case 'circle':
          return <circle {...commonProps} />;
        case 'rect':
          return <rect {...commonProps} />;
        case 'path':
          return <path {...commonProps} strokeLinejoin="round" />;
      }
    }
  };

  return (
    <div className={styles.donutTimer} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.donutTimerSvg}
      >
        {/* 外枠 */}
        {renderer.type === 'circle' ? (
          <circle
            {...renderer.getOuterProps()}
            fill="none"
            stroke="rgba(0,0,0,0.03)"
            strokeWidth="1"
          />
        ) : renderer.type === 'rect' ? (
          <rect
            {...renderer.getOuterProps()}
            fill="none"
            stroke="rgba(0,0,0,0.03)"
            strokeWidth="1"
          />
        ) : (
          <path
            {...renderer.getOuterProps()}
            fill="none"
            stroke="rgba(0,0,0,0.03)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        )}

        {/* 背景 */}
        {renderShape(renderer.getBackgroundProps())}

        {/* 進捗 */}
        {progress > 0 && renderShape(renderer.getProgressProps(), true)}

        {/* 目盛り */}
        {capacity >= 60 &&
          [...Array(ticksCount)].map((_, j) => (
            <line
              key={j}
              {...renderer.getTickProps(j, rotationDegree)}
              className={styles.donutTimerTick}
              style={{ stroke: 'rgba(0,0,0,0.2)' }}
            />
          ))}
      </svg>
      {children && <div className={styles.donutTimerHole}>{children}</div>}
    </div>
  );
};
