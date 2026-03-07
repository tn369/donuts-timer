import React from 'react';

import type { RewardTaskSettings, Task, TodoList } from '../../types';
import { TaskEditorItem } from './TaskEditorItem';
import styles from './TodoListSettings.module.css';

interface RewardSettingsSectionProps {
  rewardTask: Task | null;
  allExistingIcons: string[];
  allTodoLists: TodoList[];
  currentListId: string;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
}

export const RewardSettingsSection: React.FC<RewardSettingsSectionProps> = ({
  rewardTask,
  allExistingIcons,
  allTodoLists,
  currentListId,
  onTaskChange,
  onRemoveTask,
  onRewardSettingsChange,
}) => (
  <section className={styles.settingsSection}>
    <div className={styles.rewardSectionHeader}>
      <h2 className={styles.sectionTitle}>ごほうび</h2>
      <p className={styles.sectionDescription}>
        やること が おわった あとに さいごに する ごほうび を きめよう
      </p>
    </div>

    {rewardTask ? (
      <TaskEditorItem
        task={rewardTask}
        onTaskChange={onTaskChange}
        onRemoveTask={onRemoveTask}
        onRewardSettingsChange={onRewardSettingsChange}
        allExistingIcons={allExistingIcons}
        allTodoLists={allTodoLists}
        currentListId={currentListId}
      />
    ) : (
      <div className={styles.rewardEmptyState}>ごほうび が まだ ありません</div>
    )}
  </section>
);
