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
  canStartOrStop: boolean; // スタート/ストップ操作が可能かどうか
  isCompact?: boolean; // コンパクト表示にするかどうか
  onReset?: () => void; // リセットボタンクリック時のコールバック (オプショナル)
  hideReset?: boolean; // リセットボタンを非表示にするかどうか
}

/**
 * スタート/ストップボタンの内部コンポーネント
 */
const StartStopButton: React.FC<{
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}> = ({ isRunning, onStart, onStop, disabled }) => {
  const buttonClass = isRunning ? styles.btnStop : styles.btnStart;
  const buttonOnClick = isRunning ? onStop : onStart;
  const buttonText = isRunning ? 'ストップ' : 'スタート';
  const Icon = isRunning ? Pause : Play;

  const animation = isRunning
    ? {
        boxShadow: [
          '0 4px 12px rgba(239, 68, 68, 0.2)',
          '0 4px 18px rgba(239, 68, 68, 0.4)',
          '0 4px 12px rgba(239, 68, 68, 0.2)',
        ],
        transition: { repeat: Infinity, duration: 2 },
      }
    : {};

  return (
    <ControlButton
      layout
      animate={animation}
      className={`${styles.btn} ${buttonClass}`}
      onClick={buttonOnClick}
      disabled={disabled}
    >
      <Icon size={20} fill="currentColor" /> {buttonText}
    </ControlButton>
  );
};

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
  hideReset = false,
}) => {
  const containerClass = `${styles.controls} ${isCompact ? styles.compact : ''}`;

  return (
    <div className={containerClass}>
      <StartStopButton
        isRunning={isRunning}
        onStart={onStart}
        onStop={onStop}
        disabled={!canStartOrStop}
      />

      {!hideReset && onReset && (
        <ControlButton className={`${styles.btn} ${styles.btnReset}`} onClick={onReset}>
          <RotateCcw size={18} />
        </ControlButton>
      )}
    </div>
  );
};
