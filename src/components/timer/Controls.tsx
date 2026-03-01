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
  isSmall?: boolean; // 小さい表示にするかどうか
  onReset?: () => void; // リセットボタンクリック時のコールバック (オプショナル)
  hideReset?: boolean; // リセットボタンを非表示にするかどうか
}

/**
 * スタート/ストップボタンの内部コンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.isRunning タイマーが動作中かどうか
 * @param root0.onStart スタート時のハンドラ
 * @param root0.onStop ストップ時のハンドラ
 * @param root0.disabled 無効フラグ
 * @param root0.isSmall 小さい表示にするかどうか
 * @returns レンダリングされるJSX要素
 */
const StartStopButton: React.FC<{
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
  isSmall?: boolean;
}> = ({ isRunning, onStart, onStop, disabled, isSmall }) => {
  const buttonClass = isRunning ? styles.btnStop : styles.btnStart;
  const buttonOnClick = isRunning ? onStop : onStart;
  const buttonText = isRunning ? 'やすむ' : 'スタート';
  const Icon = isRunning ? Pause : Play;

  return (
    <ControlButton
      layout
      className={`${styles.btn} ${buttonClass}`}
      onClick={buttonOnClick}
      disabled={disabled}
    >
      <Icon size={isSmall ? 16 : 20} fill="currentColor" /> {buttonText}
    </ControlButton>
  );
};

/**
 * タイマー操作用のボタン群を表示するコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.isRunning タイマーが動作中かどうか
 * @param root0.onStart スタート時のハンドラ
 * @param root0.onStop ストップ時のハンドラ
 * @param root0.onReset リセット時のハンドラ
 * @param root0.canStartOrStop スタート/ストップ操作が可能かどうか
 * @param root0.isCompact コンパクト表示にするかどうか
 * @param root0.isSmall 小さい表示にするかどうか
 * @param root0.hideReset リセットボタンを非表示にするかどうか
 * @returns レンダリングされるJSX要素
 */
export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onStart,
  onStop,
  onReset,
  canStartOrStop,
  isCompact = false,
  isSmall = false,
  hideReset = false,
}) => {
  const containerClass = `${styles.controls} ${isCompact ? styles.compact : ''} ${
    isSmall ? styles.small : ''
  }`;

  return (
    <div className={containerClass}>
      <StartStopButton
        isRunning={isRunning}
        onStart={onStart}
        onStop={onStop}
        disabled={!canStartOrStop}
        isSmall={isSmall}
      />

      {!hideReset && onReset && (
        <ControlButton className={`${styles.btn} ${styles.btnReset}`} onClick={onReset}>
          <RotateCcw size={isSmall ? 16 : 18} />
        </ControlButton>
      )}
    </div>
  );
};
