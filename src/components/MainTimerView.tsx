/**
 * タイマー実行画面のメインコンポーネント。タスク一覧とタイマー操作を統合する。
 */
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { useTaskEffects } from '../hooks/useTaskEffects';
import { type TimerMode } from '../storage';
import type { Task, TodoList } from '../types';
import { useTaskTimer } from '../useTaskTimer';
import { MainTimerHeaderControls } from './MainTimerHeaderControls';
import styles from './MainTimerView.module.css';
import { ResetModal } from './ResetModal';
import { ResumeModal } from './ResumeModal';
import { SiblingControls } from './SiblingControls';
import { TaskList } from './TaskList';

/**
 * MainTimerViewのプロパティ
 */
interface MainTimerViewProps {
  initialList: TodoList; // 表示する初期リスト
  onBackToSelection: () => void; // リスト選択に戻るコールバック
  onEditSettings: (listId: string) => void; // 設定画面を開くコールバック
  showSelectionButton?: boolean; // リスト選択に戻るボタンを表示するか
  isSiblingMode?: boolean; // 2画面モードかどうか
  timerMode?: TimerMode; // タイマーのモード（single/sibling-0/sibling-1）
  onEnterSiblingMode?: () => void; // ふたりモードへ切り替えるコールバック
  onExitSiblingMode?: () => void; // ひとりモードへ切り替えるコールバック
}

/**
 * タイマー実行画面のメインコンポーネント
 */
export const MainTimerView: React.FC<MainTimerViewProps> = ({
  initialList,
  onBackToSelection,
  onEditSettings,
  showSelectionButton = true,
  isSiblingMode = false,
  timerMode = 'single',
  onEnterSiblingMode,
  onExitSiblingMode,
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
    resumeSession,
    cancelResume,
    pendingRestorableState,
    reorderTasks,
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
        onEnterSiblingMode={onEnterSiblingMode}
        onExitSiblingMode={onExitSiblingMode}
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
          onReorderTasks={reorderTasks}
          isReorderEnabled={true}
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
        {pendingRestorableState && (
          <ResumeModal
            onCancel={() => {
              cancelResume();
            }}
            onConfirm={() => {
              resumeSession();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
