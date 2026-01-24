import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings, Palette, ChevronLeft } from 'lucide-react';
import styles from '../App.module.css';

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
}

export const MainTimerView: React.FC<MainTimerViewProps> = ({
  initialList,
  onBackToSelection,
  onEditSettings,
  showSelectionButton = true,
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
    <div className={styles.timerView}>
      <div className={styles.topControls}>
        {showSelectionButton && (
          <button
            onClick={onBackToSelection}
            className={`${styles.settingsButton} ${styles.secondary}`}
            title="リストをえらびなおす"
          >
            <ChevronLeft size={24} /> もどる
          </button>
        )}
        <div className={styles.topControlsGroup}>
          <button
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
            title="タイマーのかたちをかえる"
          >
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
              {timerSettings.shape === 'circle' && '●'}
              {timerSettings.shape === 'square' && '■'}
              {timerSettings.shape === 'triangle' && '▲'}
              {timerSettings.shape === 'diamond' && '◆'}
              {timerSettings.shape === 'pentagon' && '⬠'}
              {timerSettings.shape === 'hexagon' && '⬢'}
              {timerSettings.shape === 'star' && '★'}
            </div>
          </button>
          <button
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
            title="タイマーのいろをかえる"
          >
            <Palette size={20} />
          </button>
          <button
            onClick={() => {
              if (activeList) {
                onEditSettings(activeList.id);
              }
            }}
            className={`${styles.settingsButton} ${styles.rotate}`}
            title="リストのせってい"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        isTaskSelectable={isTaskSelectable}
        onSelectTask={selectTask}
        shape={timerSettings.shape}
        color={timerSettings.color}
      />

      <Controls
        isRunning={isRunning}
        onBack={goBack}
        onStart={startTimer}
        onStop={stopTimer}
        onReset={() => setShowResetConfirm(true)}
        canGoBack={canGoBack}
        canStartOrStop={canStartOrStop}
      />

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
