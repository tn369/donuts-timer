import { describe, expect, it } from 'vitest';

import { createRenderer } from './shapeUtils';

describe('shapeUtils', () => {
  const size = 100;
  const strokeWidth = 2;

  describe('createRenderer', () => {
    it('should return a renderer for circle', () => {
      const renderer = createRenderer('circle', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(renderer.svgElementType).toBe('circle');
      expect(props.cx).toBe(50);
      expect(props.r).toBe(49);
    });

    it('should return a renderer for square', () => {
      const renderer = createRenderer('square', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(renderer.svgElementType).toBe('path');
      expect(props.d).toContain('M');
      expect(props.d).toContain('L');
    });

    it('should return a renderer for triangle', () => {
      const renderer = createRenderer('triangle', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(renderer.svgElementType).toBe('path');
      expect(props.d).toContain('M');
    });

    it('should return a renderer for star', () => {
      const renderer = createRenderer('star', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(props.d).toContain('M');
    });

    it('should return a renderer for heart', () => {
      const renderer = createRenderer('heart', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(props.d).toContain('M');
      expect(props.d).toContain('C');
    });

    it('should return a renderer for diamond', () => {
      const renderer = createRenderer('diamond', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(props.d).toContain('M');
    });

    it('should return a renderer for pentagon', () => {
      const renderer = createRenderer('pentagon', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(props.d).toContain('M');
    });

    it('should return a renderer for hexagon', () => {
      const renderer = createRenderer('hexagon', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(props.d).toContain('M');
    });

    it('should return a renderer for octagon', () => {
      const renderer = createRenderer('octagon', size, strokeWidth);
      const props = renderer.getBackgroundProps();
      expect(props.d).toContain('M');
    });

    it('should fallback to circle for unknown shape', () => {
      const renderer = createRenderer('unknown' as any, size, strokeWidth);
      expect(renderer.svgElementType).toBe('circle');
    });
  });
});
