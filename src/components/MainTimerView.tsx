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
import type { TodoList, Task } from '../types';
import { playGentleAlarm } from '../utils';

interface MainTimerViewProps {
  initialList: TodoList;
  onBackToSelection: () => void;
  onEditSettings: (listId: string) => void;
  showSelectionButton?: boolean;
  isSiblingMode?: boolean;
}

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
    goBack,
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

  // アラーム音の再生ロジック
  const lastPlayedStatusRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    const rewardTask = tasks.find((t) => t.kind === 'reward');
    const currentStatus = rewardTask?.status;

    if (currentStatus === 'done' && lastPlayedStatusRef.current !== 'done') {
      playGentleAlarm();
    }
    lastPlayedStatusRef.current = currentStatus;
  }, [tasks]);

  const isRunning = selectedTask?.status === 'running';

  const canGoBack = useMemo(() => {
    const currentIndex = tasks.findIndex((t) => t.id === selectedTaskId);
    return currentIndex > 0 || selectedTask?.status === 'done';
  }, [tasks, selectedTaskId, selectedTask]);

  const canStartOrStop = useMemo(() => {
    return !(!isRunning && (!selectedTaskId || selectedTask?.status === 'done'));
  }, [isRunning, selectedTaskId, selectedTask]);

  return (
    <div className={`${styles.timerView} ${isSiblingMode ? styles.siblingMode : ''}`}>
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
              onBack={goBack}
              onStart={startTimer}
              onStop={stopTimer}
              onReset={() => setShowResetConfirm(true)}
              canGoBack={canGoBack}
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
              const shapes: Array<typeof timerSettings.shape> = [
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
              const currentShapeIndex = shapes.indexOf(timerSettings.shape);
              const nextShape = shapes[(currentShapeIndex + 1) % shapes.length];
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
              const colors: Array<typeof timerSettings.color> = [
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
              const currentColorIndex = colors.indexOf(timerSettings.color);
              const nextColor = colors[(currentColorIndex + 1) % colors.length];
              setTimerSettings({ ...timerSettings, color: nextColor });
            }}
            className={styles.settingsButton}
            aria-label="タイマーのいろをかえる"
          >
            <Palette
              size={isSiblingMode ? 20 : 24}
              color={
                timerSettings.color === 'red'
                  ? '#ff6b6b'
                  : timerSettings.color === 'blue'
                    ? '#4facfe'
                    : timerSettings.color === 'yellow'
                      ? '#fabe66'
                      : timerSettings.color === 'green'
                        ? '#10b981'
                        : timerSettings.color === 'pink'
                          ? '#ff6a95'
                          : timerSettings.color === 'purple'
                            ? '#7b61ff'
                            : timerSettings.color === 'orange'
                              ? '#f97316'
                              : timerSettings.color === 'teal'
                                ? '#14b8a6'
                                : timerSettings.color === 'indigo'
                                  ? '#6366f1'
                                  : timerSettings.color === 'cyan'
                                    ? '#06b6d4'
                                    : timerSettings.color === 'lime'
                                      ? '#84cc16'
                                      : undefined
              }
            />
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
              onBack={goBack}
              onStart={startTimer}
              onStop={stopTimer}
              onReset={() => setShowResetConfirm(true)}
              canGoBack={canGoBack}
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
