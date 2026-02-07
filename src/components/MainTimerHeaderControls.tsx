/**
 * タイマー画面の上部に表示される、設定や操作のためのコントロールバーコンポーネント
 */
import { motion } from 'framer-motion';
import { ChevronLeft, Palette, Settings, User, Users, Zap } from 'lucide-react';
import React, { useCallback } from 'react';

import type { TimerColor, TimerShape, TodoList } from '../types';
import { Controls } from './Controls';
import styles from './MainTimerView.module.css';
import { ShapeIcon } from './ShapeIcon';

/**
 * タイマーのカラーコード定義
 */
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

/**
 * MainTimerHeaderControlsのプロパティ
 */
interface HeaderControlsProps {
  showSelectionButton: boolean; // リスト選択に戻るボタンを表示するか
  onBackToSelection: () => void; // リスト選択に戻る際のコールバック
  isSiblingMode: boolean; // 2画面モードかどうか
  isRunning: boolean; // タイマーが動作中かどうか
  startTimer: () => void; // スタートボタンのコールバック
  stopTimer: () => void; // ストップボタンのコールバック
  setShowResetConfirm: (show: boolean) => void; // リセット確認ダイアログの表示制御
  canStartOrStop: boolean; // スタート/ストップが可能か
  fastForward: () => void; // 早送り（デバッグ用）のコールバック
  timerSettings: { shape: TimerShape; color: TimerColor }; // タイマーの見た目設定
  setTimerSettings: (s: { shape: TimerShape; color: TimerColor }) => void; // 設定変更用の関数
  activeList: TodoList | null; // 現在アクティブなリスト
  onEditSettings: (id: string) => void; // 設定画面を開くコールバック
  onEnterSiblingMode?: () => void; // ふたりモードへ切り替えるコールバック
  onExitSiblingMode?: () => void; // ひとりモードへ切り替えるコールバック
}

/**
 * タイマー画面上部のヘッダーコントロールコンポーネント
 */
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
  onEnterSiblingMode,
  onExitSiblingMode,
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

  const renderDebugButton = () => {
    if (!import.meta.env.DEV) return null;

    return (
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
    );
  };

  const renderModeToggleButton = () => {
    if (isSiblingMode) {
      if (!onExitSiblingMode) return null;
      return (
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExitSiblingMode}
          className={styles.settingsButton}
          aria-label="ひとりモードにもどす"
        >
          <User size={20} />
        </motion.button>
      );
    }

    if (!onEnterSiblingMode) return null;
    return (
      <motion.button
        whileHover={{ scale: 1.05, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEnterSiblingMode}
        className={styles.settingsButton}
        aria-label="ふたりモードにきりかえる"
      >
        <Users size={24} />
      </motion.button>
    );
  };

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
        {renderDebugButton()}
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
        {renderModeToggleButton()}
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
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
