import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${Math.min(100, progress)}%` }}></div>
    </div>
  );
};
