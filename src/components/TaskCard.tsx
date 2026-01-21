import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { DonutTimer } from './DonutTimer';
import type { Task, TimerTheme } from '../types';
import { formatTime } from '../utils';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: (taskId: string) => void;
  theme?: TimerTheme;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  isSelectable,
  onSelect,
  theme,
}) => {
  const remaining = task.plannedSeconds - task.elapsedSeconds;
  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.elapsedSeconds > task.plannedSeconds;

  const cardClassName = `
    ${styles.taskCard} 
    ${isSelected ? styles.selected : ''} 
    ${isDone ? styles.done : ''} 
    ${isOverdue ? styles.overdue : ''}
  `.trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSelected ? 1.05 : 1,
        transition: { duration: 0.3 }
      }}
      whileHover={isSelectable && !isDone ? { y: -5, transition: { duration: 0.2 } } : {}}
      whileTap={isSelectable && !isDone ? { scale: 0.95 } : {}}
      className={cardClassName}
      style={{
        flexGrow: (task.status === 'done' ? task.actualSeconds : Math.max(task.plannedSeconds, task.elapsedSeconds)) / 60
      }}
      onClick={() => isSelectable && onSelect(task.id)}
    >
      {!isDone && (
        <div className={styles.taskImageContainer}>
          <motion.img
            src={typeof task.icon === 'string' ? task.icon : undefined}
            alt={task.name}
            className={styles.taskImage}
            animate={isSelected && task.elapsedSeconds < task.plannedSeconds ? {
              scale: [1, 1.05, 1],
              rotate: [0, -2, 2, 0]
            } : {}}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </div>
      )}

      {isDone ? (
        <div className={`${styles.taskIcon} ${styles.done}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={48} color="var(--color-primary)" strokeWidth={3} />
          </motion.div>
        </div>
      ) : (
          <DonutTimer
            totalSeconds={task.plannedSeconds}
            elapsedSeconds={task.elapsedSeconds}
            isOverdue={isOverdue}
            size={100}
            strokeWidth={20}
            theme={theme}
          />
      )}

      <div className={styles.taskName}>{task.name}</div>
      <div className={styles.taskTime}>
        {isDone ? (
          task.kind === 'reward' ? "おわり" : "できた！"
        ) : (
          formatTime(remaining)
        )}
      </div>

    </motion.div>
  );
};
