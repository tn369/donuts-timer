import type { Task, TimerShape, TimerColor } from '../types';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  isTaskSelectable: (taskId: string) => boolean;
  onSelectTask: (taskId: string) => void;
  shape?: TimerShape;
  color?: TimerColor;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  isTaskSelectable,
  onSelectTask,
  shape,
  color,
}) => {
  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={task.id === selectedTaskId}
          isSelectable={isTaskSelectable(task.id)}
          onSelect={onSelectTask}
          shape={shape}
          color={color}
        />
      ))}
    </div>
  );
};
