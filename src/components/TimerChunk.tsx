import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import type { TimerColor, TimerShape } from '../types';
import type { ShapeRenderer, SVGRenderProps } from '../utils/shapeUtils';
import { createRenderer } from '../utils/shapeUtils';
import styles from './DonutTimer.module.css';

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

const ProgressShape: React.FC<{
  renderer: ShapeRenderer;
  commonProps: SVGRenderProps;
  perimeter: number;
  offset: number;
  size: number;
  strokeWidth: number;
}> = ({ renderer, commonProps, perimeter, offset, size, strokeWidth }) => {
  const motionProps = {
    strokeDasharray: perimeter,
    initial: { strokeDashoffset: 0 },
    animate: { strokeDashoffset: offset },
    transition: { duration: 0.5, ease: 'linear' as const },
    strokeLinecap: 'butt' as const,
    ...(renderer.type === 'circle'
      ? { transform: `rotate(-90 ${size / 2} ${size / 2})` }
      : { pathLength: perimeter }),
  };

  switch (renderer.type) {
    case 'circle':
      return <motion.circle {...commonProps} {...motionProps} strokeWidth={strokeWidth} />;
    case 'rect':
      return <motion.rect {...commonProps} {...motionProps} strokeWidth={strokeWidth} />;
    case 'path':
      return (
        <motion.path
          {...commonProps}
          {...motionProps}
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      );
    default:
      return null;
  }
};

const BgShape: React.FC<{
  renderer: ShapeRenderer;
  commonProps: SVGRenderProps;
  strokeWidth: number;
}> = ({ renderer, commonProps, strokeWidth }) => {
  const props = { ...commonProps, strokeWidth: strokeWidth * 1.1 };
  switch (renderer.type) {
    case 'circle':
      return <circle {...props} />;
    case 'rect':
      return <rect {...props} />;
    case 'path':
      return <path {...props} strokeLinejoin="round" />;
    default:
      return null;
  }
};

const OuterBorder: React.FC<{ renderer: ShapeRenderer }> = ({ renderer }) => {
  const common = {
    fill: 'none',
    stroke: 'rgba(0,0,0,0.03)',
    strokeWidth: '1',
  } as SVGRenderProps;
  const props = renderer.getOuterProps();
  switch (renderer.type) {
    case 'circle':
      return <circle {...props} {...common} />;
    case 'rect':
      return <rect {...props} {...common} />;
    case 'path':
      return <path {...props} {...common} strokeLinejoin="round" />;
    default:
      return null;
  }
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

  return (
    <div className={styles.donutTimer} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.donutTimerSvg}
      >
        <OuterBorder renderer={renderer} />
        <BgShape
          renderer={renderer}
          commonProps={{
            className: styles.donutTimerBg,
            fill: 'none',
            ...renderer.getBackgroundProps(),
          }}
          strokeWidth={strokeWidth}
        />
        {progress > 0 && (
          <ProgressShape
            renderer={renderer}
            commonProps={{ className: fillClassName, fill: 'none', ...renderer.getProgressProps() }}
            perimeter={perimeter}
            offset={offset}
            size={size}
            strokeWidth={strokeWidth}
          />
        )}
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
