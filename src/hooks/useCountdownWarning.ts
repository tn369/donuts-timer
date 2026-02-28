import { useEffect, useRef, useState } from 'react';

import type { Task } from '../types';
import { playCountdownWarningSound } from '../utils/audio';

const THREE_MINUTES_SECONDS = 180;
const ONE_MINUTE_SECONDS = 60;
const WARNING_DISPLAY_MS = 2500;

const getWarningMessage = (seconds: number): string | null => {
  if (seconds === THREE_MINUTES_SECONDS) return 'あと 3ふん';
  if (seconds === ONE_MINUTE_SECONDS) return 'あと 1ぷん';
  return null;
};

const getRunningTodoTask = (tasks: Task[], selectedTaskId: string | null): Task | undefined =>
  tasks.find(
    (task) => task.id === selectedTaskId && task.kind === 'todo' && task.status === 'running'
  );

const getCrossedThreshold = (remainingBefore: number, remainingAfter: number): number | null => {
  const crossedThreeMinutes =
    remainingBefore > THREE_MINUTES_SECONDS &&
    remainingAfter <= THREE_MINUTES_SECONDS &&
    remainingAfter > 0;
  const crossedOneMinute =
    remainingBefore > ONE_MINUTE_SECONDS &&
    remainingAfter <= ONE_MINUTE_SECONDS &&
    remainingAfter > 0;

  if (crossedOneMinute) return ONE_MINUTE_SECONDS;
  if (crossedThreeMinutes) return THREE_MINUTES_SECONDS;
  return null;
};

/**
 * 実行中タスクの終了前（3分/1分）予告を管理する
 * @param tasks タスク一覧
 * @param selectedTaskId 選択中タスクID
 * @param isTimerRunning タイマー実行中か
 * @param enabled 予告機能の有効/無効
 * @returns 表示する予告メッセージ
 */
export const useCountdownWarning = (
  tasks: Task[],
  selectedTaskId: string | null,
  isTimerRunning: boolean,
  enabled: boolean
) => {
  const [warning, setWarning] = useState<{ taskId: string; message: string } | null>(null);
  const previousRemainingRef = useRef<number | null>(null);
  const previousTaskIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearWarningTimeout = () => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  useEffect(() => {
    if (selectedTaskId !== previousTaskIdRef.current) {
      previousTaskIdRef.current = selectedTaskId;
      previousRemainingRef.current = null;
      clearWarningTimeout();
    }

    if (!enabled || !selectedTaskId || !isTimerRunning) {
      previousRemainingRef.current = null;
      return;
    }

    const selectedTask = getRunningTodoTask(tasks, selectedTaskId);
    if (!selectedTask) {
      previousRemainingRef.current = null;
      return;
    }

    const remainingAfter = selectedTask.plannedSeconds - selectedTask.elapsedSeconds;
    const remainingBefore = previousRemainingRef.current ?? remainingAfter;

    const crossedThreshold = getCrossedThreshold(remainingBefore, remainingAfter);
    if (crossedThreshold !== null) {
      const message = getWarningMessage(crossedThreshold);
      if (message !== null) {
        playCountdownWarningSound();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWarning({ taskId: selectedTaskId, message });
        clearWarningTimeout();
        timeoutRef.current = window.setTimeout(() => {
          setWarning(null);
          timeoutRef.current = null;
        }, WARNING_DISPLAY_MS);
      }
    }

    previousRemainingRef.current = remainingAfter;
  }, [tasks, selectedTaskId, isTimerRunning, enabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return selectedTaskId && warning?.taskId === selectedTaskId ? warning.message : null;
};
