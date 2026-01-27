/**
 * ハート形状パスの生成ユーティリティ。
 */

export const HEART_PERIMETER_FACTOR = 1.2;

export const getHeartPath = (size: number): string => {
  const scale = size / 24;
  return `M ${12 * scale} ${21.35 * scale} l ${-1.45 * scale} ${-1.32 * scale} C ${5.4 * scale} ${15.36 * scale} ${2 * scale} ${12.28 * scale} ${2 * scale} ${8.5 * scale} C ${2 * scale} ${5.42 * scale} ${4.42 * scale} ${3 * scale} ${7.5 * scale} ${3 * scale} c ${1.74 * scale} 0 ${3.41 * scale} ${0.81 * scale} ${4.5 * scale} ${2.09 * scale} C ${13.09 * scale} ${3.81 * scale} ${14.76 * scale} ${3 * scale} ${16.5 * scale} ${3 * scale} C ${19.58 * scale} ${3 * scale} ${22 * scale} ${5.42 * scale} ${22 * scale} ${8.5 * scale} c 0 ${3.78 * scale} ${-3.4 * scale} ${6.86 * scale} ${-8.55 * scale} ${11.54 * scale} L ${12 * scale} ${21.35 * scale} z`;
};

export const approximateHeartPerimeter = (
  radius: number,
  factor: number = HEART_PERIMETER_FACTOR
): number => 2 * Math.PI * radius * factor;
