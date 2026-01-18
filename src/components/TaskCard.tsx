import React from 'react';
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
    <div
          className={`task-card ${isSelected ? 'selected' : ''} ${isDone ? 'done' : ''} ${!isSelectable ? 'disabled' : ''} ${isOverdue ? 'overdue' : ''}`}
      style={{ flexGrow: task.plannedSeconds / 60 }}
      onClick={() => isSelectable && onSelect(task.id)}
    >
      <div className="task-icon">{task.icon}</div>
      <div className="task-name">{task.name}</div>
      <div className="task-time">
        {isDone ? '✓' : formatTime(remaining)}
      </div>
          {(task.status === 'running' || task.status === 'paused') && (
        <div className="task-progress-bar">
          <div
            className="task-progress-fill"
            style={{
                width: `${Math.min(100, (task.elapsedSeconds / task.plannedSeconds) * 100)}%`,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};
