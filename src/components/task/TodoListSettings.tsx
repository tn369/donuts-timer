/**
 * やることリストの詳細設定（名前、形状、色、タスク構成、目標時刻）を行うコンポーネント
 */
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

import type { RewardTaskSettings, Task, TodoList } from '../../types';
import { ShapeIcon } from '../common/ShapeIcon';
import { TaskEditorItem } from './TaskEditorItem';
import styles from './TodoListSettings.module.css';

/**
 * TodoListSettingsのプロパティ
 */
interface TodoListSettingsProps {
  list: TodoList; // 編集対象のリスト
  allExistingIcons?: string[]; // 既存のすべてのアイコン（再利用のため）
  onSave: (list: TodoList) => void; // 保存時のコールバック
  onBack: () => void; // 戻るボタンのコールバック
}

/**
 * カラー設定の定数
 */
const COLOR_VALUES: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  green: '#10b981',
  pink: '#ec4899',
  purple: '#8b5cf6',
  orange: '#f97316',
  teal: '#14b8a6',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  lime: '#84cc16',
};

/**
 * カラーの日本語名
 */
const COLOR_NAMES: Record<string, string> = {
  red: 'あか',
  blue: 'あお',
  yellow: 'きいろ',
  green: 'みどり',
  pink: 'ももいろ',
  purple: 'むらさき',
  orange: 'だいだい',
  teal: 'てぃーる',
  indigo: 'あい',
  cyan: 'しあん',
  lime: 'らいむ',
};

/**
 * 形状の日本語名
 */
const SHAPE_NAMES: Record<string, string> = {
  circle: 'まる',
  square: 'しかく',
  triangle: 'さんかく',
  diamond: 'だいや',
  pentagon: 'ごかく',
  hexagon: 'ろっかく',
  octagon: 'はっかく',
  star: 'ほし',
  heart: 'はーと',
};

const SHAPES = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'heart',
] as const;
const COLORS = [
  'red',
  'blue',
  'yellow',
  'green',
  'pink',
  'purple',
  'orange',
  'teal',
  'indigo',
  'cyan',
  'lime',
] as const;

const TITLE_SUFFIX = 'のやることリスト';
const PRESET_TITLES = ['あさ', 'おひる', 'ゆうがた', 'よる', 'しゅくだい', 'おけいこ'];

/**
 * ドラッグ可能な個別のタスクアイテムコンポーネント
 * Hook(useDragControls) をループ外（このコンポーネント内）で呼び出すために抽出
 */
const ReorderableTaskItem: React.FC<{
  task: Task;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
  allExistingIcons: string[];
}> = ({ task, onTaskChange, onRemoveTask, onRewardSettingsChange, allExistingIcons }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item key={task.id} value={task} dragListener={false} dragControls={dragControls}>
      <TaskEditorItem
        task={task}
        onTaskChange={onTaskChange}
        onRemoveTask={onRemoveTask}
        onRewardSettingsChange={onRewardSettingsChange}
        allExistingIcons={allExistingIcons}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
};

/**
 * やることリストの設定画面コンポーネント
 */
export const TodoListSettings: React.FC<TodoListSettingsProps> = ({
  list,
  allExistingIcons = [],
  onSave,
  onBack,
}) => {
  const [editedList, setEditedList] = useState<TodoList>({ ...list });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleTitleChange = (title: string) => {
    setEditedList({ ...editedList, title });
  };

  const currentPrefix = editedList.title.endsWith(TITLE_SUFFIX)
    ? editedList.title.slice(0, -TITLE_SUFFIX.length)
    : editedList.title;

  const handlePresetClick = (preset: string) => {
    handleTitleChange(preset + TITLE_SUFFIX);
  };

  const handleTaskChange = (taskId: string, updates: Partial<Task>) => {
    setEditedList({
      ...editedList,
      tasks: editedList.tasks.map((t: Task) => (t.id === taskId ? { ...t, ...updates } : t)),
    });
  };

  const addTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      name: '新しいやること',
      icon: '',
      plannedSeconds: 5 * 60,
      kind: 'todo',
      status: 'todo',
      elapsedSeconds: 0,
      actualSeconds: 0,
    };

    const rewardIndex = editedList.tasks.findIndex((t: Task) => t.kind === 'reward');
    const newTasks = [...editedList.tasks];
    if (rewardIndex !== -1) {
      newTasks.splice(rewardIndex, 0, newTask);
    } else {
      newTasks.push(newTask);
    }

    setEditedList({ ...editedList, tasks: newTasks });
  };

  const removeTask = (taskId: string) => {
    setEditedList({
      ...editedList,
      tasks: editedList.tasks.filter((t: Task) => t.id !== taskId || t.kind === 'reward'),
    });
  };

  const handleRewardSettingsChange = (taskId: string, settings: Partial<RewardTaskSettings>) => {
    setEditedList({
      ...editedList,
      tasks: editedList.tasks.map((t: Task) =>
        t.id === taskId && t.kind === 'reward'
          ? { ...t, rewardSettings: { ...(t.rewardSettings ?? { mode: 'duration' }), ...settings } }
          : t
      ),
    });
  };

  const handleReorderTasks = (newOrder: Task[]) => {
    setEditedList({
      ...editedList,
      tasks: newOrder,
    });
  };

  const hasChanges = JSON.stringify(list) !== JSON.stringify(editedList);

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onBack();
    }
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
            onSave(editedList);
          }}
          className={`${styles.confirmButton} ${styles.hasChanges}`}
          style={{ marginLeft: 'auto' }}
        >
          <Save size={20} />
          <span>ほぞんする</span>
        </button>
      </div>

      <div className={styles.settingsContent}>
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>リストのなまえ</h2>
          <div className={styles.titleInputContainer}>
            <input
              type="text"
              className={styles.titleInputPrefix}
              value={currentPrefix}
              onChange={(e) => {
                handleTitleChange(e.target.value + TITLE_SUFFIX);
              }}
              placeholder="なまえ"
              onFocus={(e) => {
                e.target.select();
              }}
            />
            <span className={styles.titleSuffix}>{TITLE_SUFFIX}</span>
          </div>
          <div className={styles.presetsContainer}>
            {PRESET_TITLES.map((preset) => (
              <button
                key={preset}
                className={`${styles.presetChip} ${currentPrefix === preset ? styles.active : ''}`}
                onClick={() => {
                  handlePresetClick(preset);
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>どーなつタイマー の かたち</h2>
          <div className={styles.shapeSelection}>
            {SHAPES.map((s) => (
              <button
                key={s}
                className={`${styles.modeButton} ${editedList.timerSettings?.shape === s || (!editedList.timerSettings?.shape && s === 'circle') ? styles.active : ''}`}
                onClick={() => {
                  setEditedList({
                    ...editedList,
                    timerSettings: {
                      shape: s,
                      color: editedList.timerSettings?.color ?? 'blue',
                    },
                  });
                }}
                aria-label={`${s}のかたち`}
              >
                <div className={styles.modeIcon}>
                  <ShapeIcon shape={s} size={40} color="currentColor" />
                </div>
                <div className={styles.modeLabel}>{SHAPE_NAMES[s]}</div>
              </button>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>どーなつタイマー の いろ</h2>
          <div className={styles.colorSelection}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorButton} ${editedList.timerSettings?.color === c || (!editedList.timerSettings?.color && c === 'blue') ? styles.active : ''}`}
                onClick={() => {
                  setEditedList({
                    ...editedList,
                    timerSettings: {
                      shape: editedList.timerSettings?.shape ?? 'circle',
                      color: c,
                    },
                  });
                }}
                style={{ color: COLOR_VALUES[c] }}
              >
                <div className={styles.colorCircle} style={{ background: COLOR_VALUES[c] }} />
                <div className={styles.colorLabel}>{COLOR_NAMES[c]}</div>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>やること の せってい</h2>

          <div className={styles.taskEditorList}>
            <Reorder.Group
              axis="x"
              values={editedList.tasks}
              onReorder={handleReorderTasks}
              className={styles.reorderGroup}
            >
              {editedList.tasks.map((task: Task) => (
                <ReorderableTaskItem
                  key={task.id}
                  task={task}
                  onTaskChange={handleTaskChange}
                  onRemoveTask={removeTask}
                  onRewardSettingsChange={handleRewardSettingsChange}
                  allExistingIcons={allExistingIcons}
                />
              ))}
            </Reorder.Group>

            <motion.button
              layout
              key="add-task-button"
              className={styles.addTaskBtn}
              onClick={addTask}
            >
              <Plus size={20} />
              <span>やること を ついか</span>
            </motion.button>
          </div>
        </section>
      </div>

      {createPortal(
        <AnimatePresence>
          {showConfirmDialog && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.modalBackdrop}
                onClick={() => {
                  setShowConfirmDialog(false);
                }}
              />
              <div className={styles.modalContainer}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={styles.confirmDialog}
                >
                  <div className={styles.confirmDialogMessage}>
                    へんこう されています。
                    <br />
                    ほぞんせずに もどりますか？
                  </div>
                  <div className={styles.confirmDialogActions}>
                    <button
                      className={`${styles.confirmDialogBtn} ${styles.cancelBtn}`}
                      onClick={() => {
                        setShowConfirmDialog(false);
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      className={`${styles.confirmDialogBtn} ${styles.leaveBtn}`}
                      onClick={onBack}
                    >
                      もどる
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
