/**
 * タイマーの形状を表すSVGアイコンコンポーネント
 */
import React from 'react';

import type { TimerShape } from '../../types';

/**
 * ShapeIconのプロパティ
 */
interface ShapeIconProps {
  shape: TimerShape; // 表示する形状
  size?: number; // サイズ
  color?: string; // 色
  className?: string; // クラス名
}

/**
 * 形状アイコンを表示するコンポーネント。設定画面やコントロールバーで使用される。
 * @param root0 プロパティオブジェクト
 * @param root0.shape 表示する形状
 * @param root0.size サイズ
 * @param root0.color 色
 * @param root0.className クラス名
 * @returns レンダリングされるJSX要素
 */
export const ShapeIcon: React.FC<ShapeIconProps> = ({
  shape,
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  const center = 12;
  const radius = 9;

  /**
   * 形状の頂点座標を計算する
   * @param sides 頂点数
   * @param rotation 回転（ラジアン）
   * @param isStar 星型にするかどうか
   * @returns 座標文字列
   */
  const getPoints = (sides: number, rotation: number = -Math.PI / 2, isStar = false) => {
    const pts: string[] = [];
    const totalPoints = isStar ? sides * 2 : sides;
    const r = radius;
    const innerR = r * 0.45;

    for (let i = 0; i < totalPoints; i++) {
      let currentR = r;
      if (isStar) {
        currentR = i % 2 === 0 ? r : innerR;
      }
      const angle = rotation + (i * 2 * Math.PI) / totalPoints;
      const x = center + currentR * Math.cos(angle);
      const y = center + currentR * Math.sin(angle);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  /**
   * 形状に応じたSVG要素をレンダリングする
   * @returns SVG要素
   */
  const renderShape = () => {
    switch (shape) {
      case 'square':
        return (
          <rect
            x={center - radius}
            y={center - radius}
            width={radius * 2}
            height={radius * 2}
            rx="2"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        );
      case 'triangle':
        return (
          <polygon
            points={getPoints(3)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 'diamond':
        return (
          <polygon
            points={getPoints(4)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 'pentagon':
        return (
          <polygon
            points={getPoints(5)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 'hexagon':
        return (
          <polygon
            points={getPoints(6)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 'star':
        return (
          <polygon
            points={getPoints(5, -Math.PI / 2, true)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 'heart':
        return (
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 'circle':
      default:
        return (
          <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth="2" />
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: 'block' }}
    >
      {renderShape()}
    </svg>
  );
};
