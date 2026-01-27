import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { useTaskEffects } from '../hooks/useTaskEffects';
import { type TimerMode } from '../storage';
import type { Task, TodoList } from '../types';
import { useTaskTimer } from '../useTaskTimer';
import { MainTimerHeaderControls } from './MainTimerHeaderControls';
import styles from './MainTimerView.module.css';
import { ResetModal } from './ResetModal';
import { SiblingControls } from './SiblingControls';
import { TaskList } from './TaskList';

interface MainTimerViewProps {
  initialList: TodoList;
  onBackToSelection: () => void;
  onEditSettings: (listId: string) => void;
  showSelectionButton?: boolean;
  isSiblingMode?: boolean;
  timerMode?: TimerMode;
}

export const MainTimerView: React.FC<MainTimerViewProps> = ({
  initialList,
  onBackToSelection,
  onEditSettings,
  showSelectionButton = true,
  isSiblingMode = false,
  timerMode = 'single',
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
  } = useTaskTimer(timerMode);

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 初回ロード
  useEffect(() => {
    initList(initialList);
  }, [initialList, initList]);

  const selectedTask = useMemo(
    () => tasks.find((t: Task) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  useTaskEffects(tasks);

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
      <MainTimerHeaderControls
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
              onReset={() => {
                setShowResetConfirm(true);
              }}
              canStartOrStop={canStartOrStop}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <ResetModal
            onCancel={() => {
              setShowResetConfirm(false);
            }}
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
