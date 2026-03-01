/**
 * タイマーの計算ロジックをまとめたユーティリティ
 */

export const CHUNK_MAX = 300; // 5分 = 300秒
const MIN_CHUNK_SIZE = 36;
const DONUT_SAFETY_MARGIN = 12;

/**
 * チャンク数に基づいて基本メトリクスを計算する
 * @param count チャンク数
 * @param size 基本サイズ
 * @param strokeWidth 基本の線の太さ
 * @returns 計算されたサイズと線の太さ
 */
export const getBaseMetrics = (count: number, size: number, strokeWidth: number) => {
  if (count <= 1) return { size, stroke: strokeWidth };
  if (count === 2) return { size: size * 0.85, stroke: strokeWidth * 0.9 };
  if (count <= 4) return { size: size * 0.7, stroke: strokeWidth * 0.8 };
  if (count <= 9) return { size: size * 0.54, stroke: strokeWidth * 0.7 };
  return { size: size * 0.48, stroke: strokeWidth * 0.6 };
};

/**
 * ドーナツチャンクの描画サイズを利用可能領域に収める
 * @param size 希望サイズ
 * @param strokeWidth 希望線幅
 * @param maxDiameterPx 利用可能な最大直径
 * @returns 領域制約を適用したサイズと線幅
 */
export const fitDonutMetricsToBounds = (
  size: number,
  strokeWidth: number,
  maxDiameterPx?: number
) => {
  if (!maxDiameterPx || maxDiameterPx <= 0) {
    return { size, stroke: strokeWidth };
  }

  const allowedSize = Math.max(0, maxDiameterPx - DONUT_SAFETY_MARGIN);
  const targetSize = Math.min(Math.max(size, MIN_CHUNK_SIZE), allowedSize);

  if (targetSize <= 0 || size <= 0 || strokeWidth <= 0) {
    return { size: 0, stroke: 0 };
  }

  const scale = targetSize / size;
  return {
    size: targetSize,
    stroke: strokeWidth * scale,
  };
};

/**
 * 合計秒数をチャンクに分割する
 * @param totalSeconds 合計秒数
 * @returns チャンクの容量リスト（秒）
 */
export const calculateChunks = (totalSeconds: number) => {
  const chunks: number[] = [];
  let remainingPlanned = totalSeconds;
  while (remainingPlanned > 0) {
    const chunkSize = Math.min(CHUNK_MAX, remainingPlanned);
    chunks.push(chunkSize);
    remainingPlanned -= chunkSize;
  }
  if (chunks.length === 0) chunks.push(0);
  return chunks;
};

/**
 * 各チャンクの残り時間を計算する
 * @param chunks チャンクの容量リスト
 * @param elapsedSeconds 既に経過した秒数
 * @param totalSeconds 全体の予定秒数
 * @returns 各チャンクの残り秒数リスト
 */
export const calculateChunkRemaining = (
  chunks: number[],
  elapsedSeconds: number,
  totalSeconds: number
) => {
  const totalRemaining = Math.max(0, totalSeconds - elapsedSeconds);
  const chunkRemaining: number[] = [];
  let tempRemaining = totalRemaining;
  for (const capacity of chunks) {
    const r = Math.min(capacity, tempRemaining);
    chunkRemaining.push(r);
    tempRemaining -= r;
  }
  return chunkRemaining;
};
