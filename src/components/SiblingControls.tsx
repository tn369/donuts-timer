/**
 * 2画面モード（Siblingモード）用のコンパクトなコントロールコンポーネント
 */
import { Pause, Play, RotateCcw } from 'lucide-react';
import React from 'react';

import { ControlButton } from './ControlButton';
import styles from './SiblingControls.module.css';

/**
 * SiblingControlsのプロパティ
 */
interface SiblingControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  canStartOrStop: boolean;
}

/**
 * 2画面モード専用のタイマー操作ボタンコンポーネント
 */
export const SiblingControls: React.FC<SiblingControlsProps> = ({
  isRunning,
  onStart,
  onStop,
  onReset,
  canStartOrStop,
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.btnSpacer} />

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
        title={isRunning ? 'ストップ' : 'スタート'}
      >
        {isRunning ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
      </ControlButton>

      <ControlButton
        className={`${styles.btn} ${styles.btnReset}`}
        onClick={onReset}
        title="リセット"
      >
        <RotateCcw size={18} />
      </ControlButton>
    </div>
  );
};
