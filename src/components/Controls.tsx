import React from 'react';

interface ControlsProps {
  isRunning: boolean;
  onBack: () => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canStartOrStop: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onBack,
  onStart,
  onStop,
  onReset,
  canGoBack,
  canStartOrStop,
}) => {
  return (
    <div className="controls">
      <button
        className="btn btn-back"
        onClick={onBack}
        disabled={!canGoBack}
      >
        ↩ 戻る
      </button>
      <button
        className={`btn ${isRunning ? 'btn-stop' : 'btn-start'}`}
        onClick={isRunning ? onStop : onStart}
        disabled={!canStartOrStop}
      >
        {isRunning ? '⏸ ストップ' : '▶ スタート'}
      </button>
      <button className="btn btn-reset" onClick={onReset}>
        🔄 リセット
      </button>
    </div>
  );
};
