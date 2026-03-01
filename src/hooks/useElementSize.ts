import { useEffect, useRef, useState } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

/**
 * 要素のサイズ変化を監視する
 * @returns 監視対象refと現在サイズ
 */
export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateSize = (nextWidth: number, nextHeight: number) => {
      const width = Math.max(0, Math.round(nextWidth));
      const height = Math.max(0, Math.round(nextHeight));
      setSize((prev) => {
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    };

    updateSize(element.clientWidth, element.clientHeight);

    if (typeof ResizeObserver === 'undefined') {
      const handleResize = () => {
        updateSize(element.clientWidth, element.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, size };
};
