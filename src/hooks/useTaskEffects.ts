/**
 * タスクの状態変化（完了、未完了への戻しなど）に応じた効果音やアニメーション（紙吹雪）を制御するカスタムフック
 */
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

import type { Task } from '../types';
import {
  playCelebrationSound,
  playGentleAlarm,
  playTaskCompletionSound,
  playTaskIncompleteSound,
} from '../utils/audio';

/**
 * タスクの状態変化を監視し、エフェクトを発火させるフック
 * @param tasks タスク一覧
 */
export const useTaskEffects = (tasks: Task[]) => {
  const prevCompletedIdsRef = useRef<Set<string>>(new Set());
  const wasAllTodosDoneRef = useRef<boolean>(false);

  /**
   * お祝いのエフェクト（音と紙吹雪）を実行する
   */
  const triggerCelebration = () => {
    playCelebrationSound();
    void confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4facfe', '#fabe66', '#10b981', '#ff6a95'],
    });
  };

  useEffect(() => {
    const todoTasks = tasks.filter((t) => t.kind !== 'reward');
    const isAllTodosDoneNow = todoTasks.length > 0 && todoTasks.every((t) => t.status === 'done');

    const currentCompletedTasks = tasks.filter((t) => t.status === 'done');
    const currentCompletedIds = new Set(currentCompletedTasks.map((t) => t.id));

    const newlyIncompleteTask = Array.from(prevCompletedIdsRef.current).find(
      (id) => !currentCompletedIds.has(id)
    );

    if (newlyIncompleteTask) {
      playTaskIncompleteSound();
      if (!isAllTodosDoneNow) {
        wasAllTodosDoneRef.current = false;
      }
    } else {
      const newlyCompletedTask = tasks.find(
        (t) => t.status === 'done' && !prevCompletedIdsRef.current.has(t.id)
      );

      if (newlyCompletedTask) {
        if (newlyCompletedTask.kind === 'reward') {
          playGentleAlarm();
        } else if (isAllTodosDoneNow && !wasAllTodosDoneRef.current) {
          triggerCelebration();
        } else {
          playTaskCompletionSound();
        }
      }
    }

    if (isAllTodosDoneNow) {
      wasAllTodosDoneRef.current = true;
    }
    prevCompletedIdsRef.current = currentCompletedIds;
  }, [tasks]);
};
