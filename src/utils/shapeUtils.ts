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

  /**
   * SVG要素のタイプ ('circle' | 'rect' | 'path')
   */
  abstract readonly svgElementType: 'circle' | 'rect' | 'path';
  /**
   * 形状の外周の長さを取得する
   * @returns 外周の長さ（ピクセル）
   */
  abstract getPerimeter(): number;
  /**
   * 目盛りの数を取得する
   * @returns 目盛りの数
   */
  abstract getTicksCount(): number;

  /**
   * 背景用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  abstract getBackgroundProps(): SVGRenderProps;
  /**
   * プログレス表示用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  abstract getProgressProps(): SVGRenderProps;
  /**
   * 外枠用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  abstract getOuterProps(): SVGRenderProps;
  /**
   * 目盛り用のSVG属性を取得する
   * @param index 目盛りのインデックス
   * @param rotationDegree 1目盛りあたりの回転角度
   * @returns SVG属性のプロパティ
   */
  getTickProps(index: number, rotationDegree: number): SVGRenderProps {
    return {
      x1: this.center,
      y1: this.strokeWidth / 2,
      x2: this.center,
      y2: this.strokeWidth,
      transform: `rotate(${index * rotationDegree} ${this.center} ${this.center})`,
    };
  }

  /**
   * stroke-linecapの値を取得する
   * @returns 'butt' または 'round'
   */
  getLinecap(): 'butt' | 'round' {
    return 'butt';
  }

  /**
   * プログレス描画時の追加transform値を取得する
   * @returns transform属性の文字列、またはundefined
   */
  getProgressTransform(): string | undefined {
    return undefined;
  }

  /**
   * pathLength属性の値を取得する（path要素用）
   * @returns pathLengthの値、またはundefined
   */
  getPathLength(): number | undefined {
    return undefined;
  }

  /**
   * strokeLinejoin属性が必要かどうか
   * @returns 必要ならtrue
   */
  needsStrokeLinejoin(): boolean {
    return false;
  }
}

export class CircleRenderer extends ShapeRenderer {
  readonly svgElementType = 'circle' as const;
  /**
   * 形状の外周の長さを取得する
   * @returns 外周の長さ（ピクセル）
   */
  getPerimeter() {
    return 2 * Math.PI * this.radius;
  }
  /**
   * 目盛りの数を取得する
   * @returns 目盛りの数
   */
  getTicksCount() {
    return 4;
  }

  override getProgressTransform(): string {
    return `rotate(-90 ${this.center} ${this.center})`;
  }

  /**
   * 背景用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getBackgroundProps(): SVGRenderProps {
    return { cx: this.center, cy: this.center, r: this.radius };
  }
  /**
   * プログレス表示用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getProgressProps(): SVGRenderProps {
    return { cx: this.center, cy: this.center, r: this.radius };
  }
  /**
   * 外枠用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getOuterProps(): SVGRenderProps {
    return { cx: this.center, cy: this.center, r: this.radius + 1 };
  }
  /**
   * 目盛り用のSVG属性を取得する
   * @param index 目盛りのインデックス
   * @param rotationDegree 1目盛りあたりの回転角度
   * @returns SVG属性のプロパティ
   */
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
  readonly svgElementType = 'path' as const;
  private path: string;
  private outerPath: string;

  constructor(size: number, strokeWidth: number) {
    super(size, strokeWidth);
    // 上辺中央から時計回りに描画するパスを生成
    this.path = this.createSquarePath(this.strokeWidth / 2, this.side);
    this.outerPath = this.createSquarePath(this.strokeWidth / 2 - 1, this.side + 2);
  }

  /**
   * 上辺中央から時計回りに四角形を描画するパスを生成
   * これにより butt linecap でも角が切れない
   * @param offset オフセット
   * @param side 一辺の長さ
   * @returns SVGパス文字列
   */
  private createSquarePath(offset: number, side: number): string {
    const cx = this.center;
    const top = offset;
    const right = offset + side;
    const bottom = offset + side;
    const left = offset;
    // 上辺中央 → 右上 → 右下 → 左下 → 左上 → 上辺中央（閉じる）
    return `M ${cx} ${top} L ${right} ${top} L ${right} ${bottom} L ${left} ${bottom} L ${left} ${top} Z`;
  }

  override getPathLength(): number {
    return this.getPerimeter();
  }

  /**
   * strokeLinejoin属性が必要かどうか
   * @returns 必要ならtrue
   */
  override needsStrokeLinejoin(): boolean {
    return true;
  }

  /**
   * 形状の外周の長さを取得する
   * @returns 外周の長さ（ピクセル）
   */
  getPerimeter() {
    return 4 * this.side;
  }
  /**
   * 目盛りの数を取得する
   * @returns 目盛りの数
   */
  getTicksCount() {
    return 4;
  }

  /**
   * 背景用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getBackgroundProps(): SVGRenderProps {
    return { d: this.path };
  }
  /**
   * プログレス表示用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getProgressProps(): SVGRenderProps {
    return { d: this.path };
  }
  /**
   * 外枠用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getOuterProps(): SVGRenderProps {
    return { d: this.outerPath };
  }
}

export class PathRenderer extends ShapeRenderer {
  readonly svgElementType = 'path' as const;
  protected path = '';
  protected outerPath = '';
  protected perimeter = 0;
  protected ticksCount = 5;

  /**
   * pathLength属性の値を取得する（path要素用）
   * @returns pathLengthの値、またはundefined
   */
  override getPathLength(): number {
    return this.perimeter;
  }

  /**
   * strokeLinejoin属性が必要かどうか
   * @returns 必要ならtrue
   */
  override needsStrokeLinejoin(): boolean {
    return true;
  }

  /**
   * 形状の外周の長さを取得する
   * @returns 外周の長さ（ピクセル）
   */
  getPerimeter() {
    return this.perimeter;
  }
  /**
   * 目盛りの数を取得する
   * @returns 目盛りの数
   */
  getTicksCount() {
    return this.ticksCount;
  }

  /**
   * 背景用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getBackgroundProps(): SVGRenderProps {
    return { d: this.path };
  }
  /**
   * プログレス表示用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getProgressProps(): SVGRenderProps {
    return { d: this.path };
  }
  /**
   * 外枠用のSVG属性を取得する
   * @returns SVG属性のプロパティ
   */
  getOuterProps(): SVGRenderProps {
    return { d: this.outerPath };
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

  /**
   * ハート形状は下部尖端保護のため round linecap を使用
   * @returns 'round'
   */
  override getLinecap(): 'butt' | 'round' {
    return 'round';
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
    case 'star':
      return new PolygonRenderer(size, strokeWidth, 5, true);
    case 'heart':
      return new HeartRenderer(size, strokeWidth);
    default:
      return new CircleRenderer(size, strokeWidth);
  }
};
