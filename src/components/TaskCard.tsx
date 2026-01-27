/**
 * タスク情報を表示するカードコンポーネント。
 */

import { motion } from 'framer-motion';
import { Camera, Check } from 'lucide-react';
import React from 'react';

import type { Task, TimerColor, TimerShape } from '../types';
import { formatTime } from '../utils/time';
import { DonutTimer } from './DonutTimer';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: (taskId: string) => void;
  shape?: TimerShape;
  color?: TimerColor;
  isCompact?: boolean;
}

interface TaskCardViewProps extends TaskCardProps {
  remaining: number;
  isDone: boolean;
  isOverdue: boolean;
}

const TaskCardCompact: React.FC<TaskCardViewProps> = ({
  task,
  shape,
  color,
  remaining,
  isDone,
  isOverdue,
}) => (
  <div className={styles.compactLayout}>
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

const TaskCardNormal: React.FC<TaskCardViewProps> = ({
  task,
  isSelected,
  shape,
  color,
  remaining,
  isDone,
  isOverdue,
}) => (
  <>
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

const getFlexGrow = (status: string, elapsed: number, planned: number, actual: number) => {
  return Math.min(
    2.5,
    Math.pow((status === 'done' ? actual : Math.max(planned, elapsed)) / 60, 0.3)
  );
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  isSelectable,
  onSelect,
  shape,
  color,
  isCompact = false,
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
