/**
 * 時間のフォーマットなどのユーティリティ
 */

/**
 * 秒数を MM:SS 形式にフォーマットする（負の値にも対応）
 * @param seconds 秒数
 * @returns フォーマットされた文字列
 */
export const formatTime = (seconds: number): string => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
};
