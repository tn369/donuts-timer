import { motion } from 'framer-motion';
import { ChevronLeft, Palette, Settings, Zap } from 'lucide-react';
import React, { useCallback } from 'react';

import type { TimerColor, TimerShape, TodoList } from '../types';
import { Controls } from './Controls';
import styles from './MainTimerView.module.css';
import { ShapeIcon } from './ShapeIcon';

const TIMER_COLORS: Record<string, string> = {
  red: '#ff6b6b',
  blue: '#4facfe',
  yellow: '#fabe66',
  green: '#10b981',
  pink: '#ff6a95',
  purple: '#7b61ff',
  orange: '#f97316',
  teal: '#14b8a6',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  lime: '#84cc16',
};

const SHAPES: (
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'heart'
)[] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'heart',
];

const COLORS: (
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'indigo'
  | 'cyan'
  | 'lime'
)[] = [
  'red',
  'blue',
  'yellow',
  'green',
  'pink',
  'purple',
  'orange',
  'teal',
  'indigo',
  'cyan',
  'lime',
];

interface HeaderControlsProps {
  showSelectionButton: boolean;
  onBackToSelection: () => void;
  isSiblingMode: boolean;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  setShowResetConfirm: (show: boolean) => void;
  canStartOrStop: boolean;
  fastForward: () => void;
  timerSettings: { shape: TimerShape; color: TimerColor };
  setTimerSettings: (s: { shape: TimerShape; color: TimerColor }) => void;
  activeList: TodoList | null;
  onEditSettings: (id: string) => void;
}

export const MainTimerHeaderControls: React.FC<HeaderControlsProps> = ({
  showSelectionButton,
  onBackToSelection,
  isSiblingMode,
  isRunning,
  startTimer,
  stopTimer,
  setShowResetConfirm,
  canStartOrStop,
  fastForward,
  timerSettings,
  setTimerSettings,
  activeList,
  onEditSettings,
}) => {
  const handleNextShape = useCallback(() => {
    const currentShapeIndex = SHAPES.indexOf(timerSettings.shape);
    const nextShape = SHAPES[(currentShapeIndex + 1) % SHAPES.length];
    setTimerSettings({ ...timerSettings, shape: nextShape });
  }, [setTimerSettings, timerSettings]);

  const handleNextColor = useCallback(() => {
    const currentColorIndex = COLORS.indexOf(timerSettings.color);
    const nextColor = COLORS[(currentColorIndex + 1) % COLORS.length];
    setTimerSettings({ ...timerSettings, color: nextColor });
  }, [setTimerSettings, timerSettings]);

  const handleEditSettings = useCallback(() => {
    if (activeList) {
      onEditSettings(activeList.id);
    }
  }, [activeList, onEditSettings]);

  return (
    <div className={styles.topControls}>
      {showSelectionButton && (
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToSelection}
          className={`${styles.settingsButton} ${styles.secondary}`}
          aria-label="リストをえらびなおす"
        >
          <ChevronLeft size={isSiblingMode ? 20 : 24} /> もどる
        </motion.button>
      )}

      {!isSiblingMode && (
        <div className={styles.topMainControls}>
          <Controls
            isRunning={isRunning}
            onStart={startTimer}
            onStop={stopTimer}
            onReset={() => {
              setShowResetConfirm(true);
            }}
            canStartOrStop={canStartOrStop}
            isCompact={true}
          />
        </div>
      )}

      <div className={styles.topControlsGroup}>
        {import.meta.env.DEV && (
          <motion.button
            whileHover={{ scale: 1.05, translateY: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={fastForward}
            className={styles.settingsButton}
            style={{ color: '#fbbf24' }}
            aria-label="デバッグ：すすめる"
          >
            <Zap size={isSiblingMode ? 20 : 24} fill="currentColor" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextShape}
          className={styles.settingsButton}
          aria-label="タイマーのかたちをかえる"
        >
          <ShapeIcon shape={timerSettings.shape} size={isSiblingMode ? 20 : 28} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextColor}
          className={styles.settingsButton}
          aria-label="タイマーのいろをかえる"
        >
          <Palette size={isSiblingMode ? 20 : 24} color={TIMER_COLORS[timerSettings.color]} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEditSettings}
          className={styles.settingsButton}
          aria-label="リストのせってい"
        >
          <Settings size={isSiblingMode ? 20 : 24} />
        </motion.button>
      </div>
    </div>
  );
};
