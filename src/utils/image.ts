/**
 * 画像処理に関連するユーティリティ
 */

/**
 * 画像を指定された最大幅と高さにリサイズする
 * @param dataUrl 画像のData URL
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @returns リサイズされた画像のData URLを解決するPromise
 */
export const resizeImage = (dataUrl: string, maxWidth = 200, maxHeight = 200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};
