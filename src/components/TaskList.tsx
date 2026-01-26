import type { Task, TimerColor,TimerShape } from '../types';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  isTaskSelectable: (taskId: string) => boolean;
  onSelectTask: (taskId: string) => void;
  shape?: TimerShape;
  color?: TimerColor;
  isCompact?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  isTaskSelectable,
  onSelectTask,
  shape,
  color,
  isCompact = false,
}) => {
  return (
    <div className={`${styles.taskList} ${isCompact ? styles.compact : ''}`}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={task.id === selectedTaskId}
          isSelectable={isTaskSelectable(task.id)}
          onSelect={onSelectTask}
          shape={shape}
          color={color}
          isCompact={isCompact}
        />
      ))}
    </div>
  );
};
