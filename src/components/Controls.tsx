/**
 * タイマーのスタート、ストップ、リセットを行うコントロールコンポーネント
 */
import { Pause, Play, RotateCcw } from 'lucide-react';
import React from 'react';

import { ControlButton } from './ControlButton';
import styles from './Controls.module.css';

/**
 * Controlsのプロパティ
 */
interface ControlsProps {
  isRunning: boolean; // タイマーが動作中かどうか
  onStart: () => void; // スタートボタンクリック時のコールバック
  onStop: () => void; // ストップボタンクリック時のコールバック
  onReset: () => void; // リセットボタンクリック時のコールバック
  canStartOrStop: boolean; // スタート/ストップ操作が可能かどうか
  isCompact?: boolean; // コンパクト表示にするかどうか
}

/**
 * タイマー操作用のボタン群を表示するコンポーネント
 */
export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onStart,
  onStop,
  onReset,
  canStartOrStop,
  isCompact = false,
}) => {
  return (
    <div className={`${styles.controls} ${isCompact ? styles.compact : ''}`}>
      {isCompact && <div className={styles.btnSpacer} />}

      <ControlButton
        layout
        animate={
          isRunning
            ? {
                boxShadow: [
                  '0 4px 12px rgba(239, 68, 68, 0.2)',
                  '0 4px 18px rgba(239, 68, 68, 0.4)',
                  '0 4px 12px rgba(239, 68, 68, 0.2)',
                ],
                transition: { repeat: Infinity, duration: 2 },
              }
            : {}
        }
        className={`${styles.btn} ${isRunning ? styles.btnStop : styles.btnStart}`}
        onClick={isRunning ? onStop : onStart}
        disabled={!canStartOrStop}
      >
        {isRunning ? (
          <>
            <Pause size={20} fill="currentColor" /> ストップ
          </>
        ) : (
          <>
            <Play size={20} fill="currentColor" /> スタート
          </>
        )}
      </ControlButton>

      <ControlButton className={`${styles.btn} ${styles.btnReset}`} onClick={onReset}>
        <RotateCcw size={18} />
      </ControlButton>
    </div>
  );
};
