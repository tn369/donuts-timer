import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
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
      const audio = new Audio('https://otologic.jp/free/se/bin/alarm-clock01.mp3');
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
            もどる
          </button>
        )}
        <button
          onClick={() => {
            if (activeList) {
              onEditSettings(activeList.id);
            }
          }}
          className={styles.settingsButton}
          title="リストのせってい"
        >
          <Settings size={20} />
        </button>
      </div>

      <TaskList
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        isTaskSelectable={isTaskSelectable}
        onSelectTask={selectTask}
        shape={activeList?.timerSettings?.shape}
        color={activeList?.timerSettings?.color}
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
