/**
 * 形状描画のためのクラスとユーティリティ
 */
import { approximateHeartPerimeter, getHeartPath, HEART_PERIMETER_FACTOR } from './heartPath';
import { calculatePerimeter, getShapePoints, pointsToPath } from './polygonUtils';

export type { Point } from './polygonUtils';

/**
 * SVG属性のプロパティ
 */
export interface SVGRenderProps {
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  rx?: number | string;
  ry?: number | string;
  transform?: string;
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  fill?: string;
  className?: string;
}

/**
 * 形状描画の抽象基底クラス
 */
export abstract class ShapeRenderer {
  protected size: number;
  protected strokeWidth: number;

  constructor(size: number, strokeWidth: number) {
    this.size = size;
    this.strokeWidth = strokeWidth;
  }

  protected get center() {
    return this.size / 2;
  }
  protected get radius() {
    return (this.size - this.strokeWidth) / 2;
  }
  protected get side() {
    return this.size - this.strokeWidth;
  }

  abstract readonly type: 'circle' | 'rect' | 'path';
  abstract getPerimeter(): number;
  abstract getTicksCount(): number;

  /**
   * 背景用のSVG属性を取得する
   */
  abstract getBackgroundProps(): SVGRenderProps;
  /**
   * プログレス表示用のSVG属性を取得する
   */
  abstract getProgressProps(): SVGRenderProps;
  /**
   * 外枠用のSVG属性を取得する
   */
  abstract getOuterProps(): SVGRenderProps;
  /**
   * 目盛り用のSVG属性を取得する
   * @param index 目盛りのインデックス
   * @param rotationDegree 1目盛りあたりの回転角度
   */
  abstract getTickProps(index: number, rotationDegree: number): SVGRenderProps;
}

export class CircleRenderer extends ShapeRenderer {
  readonly type = 'circle';
  getPerimeter() {
    return 2 * Math.PI * this.radius;
  }
  getTicksCount() {
    return 4;
  }

  getBackgroundProps(): SVGRenderProps {
    return { cx: this.center, cy: this.center, r: this.radius };
  }
  getProgressProps(): SVGRenderProps {
    return { cx: this.center, cy: this.center, r: this.radius };
  }
  getOuterProps(): SVGRenderProps {
    return { cx: this.center, cy: this.center, r: this.radius + 1 };
  }
  getTickProps(index: number, rotationDegree: number): SVGRenderProps {
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
  getPerimeter() {
    return 4 * this.side;
  }
  getTicksCount() {
    return 4;
  }

  getBackgroundProps(): SVGRenderProps {
    return {
      x: this.strokeWidth / 2,
      y: this.strokeWidth / 2,
      width: this.side,
      height: this.side,
      rx: 2,
      ry: 2,
    };
  }
  getProgressProps(): SVGRenderProps {
    return {
      x: this.strokeWidth / 2,
      y: this.strokeWidth / 2,
      width: this.side,
      height: this.side,
      rx: 2,
      ry: 2,
    };
  }
  getOuterProps(): SVGRenderProps {
    return {
      x: this.strokeWidth / 2 - 1,
      y: this.strokeWidth / 2 - 1,
      width: this.side + 2,
      height: this.side + 2,
      rx: 4,
      ry: 4,
    };
  }
  getTickProps(index: number, rotationDegree: number): SVGRenderProps {
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
  protected path = '';
  protected outerPath = '';
  protected perimeter = 0;
  protected ticksCount = 5;

  getPerimeter() {
    return this.perimeter;
  }
  getTicksCount() {
    return this.ticksCount;
  }

  getBackgroundProps(): SVGRenderProps {
    return { d: this.path };
  }
  getProgressProps(): SVGRenderProps {
    return { d: this.path };
  }
  getOuterProps(): SVGRenderProps {
    return { d: this.outerPath };
  }
  getTickProps(index: number, rotationDegree: number): SVGRenderProps {
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
    const center = this.center;
    const rotation = -Math.PI / 2;
    const pts = getShapePoints(center, this.radius, sides, rotation, isStar);
    this.path = pointsToPath(pts);
    this.perimeter = calculatePerimeter(pts);
    this.outerPath = pointsToPath(getShapePoints(center, this.radius + 1, sides, rotation, isStar));
  }
}

export class HeartRenderer extends PathRenderer {
  constructor(size: number, strokeWidth: number) {
    super(size, strokeWidth);
    this.ticksCount = 4;
    this.path = getHeartPath(size);
    this.outerPath = getHeartPath(size + 2);
    this.perimeter = approximateHeartPerimeter(this.radius, HEART_PERIMETER_FACTOR);
  }
}

/**
 * 形状名に基づいて適切なレンダラーを作成する
 * @param shape 形状名 ('circle', 'square', 'star', 'heart' など)
 * @param size サイズ
 * @param strokeWidth 線の太さ
 * @returns ShapeRendererのインスタンス
 */
export const createRenderer = (shape: string, size: number, strokeWidth: number): ShapeRenderer => {
  switch (shape) {
    case 'circle':
      return new CircleRenderer(size, strokeWidth);
    case 'square':
      return new SquareRenderer(size, strokeWidth);
    case 'triangle':
      return new PolygonRenderer(size, strokeWidth, 3);
    case 'diamond':
      return new PolygonRenderer(size, strokeWidth, 4);
    case 'pentagon':
      return new PolygonRenderer(size, strokeWidth, 5);
    case 'hexagon':
      return new PolygonRenderer(size, strokeWidth, 6);
    case 'octagon':
      return new PolygonRenderer(size, strokeWidth, 8);
    case 'star':
      return new PolygonRenderer(size, strokeWidth, 5, true);
    case 'heart':
      return new HeartRenderer(size, strokeWidth);
    default:
      return new CircleRenderer(size, strokeWidth);
  }
};
