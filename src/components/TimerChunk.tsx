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
 * プログレスの開始点に丸いキャップを描画するコンポーネント
 * 円形のみ必要（butt linecap使用のため開始点に丸みを追加）
 * その他の図形はround linecapを使用するため不要
 */
const StartCap: React.FC<{
  renderer: ShapeRenderer;
  size: number;
  strokeWidth: number;
  className: string;
  progress: number;
}> = ({ renderer, size, strokeWidth, className, progress }) => {
  // 円形以外、またはプログレスがほぼ0/完全な場合はキャップ不要
  if (renderer.type !== 'circle') return null;
  if (progress <= 0.001 || progress >= 0.999) return null;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // 12時の位置に小さな円を描画
  return (
    <circle
      cx={center}
      cy={center - radius}
      r={strokeWidth / 2}
      className={className}
      fill="currentColor"
      style={{ stroke: 'none' }}
    />
  );
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
  size: number;
  strokeWidth: number;
  shape: string;
}> = ({ renderer, commonProps, perimeter, offset, size, strokeWidth, shape }) => {
  // ハートのみ round linecap（下部尖端保護）、その他は butt（視認性向上）
  const linecap = shape === 'heart' ? ('round' as const) : ('butt' as const);

  const motionProps = {
    strokeDasharray: perimeter,
    initial: { strokeDashoffset: 0 },
    animate: { strokeDashoffset: offset },
    transition: { duration: 0.5, ease: 'linear' as const },
    strokeLinecap: linecap,
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

/**
 * 背景部分の形状を描画する内部コンポーネント
 */
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

/**
 * 外枠の境界線を描画する内部コンポーネント
 */
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
              commonProps={{ className: fillClassName, fill: 'none', ...renderer.getProgressProps() }}
              perimeter={perimeter}
              offset={offset}
              size={size}
              strokeWidth={strokeWidth}
              shape={shape}
            />
            <StartCap
              renderer={renderer}
              size={size}
              strokeWidth={strokeWidth}
              className={fillClassName}
              progress={progress}
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
