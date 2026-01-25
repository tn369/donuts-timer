import React from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import styles from './SiblingControls.module.css';
import { ControlButton } from './ControlButton';

interface SiblingControlsProps {
  isRunning: boolean;
  onBack: () => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canStartOrStop: boolean;
}

export const SiblingControls: React.FC<SiblingControlsProps> = ({
  isRunning,
  onBack,
  onStart,
  onStop,
  onReset,
  canGoBack,
  canStartOrStop,
}) => {
  return (
    <div className={styles.controls}>
      <ControlButton
        className={`${styles.btn} ${styles.btnBack}`}
        onClick={onBack}
        disabled={!canGoBack}
        title="ひとつもどる"
      >
        <ArrowLeft size={18} />
      </ControlButton>

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
        title={isRunning ? "ストップ" : "スタート"}
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
