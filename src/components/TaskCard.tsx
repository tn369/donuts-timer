import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
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
      style={{ flexGrow: task.plannedSeconds / 60 }}
      onClick={() => isSelectable && onSelect(task.id)}
    >
      <motion.div
        className="task-icon"
        animate={task.status === 'running' ? {
          scale: [1, 1.1, 1],
          transition: { repeat: Infinity, duration: 2 }
        } : {}}
      >
        {task.icon}
      </motion.div>
      <div className="task-name">{task.name}</div>
      <div className="task-time" style={{ color: isOverdue ? 'var(--color-danger)' : '' }}>
        {isDone ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={28} color="var(--color-primary)" strokeWidth={3} />
          </motion.div>
        ) : (
          formatTime(remaining)
        )}
      </div>

      <AnimatePresence>
        {(task.status === 'running' || task.status === 'paused') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 8 }}
            exit={{ opacity: 0, height: 0 }}
            className="task-progress-bar"
          >
            <motion.div
              className="task-progress-fill"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (task.elapsedSeconds / task.plannedSeconds) * 100)}%`
              }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundColor: isOverdue ? 'var(--color-danger)' : 'var(--color-primary)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
