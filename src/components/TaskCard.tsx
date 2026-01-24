import React from 'react';
import { motion } from 'framer-motion';
import { Check, Camera } from 'lucide-react';
import { DonutTimer } from './DonutTimer';
import type { Task, TimerShape, TimerColor } from '../types';
import { formatTime } from '../utils';
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

  const cardClassName = `
    ${styles.taskCard} 
    ${isSelected ? styles.selected : ''} 
    ${isDone ? styles.done : ''} 
    ${isOverdue ? styles.overdue : ''}
    ${isCompact ? styles.compact : ''}
  `.trim();

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
      style={{
        flexGrow: Math.min(
          2.5,
          Math.pow(
            (task.status === 'done'
              ? task.actualSeconds
              : Math.max(task.plannedSeconds, task.elapsedSeconds)) / 60,
            0.3
          )
        ),
      }}
      onClick={() => isSelectable && onSelect(task.id)}
    >
      {isCompact ? (
        // コンパクトモード：画像とテキストを上に、ドーナツを下に
        <div className={styles.compactLayout}>
          <div className={styles.compactTop}>
            {task.icon && (
              <img src={task.icon} alt={task.name} className={styles.taskImageCompact} />
            )}
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
      ) : (
        // 通常モード：縦型レイアウト
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
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
      )}
    </motion.div>
  );
};
