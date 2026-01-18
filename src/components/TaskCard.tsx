import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CircularTimer } from './CircularTimer';
import type { Task } from '../types';
import { formatTime } from '../utils';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  isSelectable,
  onSelect,
}) => {
  const remaining = task.plannedSeconds - task.elapsedSeconds;
  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.elapsedSeconds > task.plannedSeconds;

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
      className={`task-card ${isSelected ? 'selected' : ''} ${isDone ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}
      style={{
        flexGrow: (task.status === 'done' ? task.actualSeconds : Math.max(task.plannedSeconds, task.elapsedSeconds)) / 60
      }}
      onClick={() => isSelectable && onSelect(task.id)}
    >
      {isDone ? (
        <div className="task-icon done">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={48} color="var(--color-primary)" strokeWidth={3} />
          </motion.div>
        </div>
      ) : (
        <CircularTimer
          totalSeconds={task.plannedSeconds}
          elapsedSeconds={task.elapsedSeconds}
          icon={task.icon}
          isOverdue={isOverdue}
          size={120}
          strokeWidth={24}
        />
      )}

      <div className="task-name">{task.name}</div>
      <div className="task-time" style={{ color: isOverdue ? 'var(--color-danger)' : '' }}>
        {isDone ? (
          "できた！"
        ) : (
          formatTime(remaining)
        )}
      </div>

    </motion.div>
  );
};
