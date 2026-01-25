/**
 * 形状計算のためのクラスとユーティリティ
 */

export interface Point {
  x: number;
  y: number;
}

export abstract class ShapeRenderer {
  protected size: number;
  protected strokeWidth: number;

  constructor(size: number, strokeWidth: number) {
    this.size = size;
    this.strokeWidth = strokeWidth;
  }

  protected get center() { return this.size / 2; }
  protected get radius() { return (this.size - this.strokeWidth) / 2; }
  protected get side() { return this.size - this.strokeWidth; }

  abstract readonly type: 'circle' | 'rect' | 'path';
  abstract getPerimeter(): number;
  abstract getTicksCount(): number;
  
  // SVG要素の属性を取得するメソッド
  abstract getBackgroundProps(): any;
  abstract getProgressProps(): any;
  abstract getOuterProps(): any;
  abstract getTickProps(index: number, rotationDegree: number): any;
}

export class CircleRenderer extends ShapeRenderer {
  readonly type = 'circle';
  getPerimeter() { return 2 * Math.PI * this.radius; }
  getTicksCount() { return 4; }

  getBackgroundProps() {
    return { cx: this.center, cy: this.center, r: this.radius };
  }
  getProgressProps() {
    return { cx: this.center, cy: this.center, r: this.radius };
  }
  getOuterProps() {
    return { cx: this.center, cy: this.center, r: this.radius + 1 };
  }
  getTickProps(index: number, rotationDegree: number) {
    return {
      x1: this.center,
      y1: 0,
      x2: this.center,
      y2: this.strokeWidth,
      transform: `rotate(${index * rotationDegree} ${this.center} ${this.center})`,
    };
  }
}

export class SquareRenderer extends ShapeRenderer {
  readonly type = 'rect';
  getPerimeter() { return 4 * this.side; }
  getTicksCount() { return 4; }

  getBackgroundProps() {
    return { x: this.strokeWidth / 2, y: this.strokeWidth / 2, width: this.side, height: this.side, rx: 2, ry: 2 };
  }
  getProgressProps() {
    return { x: this.strokeWidth / 2, y: this.strokeWidth / 2, width: this.side, height: this.side, rx: 2, ry: 2 };
  }
  getOuterProps() {
    return { x: this.strokeWidth / 2 - 1, y: this.strokeWidth / 2 - 1, width: this.side + 2, height: this.side + 2, rx: 4, ry: 4 };
  }
  getTickProps(index: number, rotationDegree: number) {
    return {
      x1: this.center,
      y1: this.strokeWidth / 2,
      x2: this.center,
      y2: this.strokeWidth,
      transform: `rotate(${index * rotationDegree} ${this.center} ${this.center})`,
    };
  }
}

export class PathRenderer extends ShapeRenderer {
  readonly type = 'path';
  protected path: string = '';
  protected outerPath: string = '';
  protected perimeter: number = 0;
  protected ticksCount: number = 5;

  getPerimeter() { return this.perimeter; }
  getTicksCount() { return this.ticksCount; }

  getBackgroundProps() { return { d: this.path }; }
  getProgressProps() { return { d: this.path }; }
  getOuterProps() { return { d: this.outerPath }; }
  getTickProps(index: number, rotationDegree: number) {
    return {
      x1: this.center,
      y1: this.strokeWidth / 2,
      x2: this.center,
      y2: this.strokeWidth,
      transform: `rotate(${index * rotationDegree} ${this.center} ${this.center})`,
    };
  }
}

export class PolygonRenderer extends PathRenderer {
  constructor(size: number, strokeWidth: number, sides: number, isStar = false) {
    super(size, strokeWidth);
    this.ticksCount = sides;
    const pts = this.getShapePoints(this.radius, sides, -Math.PI / 2, isStar);
    this.path = this.pointsToPath(pts);
    this.perimeter = this.calculatePerimeter(pts);
    this.outerPath = this.pointsToPath(this.getShapePoints(this.radius + 1, sides, -Math.PI / 2, isStar));
  }

  private getShapePoints(r: number, sides: number, rotation: number, isStarShape: boolean): Point[] {
    const pts: Point[] = [];
    const totalPoints = isStarShape ? sides * 2 : sides;
    const innerR = r * 0.45;
    for (let j = 0; j < totalPoints; j++) {
      const currentR = isStarShape ? (j % 2 === 0 ? r : innerR) : r;
      const angle = rotation + (j * 2 * Math.PI) / totalPoints;
      pts.push({ x: this.center + currentR * Math.cos(angle), y: this.center + currentR * Math.sin(angle) });
    }
    return pts;
  }

  private pointsToPath(pts: Point[]): string {
    return pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  }

  private calculatePerimeter(pts: Point[]): number {
    let p = 0;
    for (let j = 0; j < pts.length; j++) {
      const next = pts[(j + 1) % pts.length];
      p += Math.sqrt(Math.pow(next.x - pts[j].x, 2) + Math.pow(next.y - pts[j].y, 2));
    }
    return p;
  }
}

export class HeartRenderer extends PathRenderer {
  constructor(size: number, strokeWidth: number) {
    super(size, strokeWidth);
    this.ticksCount = 4;
    this.path = this.getHeartPath(size);
    this.outerPath = this.getHeartPath(size + 2);
    this.perimeter = 2 * Math.PI * this.radius * 1.2;
  }

  private getHeartPath(size: number): string {
    const scale = size / 24;
    return `M ${12 * scale} ${21.35 * scale} l ${-1.45 * scale} ${-1.32 * scale} C ${5.4 * scale} ${15.36 * scale} ${2 * scale} ${12.28 * scale} ${2 * scale} ${8.5 * scale} C ${2 * scale} ${5.42 * scale} ${4.42 * scale} ${3 * scale} ${7.5 * scale} ${3 * scale} c ${1.74 * scale} 0 ${3.41 * scale} ${0.81 * scale} ${4.5 * scale} ${2.09 * scale} C ${13.09 * scale} ${3.81 * scale} ${14.76 * scale} ${3 * scale} ${16.5 * scale} ${3 * scale} C ${19.58 * scale} ${3 * scale} ${22 * scale} ${5.42 * scale} ${22 * scale} ${8.5 * scale} c 0 ${3.78 * scale} ${-3.4 * scale} ${6.86 * scale} ${-8.55 * scale} ${11.54 * scale} L ${12 * scale} ${21.35 * scale} z`;
  }
}

export const createRenderer = (shape: string, size: number, strokeWidth: number): ShapeRenderer => {
  switch (shape) {
    case 'circle': return new CircleRenderer(size, strokeWidth);
    case 'square': return new SquareRenderer(size, strokeWidth);
    case 'triangle': return new PolygonRenderer(size, strokeWidth, 3);
    case 'diamond': return new PolygonRenderer(size, strokeWidth, 4);
    case 'pentagon': return new PolygonRenderer(size, strokeWidth, 5);
    case 'hexagon': return new PolygonRenderer(size, strokeWidth, 6);
    case 'octagon': return new PolygonRenderer(size, strokeWidth, 8);
    case 'star': return new PolygonRenderer(size, strokeWidth, 5, true);
    case 'heart': return new HeartRenderer(size, strokeWidth);
    default: return new CircleRenderer(size, strokeWidth);
  }
};
