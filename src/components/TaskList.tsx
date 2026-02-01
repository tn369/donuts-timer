/**
 * タスクの一覧を表示するコンポーネント
 */
import type { Task, TimerColor, TimerShape } from '../types';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

/**
 * TaskListのプロパティ
 */
interface TaskListProps {
  tasks: Task[]; // タスク一覧
  selectedTaskId: string | null; // 選択中のタスクID
  isTaskSelectable: (taskId: string) => boolean; // タスクが選択可能かどうかの判定関数
  onSelectTask: (taskId: string) => void; // タスクが選択された時のコールバック
  shape?: TimerShape; // タイマーの形状
  color?: TimerColor; // タイマーの色
  isCompact?: boolean; // コンパクト表示にするかどうか
}

/**
 * タスクカードを並べて表示するリストコンポーネント
 */
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
