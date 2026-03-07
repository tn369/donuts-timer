import { motion, Reorder, useDragControls } from 'framer-motion';
import { Plus } from 'lucide-react';
import React from 'react';

import type { RewardTaskSettings, Task, TodoList } from '../../types';
import { TaskEditorItem } from './TaskEditorItem';
import styles from './TodoListSettings.module.css';

const ReorderableTaskItem: React.FC<{
  task: Task;
  currentListId: string;
  allTodoLists: TodoList[];
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
  allExistingIcons: string[];
}> = ({
  task,
  currentListId,
  allTodoLists,
  onTaskChange,
  onRemoveTask,
  onRewardSettingsChange,
  allExistingIcons,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item key={task.id} value={task} dragListener={false} dragControls={dragControls}>
      <TaskEditorItem
        task={task}
        onTaskChange={onTaskChange}
        onRemoveTask={onRemoveTask}
        onRewardSettingsChange={onRewardSettingsChange}
        allExistingIcons={allExistingIcons}
        allTodoLists={allTodoLists}
        currentListId={currentListId}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
};

interface TodoListTasksSectionProps {
  todoTasks: Task[];
  allExistingIcons: string[];
  allTodoLists: TodoList[];
  currentListId: string;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
  onReorderTasks: (newOrder: Task[]) => void;
  onAddTask: () => void;
}

export const TodoListTasksSection: React.FC<TodoListTasksSectionProps> = ({
  todoTasks,
  allExistingIcons,
  allTodoLists,
  currentListId,
  onTaskChange,
  onRemoveTask,
  onRewardSettingsChange,
  onReorderTasks,
  onAddTask,
}) => (
  <section className={styles.settingsSection}>
    <h2 className={styles.sectionTitle}>やること</h2>

    <div className={styles.taskEditorList}>
      <Reorder.Group
        axis="y"
        values={todoTasks}
        onReorder={onReorderTasks}
        className={styles.reorderGroup}
      >
        {todoTasks.map((task) => (
          <ReorderableTaskItem
            key={task.id}
            task={task}
            currentListId={currentListId}
            allTodoLists={allTodoLists}
            onTaskChange={onTaskChange}
            onRemoveTask={onRemoveTask}
            onRewardSettingsChange={onRewardSettingsChange}
            allExistingIcons={allExistingIcons}
          />
        ))}
      </Reorder.Group>

      <motion.button layout key="add-task-button" className={styles.addTaskBtn} onClick={onAddTask}>
        <Plus size={20} />
        <span>やること を ついか</span>
      </motion.button>
    </div>
  </section>
);
