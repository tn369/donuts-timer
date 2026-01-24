import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Palette, ChevronLeft } from 'lucide-react';
import styles from '../App.module.css';
import { ShapeIcon } from './ShapeIcon';

import { TaskList } from './TaskList';
import { Controls } from './Controls';
import { ResetModal } from './ResetModal';
import { DebugControls } from './DebugControls';
import { useTaskTimer } from '../useTaskTimer';
import type { TodoList, Task } from '../types';

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
    setTasks,
    initList,
    timerSettings,
    setTimerSettings,
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
      const audio = new Audio(`${import.meta.env.BASE_URL}alarm.mp3`);
      audio.play().catch((e) => console.log('Audio play failed:', e));
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
        <div className={styles.topControlsGroup}>
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
                'star',
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
              ];
              const currentColorIndex = colors.indexOf(timerSettings.color);
              const nextColor = colors[(currentColorIndex + 1) % colors.length];
              setTimerSettings({ ...timerSettings, color: nextColor });
            }}
            className={styles.settingsButton}
            aria-label="タイマーのいろをかえる"
          >
            <Palette size={isSiblingMode ? 20 : 24} color={
              timerSettings.color === 'red' ? '#ff6b6b' :
                timerSettings.color === 'blue' ? '#4facfe' :
                  timerSettings.color === 'yellow' ? '#fabe66' :
                    timerSettings.color === 'green' ? '#00f2fe' :
                      timerSettings.color === 'pink' ? '#ff6a95' :
                        timerSettings.color === 'purple' ? '#7b61ff' : undefined
            } />
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
      </div>

      {!isSiblingMode && (
        <Controls
          isRunning={isRunning}
          onBack={goBack}
          onStart={startTimer}
          onStop={stopTimer}
          onReset={() => setShowResetConfirm(true)}
          canGoBack={canGoBack}
          canStartOrStop={canStartOrStop}
          isCompact={false}
        />
      )}

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

      <DebugControls selectedTaskId={selectedTaskId} tasks={tasks} setTasks={setTasks} />
    </div>
  );
};
