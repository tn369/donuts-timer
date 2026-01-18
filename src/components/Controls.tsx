import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';

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
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="btn btn-back"
        onClick={onBack}
        disabled={!canGoBack}
      >
        <ArrowLeft size={24} /> もどる
      </motion.button>

      <motion.button
        layout
        whileTap={{ scale: 0.95 }}
        animate={isRunning ? {
          boxShadow: [
            "0 8px 20px rgba(239, 68, 68, 0.3)",
            "0 8px 30px rgba(239, 68, 68, 0.5)",
            "0 8px 20px rgba(239, 68, 68, 0.3)"
          ],
          transition: { repeat: Infinity, duration: 2 }
        } : {}}
        className={`btn ${isRunning ? 'btn-stop' : 'btn-start'}`}
        onClick={isRunning ? onStop : onStart}
        disabled={!canStartOrStop}
      >
        {isRunning ? (
          <>
            <Pause size={28} fill="currentColor" /> おわり
          </>
        ) : (
          <>
              <Play size={28} fill="currentColor" /> はじめる
          </>
        )}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="btn btn-reset"
        onClick={onReset}
      >
        <RotateCcw size={24} />
      </motion.button>
    </div>
  );
};
