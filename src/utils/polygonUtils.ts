/**
 * 多角形や星型の計算とSVGパス生成のためのユーティリティ
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * 多角形または星型の頂点座標を取得する
 * @param center 中心座標
 * @param radius 半径
 * @param sides 頂点（角）の数
 * @param rotation 回転角度
 * @param isStarShape 星型にするかどうか
 * @returns 頂点座標の配列
 */
export const getShapePoints = (
  center: number,
  radius: number,
  sides: number,
  rotation: number,
  isStarShape: boolean
): Point[] => {
  const pts: Point[] = [];
  const totalPoints = isStarShape ? sides * 2 : sides;
  const innerRadius = radius * 0.45;
  for (let j = 0; j < totalPoints; j++) {
    const currentRadius = isStarShape ? (j % 2 === 0 ? radius : innerRadius) : radius;
    const angle = rotation + (j * 2 * Math.PI) / totalPoints;
    pts.push({
      x: center + currentRadius * Math.cos(angle),
      y: center + currentRadius * Math.sin(angle),
    });
  }
  return pts;
};

/**
 * 頂点座標の配列をSVGパス文字列に変換する
 * @param pts 頂点座標の配列
 * @returns SVGパス文字列
 */
export const pointsToPath = (pts: Point[]): string => {
  return pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
};

/**
 * 頂点座標の配列から外周の長さを計算する
 * @param pts 頂点座標の配列
 * @returns 外周の長さ
 */
export const calculatePerimeter = (pts: Point[]): number => {
  let perimeter = 0;
  for (let j = 0; j < pts.length; j++) {
    const next = pts[(j + 1) % pts.length];
    perimeter += Math.sqrt(Math.pow(next.x - pts[j].x, 2) + Math.pow(next.y - pts[j].y, 2));
  }
  return perimeter;
};
