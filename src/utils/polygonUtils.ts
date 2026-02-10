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
    let currentRadius = radius;
    if (isStarShape) {
      currentRadius = j % 2 === 0 ? radius : innerRadius;
    }
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
 * 最初の辺の中央から開始し、全ての頂点を経由して戻る
 * これにより butt linecap でも角が切れない
 * @param pts 頂点座標の配列
 * @returns SVGパス文字列
 */
export const pointsToPath = (pts: Point[]): string => {
  if (pts.length < 2) return '';

  // 最初の辺の中点から開始（頂点ではなく辺の中央から）
  const midX = (pts[0].x + pts[1].x) / 2;
  const midY = (pts[0].y + pts[1].y) / 2;

  // 中点から開始 → 2番目の頂点から順に全頂点を経由 → 最初の頂点 → 中点に戻る
  let path = `M ${midX} ${midY}`;
  for (let j = 1; j < pts.length; j++) {
    path += ` L ${pts[j].x} ${pts[j].y}`;
  }
  path += ` L ${pts[0].x} ${pts[0].y}`;
  path += ` L ${midX} ${midY}`;

  return path;
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
