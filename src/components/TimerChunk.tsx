/**
 * タイマーの「破片（チャンク）」を描画するコンポーネント。SVGを使用して様々な形状を描画する。
 */
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import type { TimerColor, TimerShape } from '../types';
import type { ShapeRenderer, SVGRenderProps } from '../utils/shapeUtils';
import { createRenderer } from '../utils/shapeUtils';
import styles from './DonutTimer.module.css';

/**
 * TimerChunkのプロパティ
 */
interface TimerChunkProps {
  capacity: number; // このチャンクの最大秒数
  currentRemaining: number; // このチャンクの残り秒数
  size: number; // 表示サイズ
  strokeWidth: number; // 線の太さ
  shape: TimerShape; // 形状
  color: TimerColor; // カラー
  isOverdue: boolean; // 時間超過しているかどうか
  children?: React.ReactNode; // 中央に表示する要素
}

/**
 * カラー名からCSSクラス名を取得する
 */
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

/**
 * プログレス表示部分の形状を描画する内部コンポーネント
 * ほとんどの図形で butt linecap を使用（視認性向上）
 * ハートのみ round linecap を使用（下部尖端の保護）
 */
const ProgressShape: React.FC<{
  renderer: ShapeRenderer;
  commonProps: SVGRenderProps;
  perimeter: number;
  offset: number;
  strokeWidth: number;
}> = ({ renderer, commonProps, perimeter, offset, strokeWidth }) => {
  const linecap = renderer.getLinecap();
  const transform = renderer.getProgressTransform();
  const pathLength = renderer.getPathLength();
  const needsLinejoin = renderer.needsStrokeLinejoin();

  const motionProps = {
    strokeDasharray: perimeter,
    initial: { strokeDashoffset: 0 },
    animate: { strokeDashoffset: offset },
    transition: { duration: 0.5, ease: 'linear' as const },
    strokeLinecap: linecap,
    ...(transform && { transform }),
    ...(pathLength !== undefined && { pathLength }),
    ...(needsLinejoin && { strokeLinejoin: 'round' as const }),
    strokeWidth,
  };

  const MotionElement = motion[
    renderer.svgElementType as keyof typeof motion
  ] as React.ComponentType<typeof commonProps & typeof motionProps>;

  return <MotionElement {...commonProps} {...motionProps} />;
};

/**
 * 背景部分の形状を描画する内部コンポーネント
 */
const BgShape: React.FC<{
  renderer: ShapeRenderer;
  commonProps: SVGRenderProps;
  strokeWidth: number;
}> = ({ renderer, commonProps, strokeWidth }) => {
  const props = {
    ...commonProps,
    strokeWidth: strokeWidth * 1.1,
    ...(renderer.needsStrokeLinejoin() && { strokeLinejoin: 'round' as const }),
  };

  const ElementType = renderer.svgElementType;
  const Component = ElementType as React.ElementType;
  return <Component {...props} />;
};

/**
 * 外枠の境界線を描画する内部コンポーネント
 */
const OuterBorder: React.FC<{ renderer: ShapeRenderer }> = ({ renderer }) => {
  const common = {
    fill: 'none',
    stroke: 'rgba(0,0,0,0.03)',
    strokeWidth: '1',
    ...(renderer.needsStrokeLinejoin() && { strokeLinejoin: 'round' as const }),
  } as SVGRenderProps;
  const props = renderer.getOuterProps();

  const ElementType = renderer.svgElementType;
  const Component = ElementType as React.ElementType;
  return <Component {...props} {...common} />;
};

/**
 * タイマーの1つのチャンク（5分単位など）を表示するコンポーネント
 */
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
          <>
            <ProgressShape
              renderer={renderer}
              commonProps={{
                className: fillClassName,
                fill: 'none',
                ...renderer.getProgressProps(),
              }}
              perimeter={perimeter}
              offset={offset}
              strokeWidth={strokeWidth}
            />
          </>
        )}
        {capacity >= 60 &&
          Array.from({ length: ticksCount }).map((_, j) => (
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
