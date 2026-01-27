/**
 * 時間フォーマットのユーティリティ。
 */

/**
 * 時間を MM:SS 形式にフォーマットする
 */
export const formatTime = (seconds: number): string => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
};
