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
/**
 * 画像を指定された最大幅と高さにリサイズし、圧縮する
 * @param dataUrl 画像のData URL
 * @param maxWidth 最大幅 (デフォルト 200)
 * @param maxHeight 最大高さ (デフォルト 200)
 * @param quality 圧縮品質 (0.0 〜 1.0)
 * @returns リサイズ・圧縮された画像のData URLを解決するPromise
 */
export const resizeImage = (
  dataUrl: string,
  maxWidth = 200,
  maxHeight = 200,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // アスペクト比を維持しながらリサイズ
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
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 背景を白で塗りつぶす（透明度のある画像をJPEGにする場合のため）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);

      // 容量を削減するため JPEG で出力する。元が小さい場合は PNG でも良いが
      // アイコンサイズなら JPEG 0.8 程度で十分軽量
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = dataUrl;
  });
};
