import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../types';

interface ProgressBarProps {
  tasks: Task[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ tasks }) => {
  // タスクカードの flex-grow と同じ計算式で「現在の合計幅」と「現在の進捗位置」を計算する
  const { totalCurrentSeconds, currentProgressSeconds } = useMemo(() => {
    let total = 0;
    let progress = 0;

    tasks.forEach((task) => {
      // 完了したものは実績時間、それ以外は予定と経過の大きい方（オーバーラン対応）
      const effectiveWidth = task.status === 'done'
        ? task.actualSeconds
        : Math.max(task.plannedSeconds, task.elapsedSeconds);

      total += effectiveWidth;

      if (task.status === 'done') {
        progress += effectiveWidth;
      } else if (task.status === 'running' || task.status === 'paused') {
        // 実行中のタスクは、そのタスク内での進捗割合を幅に掛ける
        const internalProgress = task.plannedSeconds > 0
          ? Math.min(1, task.elapsedSeconds / task.plannedSeconds)
          : 1;
        // 進捗バーの右端をタスクカードの右端（進捗塗りつぶし部分）と合わせる
        progress += internalProgress * task.plannedSeconds;

        // 注意: オーバーラン中は internalProgress が 1 に固定されるため、
        // progress は task.plannedSeconds までしか増えないが、
        // 下のカードの「塗り」も 100% で止まるので、これで右端が垂直に並ぶ。
      }
    });

    return { totalCurrentSeconds: total, currentProgressSeconds: progress };
  }, [tasks]);

  const percentage = totalCurrentSeconds > 0
    ? (currentProgressSeconds / totalCurrentSeconds) * 100
    : 0;

  return (
    <div className="progress-bar-container">
      <motion.div
        className="progress-bar"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
};
