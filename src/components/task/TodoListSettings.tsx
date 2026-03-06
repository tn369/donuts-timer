/**
 * やることリストの詳細設定（名前、形状、色、タスク構成、目標時刻）を行うコンポーネント
 */
import { ArrowLeft, Save } from 'lucide-react';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { RewardTaskSettings, Task, TimerColor, TimerShape, TodoList } from '../../types';
import { TodoListAppearanceSection } from './TodoListAppearanceSection';
import { TodoListNameSection } from './TodoListNameSection';
import { TITLE_SUFFIX } from './TodoListSettings.constants';
import styles from './TodoListSettings.module.css';
import { TodoListSettingsDialogs } from './TodoListSettingsDialogs';
import { TodoListTasksSection } from './TodoListTasksSection';

/**
 * TodoListSettingsのプロパティ
 */
interface TodoListSettingsProps {
  list: TodoList;
  allExistingIcons?: string[];
  onSave: (list: TodoList) => void;
  onBack: () => void;
}

/**
 * やることリストの設定画面コンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.list 編集対象のリスト
 * @param root0.allExistingIcons 既存の全アイコンURLリスト
 * @param root0.onSave 保存時のコールバック
 * @param root0.onBack 戻るボタンのコールバック
 * @returns レンダリングされるJSX要素
 */
export const TodoListSettings: React.FC<TodoListSettingsProps> = ({
  list,
  allExistingIcons = [],
  onSave,
  onBack,
}) => {
  const [editedList, setEditedList] = useState<TodoList>({ ...list });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPresetConfirmDialog, setShowPresetConfirmDialog] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<string | null>(null);
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);

  const handleTitleChange = (title: string) => {
    setEditedList((prev) => ({ ...prev, title }));
  };

  const handleShapeChange = (shape: TimerShape) => {
    setEditedList((prev) => ({
      ...prev,
      timerSettings: {
        shape,
        color: prev.timerSettings?.color ?? 'blue',
      },
    }));
  };

  const handleColorChange = (color: TimerColor) => {
    setEditedList((prev) => ({
      ...prev,
      timerSettings: {
        shape: prev.timerSettings?.shape ?? 'circle',
        color,
      },
    }));
  };

  const handleTaskChange = (taskId: string, updates: Partial<Task>) => {
    setEditedList((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    }));
  };

  const addTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      name: 'あたらしいやること',
      icon: '',
      plannedSeconds: 5 * 60,
      kind: 'todo',
      status: 'todo',
      elapsedSeconds: 0,
      actualSeconds: 0,
    };

    setEditedList((prev) => {
      const rewardIndex = prev.tasks.findIndex((task) => task.kind === 'reward');
      const newTasks = [...prev.tasks];

      if (rewardIndex !== -1) {
        newTasks.splice(rewardIndex, 0, newTask);
      } else {
        newTasks.push(newTask);
      }

      return { ...prev, tasks: newTasks };
    });
  };

  const removeTask = (taskId: string) => {
    setEditedList((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId || task.kind === 'reward'),
    }));
  };

  const handleRewardSettingsChange = (taskId: string, settings: Partial<RewardTaskSettings>) => {
    setEditedList((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId && task.kind === 'reward'
          ? {
              ...task,
              rewardSettings: { ...(task.rewardSettings ?? { mode: 'duration' }), ...settings },
            }
          : task
      ),
    }));
  };

  const handleReorderTasks = (newOrder: Task[]) => {
    setEditedList((prev) => ({ ...prev, tasks: newOrder }));
  };

  const hasChanges = JSON.stringify(list) !== JSON.stringify(editedList);

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
      return;
    }
    onBack();
  };

  const handlePresetConfirmRequest = (preset: string) => {
    setPendingPreset(preset);
    setShowPresetConfirmDialog(true);
  };

  const applyPreset = (preset: string) => {
    handleTitleChange(preset + TITLE_SUFFIX);
    setIsTitleManuallyEdited(false);
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.settingsTitle}>
          <span>やることリスト の せってい</span>
        </div>

        <button
          onClick={() => {
            const titleWithoutSuffix = editedList.title.endsWith(TITLE_SUFFIX)
              ? editedList.title.slice(0, -TITLE_SUFFIX.length)
              : editedList.title;
            onSave({ ...editedList, title: titleWithoutSuffix });
          }}
          className={`${styles.confirmButton} ${styles.hasChanges}`}
          style={{ marginLeft: 'auto' }}
        >
          <Save size={20} />
          <span>ほぞんする</span>
        </button>
      </div>

      <div className={styles.settingsContent}>
        <TodoListNameSection
          title={editedList.title}
          isTitleManuallyEdited={isTitleManuallyEdited}
          onTitleManuallyEditedChange={setIsTitleManuallyEdited}
          onTitleChange={handleTitleChange}
          onPresetConfirmRequest={handlePresetConfirmRequest}
        />

        <TodoListAppearanceSection
          shape={editedList.timerSettings?.shape}
          color={editedList.timerSettings?.color}
          onShapeChange={handleShapeChange}
          onColorChange={handleColorChange}
        />

        <TodoListTasksSection
          tasks={editedList.tasks}
          allExistingIcons={allExistingIcons}
          onTaskChange={handleTaskChange}
          onRemoveTask={removeTask}
          onRewardSettingsChange={handleRewardSettingsChange}
          onReorderTasks={handleReorderTasks}
          onAddTask={addTask}
        />
      </div>

      <TodoListSettingsDialogs
        showConfirmDialog={showConfirmDialog}
        showPresetConfirmDialog={showPresetConfirmDialog}
        pendingPreset={pendingPreset}
        onCloseBackConfirm={() => {
          setShowConfirmDialog(false);
        }}
        onConfirmBack={onBack}
        onClosePresetConfirm={() => {
          setShowPresetConfirmDialog(false);
          setPendingPreset(null);
        }}
        onConfirmPreset={applyPreset}
      />
    </div>
  );
};
