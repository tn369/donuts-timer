/**
 * タイマー実行画面のメインコンポーネント。タスク一覧とタイマー操作を統合する。
 */
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useCountdownWarning } from '../../hooks/useCountdownWarning';
import { useTaskEffects } from '../../hooks/useTaskEffects';
import { useWindowSize } from '../../hooks/useWindowSize';
import { loadUiSettings, type TimerMode } from '../../storage';
import type { Task, TodoList } from '../../types';
import { useTaskTimer } from '../../useTaskTimer';
import { ResetModal } from '../modals/ResetModal';
import { ResumeModal } from '../modals/ResumeModal';
import { TaskList } from '../task/TaskList';
import { MainTimerHeaderControls } from './MainTimerHeaderControls';
import styles from './MainTimerView.module.css';
import { type RewardGainAnimationSnapshot, RewardGainOverlay } from './RewardGainOverlay';

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

const getVisibleTasksForDisplay = (
  tasks: Task[],
  isTimerRunning: boolean,
  selectedTaskId: string | null
) => {
  if (!isTimerRunning || !selectedTaskId) {
    return tasks;
  }

  const selected = tasks.find((task) => task.id === selectedTaskId);
  return selected ? [selected] : tasks;
};

const REWARD_GAIN_OVERLAY_MS = 1200;

const getTimerAnchorSnapshot = (
  container: HTMLDivElement,
  sourceTaskId: string
): RewardGainAnimationSnapshot | null => {
  const sourceTimer = container.querySelector<HTMLElement>(
    `[data-task-id="${sourceTaskId}"] [data-timer-anchor="true"]`
  );
  const rewardTimer = container.querySelector<HTMLElement>(
    '[data-task-kind="reward"] [data-timer-anchor="true"]'
  );

  if (!sourceTimer || !rewardTimer) {
    return null;
  }

  const containerRect = container.getBoundingClientRect();
  const sourceRect = sourceTimer.getBoundingClientRect();
  const rewardRect = rewardTimer.getBoundingClientRect();
  const sourceSize = Math.min(
    sourceRect.width || 72,
    sourceRect.height || 72,
    rewardRect.width || 72,
    rewardRect.height || 72,
    88
  );

  return {
    fromX: sourceRect.left - containerRect.left + sourceRect.width / 2,
    fromY: sourceRect.top - containerRect.top + sourceRect.height / 2,
    toX: rewardRect.left - containerRect.left + rewardRect.width / 2,
    toY: rewardRect.top - containerRect.top + rewardRect.height / 2,
    size: Math.max(48, sourceSize * 0.58),
    deltaSeconds: 0,
  };
};

/**
 * タイマー実行画面のメインコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.initialList 表示する初期リスト
 * @param root0.onBackToSelection リスト選択に戻るコールバック
 * @param root0.onEditSettings 設定画面を開くコールバック
 * @param root0.showSelectionButton リスト選択に戻るボタンを表示するか
 * @param root0.isSiblingMode 2画面モードかどうか
 * @param root0.timerMode タイマーのモード（single/sibling-0/sibling-1）
 * @param root0.onEnterSiblingMode ふたりモードへ切り替えるコールバック
 * @param root0.onExitSiblingMode ひとりモードへ切り替えるコールバック
 * @returns レンダリングされるJSX要素
 */
// タイマー画面の操作/表示分岐が集約されるため、このコンポーネントのみ複雑度を緩和する
/* eslint-disable complexity */
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
    isTimerRunning,
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
    rewardGainNotice,
    reorderTasks,
    clearRewardGainNotice,
  } = useTaskTimer(timerMode);

  const { height } = useWindowSize();
  const isAutoCompact = height > 0 && height < 600;
  const isCompactLayout = isSiblingMode || isAutoCompact;

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [rewardGainAnimation, setRewardGainAnimation] =
    useState<RewardGainAnimationSnapshot | null>(null);
  const timerViewRef = useRef<HTMLDivElement>(null);
  const [countdownWarningEnabled] = useState<boolean>(
    () => loadUiSettings().countdownWarningEnabled
  );

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

  const warningMessage = useCountdownWarning(
    tasks,
    selectedTaskId,
    isTimerRunning,
    countdownWarningEnabled
  );

  const visibleTasks = useMemo(
    () => getVisibleTasksForDisplay(tasks, isTimerRunning, selectedTaskId),
    [tasks, isTimerRunning, selectedTaskId]
  );

  const isSingleTaskFocus = isTimerRunning && visibleTasks.length === 1;

  useEffect(() => {
    if (!rewardGainNotice) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (!timerViewRef.current) {
        return;
      }

      const snapshot = getTimerAnchorSnapshot(timerViewRef.current, rewardGainNotice.taskId);
      if (!snapshot) {
        return;
      }

      setRewardGainAnimation({
        ...snapshot,
        deltaSeconds: rewardGainNotice.deltaSeconds,
      });
    });

    const timerId = window.setTimeout(() => {
      clearRewardGainNotice();
    }, 2500);

    const overlayTimerId = window.setTimeout(() => {
      setRewardGainAnimation(null);
    }, REWARD_GAIN_OVERLAY_MS);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
      window.clearTimeout(overlayTimerId);
    };
  }, [rewardGainNotice, clearRewardGainNotice]);

  return (
    <div
      ref={timerViewRef}
      className={`${styles.timerView} ${isSiblingMode ? styles.siblingMode : ''} ${
        isAutoCompact ? styles.compact : ''
      }`}
    >
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
        isCompact={isAutoCompact}
      />

      {warningMessage && (
        <div className={styles.warningBanner} role="status" aria-live="polite">
          {warningMessage}
        </div>
      )}

      <TaskList
        tasks={visibleTasks}
        selectedTaskId={selectedTaskId}
        isTaskSelectable={isTaskSelectable}
        onSelectTask={selectTask}
        shape={timerSettings.shape}
        color={timerSettings.color}
        isCompact={isCompactLayout}
        onReorderTasks={reorderTasks}
        isReorderEnabled={!isTimerRunning}
        isSingleTaskFocus={isSingleTaskFocus}
        rewardGainNotice={rewardGainNotice}
      />

      {rewardGainNotice && rewardGainAnimation && (
        <RewardGainOverlay
          animation={rewardGainAnimation}
          shape={timerSettings.shape}
          color={timerSettings.color}
        />
      )}

      <Modals
        showResetConfirm={showResetConfirm}
        setShowResetConfirm={setShowResetConfirm}
        reset={reset}
        pendingRestorableState={!!pendingRestorableState}
        cancelResume={cancelResume}
        resumeSession={resumeSession}
      />
    </div>
  );
};
/* eslint-enable complexity */

interface ModalsProps {
  showResetConfirm: boolean;
  setShowResetConfirm: (show: boolean) => void;
  reset: () => void;
  pendingRestorableState: boolean;
  cancelResume: () => void;
  resumeSession: () => void;
}

/**
 * 各種モーダルを管理するコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.showResetConfirm リセット確認表示フラグ
 * @param root0.setShowResetConfirm リセット確認表示のセット関数
 * @param root0.reset リセット実行関数
 * @param root0.pendingRestorableState 復元待ちの状態があるか
 * @param root0.cancelResume 復元キャンセル関数
 * @param root0.resumeSession 復元実行関数
 * @returns レンダリングされるJSX要素
 */
const Modals: React.FC<ModalsProps> = ({
  showResetConfirm,
  setShowResetConfirm,
  reset,
  pendingRestorableState,
  cancelResume,
  resumeSession,
}) => {
  return (
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
  );
};
