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
  const remaining = Math.max(0, task.plannedSeconds - task.elapsedSeconds);
  const isDone = task.status === 'done';

  return (
    <div
      className={`task-card ${isSelected ? 'selected' : ''} ${isDone ? 'done' : ''} ${!isSelectable ? 'disabled' : ''}`}
      style={{ flexGrow: task.plannedSeconds / 60 }}
      onClick={() => isSelectable && onSelect(task.id)}
    >
      <div className="task-icon">{task.icon}</div>
      <div className="task-name">{task.name}</div>
      <div className="task-time">
        {isDone ? '✓' : formatTime(remaining)}
      </div>
      {task.status === 'running' && (
        <div className="task-progress-bar">
          <div
            className="task-progress-fill"
            style={{
              width: `${(task.elapsedSeconds / task.plannedSeconds) * 100}%`,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};
