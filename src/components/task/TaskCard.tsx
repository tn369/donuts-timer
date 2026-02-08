/**
 * 個別のタスクを表示するカードコンポーネント。タイマー表示や進捗、完了状態を表示する。
 */
import type { DragControls } from 'framer-motion';
import { motion } from 'framer-motion';
import { Camera, Check, GripVertical } from 'lucide-react';
import React from 'react';

import type { Task, TimerColor, TimerShape } from '../../types';
import { formatTime } from '../../utils/time';
import { DonutTimer } from '../timer/DonutTimer';
import styles from './TaskCard.module.css';

/**
 * TaskCardのプロパティ
 */
interface TaskCardProps {
  task: Task; // 表示対象のタスク
  isSelected: boolean; // 選択中かどうか
  isSelectable: boolean; // 選択可能かどうか
  onSelect: (taskId: string) => void; // 選択された時のコールバック
  shape?: TimerShape; // タイマーの形状
  color?: TimerColor; // タイマーの色
  isCompact?: boolean; // コンパクト表示にするかどうか
  dragControls?: DragControls; // ドラッグ制御用
}

/**
 * 内部表示用のプロパティ
 */
interface TaskCardViewProps extends TaskCardProps {
  remaining: number; // 残り時間
  isDone: boolean; // 完了しているか
  isOverdue: boolean; // 時間超過しているか
}

/**
 * コンパクト表示用のレイアウト
 */
const TaskCardCompact: React.FC<TaskCardViewProps> = ({
  task,
  shape,
  color,
  remaining,
  isDone,
  isOverdue,
  dragControls,
}) => (
  <div className={styles.compactLayout}>
    {dragControls && (
      <div
        className={styles.dragHandle}
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        style={{ cursor: 'grab' }}
      >
        <GripVertical size={16} />
      </div>
    )}
    <div className={styles.compactTop}>
      {task.icon && <img src={task.icon} alt={task.name} className={styles.taskImageCompact} />}
      <div className={styles.compactText}>
        <div className={styles.taskName}>{task.name}</div>
        <div className={styles.taskTime}>
          {isDone ? (task.kind === 'reward' ? 'おわり' : 'できた！') : formatTime(remaining)}
        </div>
      </div>
    </div>
    <div className={styles.compactBottom}>
      {isDone ? (
        <div className={`${styles.taskIcon} ${styles.done} ${styles.compactDone}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={32} strokeWidth={4} />
          </motion.div>
        </div>
      ) : (
        <DonutTimer
          totalSeconds={task.plannedSeconds}
          elapsedSeconds={task.elapsedSeconds}
          isOverdue={isOverdue}
          size={80}
          strokeWidth={14}
          shape={shape}
          color={color}
        />
      )}
    </div>
  </div>
);

/**
 * 通常表示用のレイアウト
 */
const TaskCardNormal: React.FC<TaskCardViewProps> = ({
  task,
  isSelected,
  shape,
  color,
  remaining,
  isDone,
  isOverdue,
  dragControls,
}) => (
  <>
    {dragControls && (
      <div
        className={styles.dragHandle}
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        style={{ cursor: 'grab' }}
      >
        <GripVertical size={20} />
      </div>
    )}
    {!isDone && (
      <div className={styles.taskImageContainer}>
        {task.icon ? (
          <motion.img
            src={task.icon}
            alt={task.name}
            className={styles.taskImage}
            animate={
              isSelected && task.elapsedSeconds < task.plannedSeconds
                ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, -2, 2, 0],
                  }
                : {}
            }
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        ) : (
          <div className={styles.placeholderIcon}>
            <Camera size={48} color="var(--color-primary)" opacity={0.3} />
          </div>
        )}
      </div>
    )}

    {isDone ? (
      <div className={`${styles.taskIcon} ${styles.done}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <Check size={48} strokeWidth={4} />
        </motion.div>
      </div>
    ) : (
      <DonutTimer
        totalSeconds={task.plannedSeconds}
        elapsedSeconds={task.elapsedSeconds}
        isOverdue={isOverdue}
        size={100}
        strokeWidth={20}
        shape={shape}
        color={color}
      />
    )}

    <div className={styles.taskName}>{task.name}</div>
    <div className={styles.taskTime}>
      {isDone ? (task.kind === 'reward' ? 'おわり' : 'できた！') : formatTime(remaining)}
    </div>
  </>
);

/**
 * カードのCSSクラス名を生成する
 */
const getCardClassName = (
  isSelected: boolean,
  isDone: boolean,
  isOverdue: boolean,
  isCompact: boolean,
  isReward: boolean
) => {
  return [
    styles.taskCard,
    isSelected && styles.selected,
    isDone && styles.done,
    isOverdue && styles.overdue,
    isCompact && styles.compact,
    isReward && styles.reward,
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * タスクの重要度（時間）に応じたflex-grow値を計算する
 */
const getFlexGrow = (status: string, elapsed: number, planned: number, actual: number) => {
  return Math.min(
    2.5,
    Math.pow((status === 'done' ? actual : Math.max(planned, elapsed)) / 60, 0.3)
  );
};

/**
 * タスクカードコンポーネント
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  isSelectable,
  onSelect,
  shape,
  color,
  isCompact = false,
  dragControls,
}) => {
  const remaining = task.plannedSeconds - task.elapsedSeconds;
  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.elapsedSeconds > task.plannedSeconds;
  const isReward = task.kind === 'reward';

  const cardClassName = getCardClassName(isSelected, isDone, isOverdue, isCompact, isReward);
  const flexGrow = getFlexGrow(
    task.status,
    task.elapsedSeconds,
    task.plannedSeconds,
    task.actualSeconds
  );

  const viewProps: TaskCardViewProps = {
    task,
    isSelected,
    isSelectable,
    onSelect,
    shape,
    color,
    remaining,
    isDone,
    isOverdue,
    dragControls,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSelected ? 1.05 : 1,
        transition: { duration: 0.3 },
      }}
      whileHover={isSelectable && !isDone ? { y: -5, transition: { duration: 0.2 } } : {}}
      whileTap={isSelectable && !isDone ? { scale: 0.95 } : {}}
      className={cardClassName}
      style={{ flexGrow }}
      onClick={() => {
        if (isSelectable) onSelect(task.id);
      }}
    >
      {isCompact ? <TaskCardCompact {...viewProps} /> : <TaskCardNormal {...viewProps} />}
    </motion.div>
  );
};
