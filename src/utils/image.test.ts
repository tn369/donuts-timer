import { describe, expect, it, vi } from 'vitest';

import { resizeImage } from './image';

describe('resizeImage', () => {
  it('画像をリサイズしてData URLを返すこと', async () => {
    // Canvas.toDataURL のモック戻り値を設定
    const mockDataUrl = 'data:image/jpeg;base64,mock';
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(mockDataUrl);

    // Image のモック
    const originalImage = global.Image;
    global.Image = class {
      onload: () => void = () => { /* mock */ };
      onerror: () => void = () => { /* mock */ };
      src = '';
      width = 100;
      height = 100;
      constructor() {
        setTimeout(() => { this.onload(); }, 0);
      }
    } as unknown as typeof Image;

    const testDataUrl = 'data:image/png;base64,dummy';
    const result = await resizeImage(testDataUrl, 10, 10);

    expect(result).toBe(mockDataUrl);

    global.Image = originalImage;
  });

  it('不正な画像データの場合にエラーをスローすること', async () => {
    const originalImage = global.Image;
    global.Image = class {
      onload: () => void = () => { /* mock */ };
      onerror: () => void = () => { /* mock */ };
      src = '';
      constructor() {
        setTimeout(() => { this.onerror(); }, 0);
      }
    } as unknown as typeof Image;

    const invalidDataUrl = 'data:image/png;base64,invalid';
    await expect(resizeImage(invalidDataUrl)).rejects.toThrow('Failed to load image');

    global.Image = originalImage;
  });
});
