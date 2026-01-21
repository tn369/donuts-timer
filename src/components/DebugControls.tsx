import React from 'react';
import type { Task } from '../types';
import styles from './DebugControls.module.css';

interface DebugControlsProps {
  selectedTaskId: string | null;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const DebugControls: React.FC<DebugControlsProps> = ({
  selectedTaskId,
  tasks,
  setTasks,
}) => {
  if (!import.meta.env.DEV) return null;

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  if (!selectedTask || selectedTask.status === 'done') return null;

  return (
    <div className={styles.debugControls}>
      <button
        className={styles.btnDebug}
        onClick={() => {
          const newTasks = tasks.map((task) =>
            task.id === selectedTaskId
              ? { ...task, elapsedSeconds: Math.max(0, task.plannedSeconds - 60) }
              : task
          );
          setTasks(newTasks);
        }}
      >
        ⏩ のこり 1ぷん
      </button>
      <button
        className={styles.btnDebug}
        onClick={() => {
          const newTasks = tasks.map((task) =>
            task.id === selectedTaskId
              ? { ...task, elapsedSeconds: Math.max(0, task.plannedSeconds - 5) }
              : task
          );
          setTasks(newTasks);
        }}
      >
        ⏩ のこり 5びょう
      </button>
    </div>
  );
};
