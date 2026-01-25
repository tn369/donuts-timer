import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Palette, ChevronLeft, Zap } from 'lucide-react';
import styles from '../App.module.css';
import { ShapeIcon } from './ShapeIcon';

import { TaskList } from './TaskList';
import { Controls } from './Controls';
import { SiblingControls } from './SiblingControls';
import { ResetModal } from './ResetModal';
import { useTaskTimer } from '../useTaskTimer';
import type { TodoList, Task, TimerShape, TimerColor } from '../types';
import { playGentleAlarm, playTaskCompletionSound } from '../utils/audio';

interface MainTimerViewProps {
  initialList: TodoList;
  onBackToSelection: () => void;
  onEditSettings: (listId: string) => void;
  showSelectionButton?: boolean;
  isSiblingMode?: boolean;
}

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

const HeaderControls: React.FC<HeaderControlsProps> = ({
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
}) => (
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
          onReset={() => setShowResetConfirm(true)}
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
        onClick={() => {
          const currentShapeIndex = SHAPES.indexOf(timerSettings.shape);
          const nextShape = SHAPES[(currentShapeIndex + 1) % SHAPES.length];
          setTimerSettings({ ...timerSettings, shape: nextShape });
        }}
        className={styles.settingsButton}
        aria-label="タイマーのかたちをかえる"
      >
        <ShapeIcon shape={timerSettings.shape} size={isSiblingMode ? 20 : 28} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const currentColorIndex = COLORS.indexOf(timerSettings.color);
          const nextColor = COLORS[(currentColorIndex + 1) % COLORS.length];
          setTimerSettings({ ...timerSettings, color: nextColor });
        }}
        className={styles.settingsButton}
        aria-label="タイマーのいろをかえる"
      >
        <Palette size={isSiblingMode ? 20 : 24} color={TIMER_COLORS[timerSettings.color]} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (activeList) {
            onEditSettings(activeList.id);
          }
        }}
        className={`${styles.settingsButton}`}
        aria-label="リストのせってい"
      >
        <Settings size={isSiblingMode ? 20 : 24} />
      </motion.button>
    </div>
  </div>
);

export const MainTimerView: React.FC<MainTimerViewProps> = ({
  initialList,
  onBackToSelection,
  onEditSettings,
  showSelectionButton = true,
  isSiblingMode = false,
}) => {
  const {
    tasks,
    activeList,
    selectedTaskId,
    isTaskSelectable,
    selectTask,
    startTimer,
    stopTimer,
    reset,
    initList,
    timerSettings,
    setTimerSettings,
    fastForward,
  } = useTaskTimer();

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 初回ロード
  useEffect(() => {
    initList(initialList);
  }, [initialList, initList]);

  const selectedTask = useMemo(
    () => tasks.find((t: Task) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  // 効果音の再生ロジック
  const prevCompletedIdsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentCompletedTasks = tasks.filter((t) => t.status === 'done');
    const currentCompletedIds = new Set(currentCompletedTasks.map((t) => t.id));

    // 前回いなかった（＝新しく完了した）タスクを探す
    const newlyCompletedTask = currentCompletedTasks.find(
      (t) => !prevCompletedIdsRef.current.has(t.id)
    );

    if (newlyCompletedTask) {
      if (newlyCompletedTask.kind === 'reward') {
        playGentleAlarm();
      } else {
        playTaskCompletionSound();
      }
    }

    prevCompletedIdsRef.current = currentCompletedIds;
  }, [tasks]);

  const isRunning = selectedTask?.status === 'running';

  const canStartOrStop = useMemo(() => {
    if (isRunning) return true;
    if (selectedTaskId) {
      return selectedTask?.status !== 'done';
    }
    return tasks.some((t) => t.status !== 'done');
  }, [isRunning, selectedTaskId, selectedTask, tasks]);

  return (
    <div className={`${styles.timerView} ${isSiblingMode ? styles.siblingMode : ''}`}>
      <HeaderControls
        showSelectionButton={showSelectionButton}
        onBackToSelection={onBackToSelection}
        isSiblingMode={isSiblingMode}
        isRunning={isRunning}
        startTimer={startTimer}
        stopTimer={stopTimer}
        setShowResetConfirm={setShowResetConfirm}
        canStartOrStop={canStartOrStop}
        fastForward={fastForward}
        timerSettings={timerSettings}
        setTimerSettings={setTimerSettings}
        activeList={activeList}
        onEditSettings={onEditSettings}
      />

      <div className={isSiblingMode ? styles.mainRowSibling : ''}>
        <TaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          isTaskSelectable={isTaskSelectable}
          onSelectTask={selectTask}
          shape={timerSettings.shape}
          color={timerSettings.color}
          isCompact={isSiblingMode}
        />

        {isSiblingMode && (
          <div className={styles.sideControls}>
            <SiblingControls
              isRunning={isRunning}
              onStart={startTimer}
              onStop={stopTimer}
              onReset={() => setShowResetConfirm(true)}
              canStartOrStop={canStartOrStop}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <ResetModal
            onCancel={() => setShowResetConfirm(false)}
            onConfirm={() => {
              reset();
              setShowResetConfirm(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
