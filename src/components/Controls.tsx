import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import styles from './Controls.module.css';

interface ControlsProps {
  isRunning: boolean;
  onBack: () => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canStartOrStop: boolean;
  isCompact?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onBack,
  onStart,
  onStop,
  onReset,
  canGoBack,
  canStartOrStop,
  isCompact = false,
}) => {
  return (
    <div className={`${styles.controls} ${isCompact ? styles.compact : ''}`}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`${styles.btn} ${styles.btnBack}`}
        onClick={onBack}
        disabled={!canGoBack}
      >
        <ArrowLeft size={18} /> もどる
      </motion.button>

      <motion.button
        layout
        whileTap={{ scale: 0.95 }}
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
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`${styles.btn} ${styles.btnReset}`}
        onClick={onReset}
      >
        <RotateCcw size={18} />
      </motion.button>
    </div>
  );
};
