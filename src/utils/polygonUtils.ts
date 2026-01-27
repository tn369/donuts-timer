export interface Point {
  x: number;
  y: number;
}

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

export const pointsToPath = (pts: Point[]): string => {
  return pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
};

export const calculatePerimeter = (pts: Point[]): number => {
  let perimeter = 0;
  for (let j = 0; j < pts.length; j++) {
    const next = pts[(j + 1) % pts.length];
    perimeter += Math.sqrt(Math.pow(next.x - pts[j].x, 2) + Math.pow(next.y - pts[j].y, 2));
  }
  return perimeter;
};
