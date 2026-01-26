import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Camera, Save, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import type { TodoList, Task, TargetTimeSettings } from '../types';
import styles from './TodoListSettings.module.css';
import { ShapeIcon } from './ShapeIcon';
import { v4 as uuidv4 } from 'uuid';
import { resizeImage } from '../utils/image';

interface TodoListSettingsProps {
  list: TodoList;
  allExistingIcons?: string[];
  onSave: (list: TodoList) => void;
  onBack: () => void;
}

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

export const TodoListSettings: React.FC<TodoListSettingsProps> = ({
  list,
  allExistingIcons = [],
  onSave,
  onBack,
}) => {
  const [editedList, setEditedList] = useState<TodoList>({ ...list });

  const handleTitleChange = (title: string) => {
    setEditedList({ ...editedList, title });
  };

  const handleTaskChange = (taskId: string, updates: Partial<Task>) => {
    setEditedList({
      ...editedList,
      tasks: editedList.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
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

    const rewardIndex = editedList.tasks.findIndex((t) => t.kind === 'reward');
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
      tasks: editedList.tasks.filter((t) => t.id !== taskId || t.kind === 'reward'),
    });
  };

  const handleTargetTimeChange = (updates: Partial<TargetTimeSettings>) => {
    setEditedList({
      ...editedList,
      targetTimeSettings: { ...editedList.targetTimeSettings, ...updates },
    });
  };

  const handleReorderTasks = (newOrder: Task[]) => {
    const rewardTasks = editedList.tasks.filter((t) => t.kind === 'reward');
    setEditedList({
      ...editedList,
      tasks: [...newOrder, ...rewardTasks],
    });
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.settingsTitle}>
          <span>やることリスト の せってい</span>
        </div>
        <button
          onClick={() => onSave(editedList)}
          className={`${styles.confirmButton} ${styles.hasChanges}`}
          style={{ marginLeft: 'auto' }}
        >
          <Save size={20} />
          <span>保存する</span>
        </button>
      </div>

      <div className={styles.settingsContent}>
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>リストのなまえ</h2>
          <input
            type="text"
            className={styles.titleInput}
            value={editedList.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="リストのなまえを入力..."
          />
        </section>
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>どーなつタイマー の かたち</h2>
          <div className={styles.shapeSelection}>
            {SHAPES.map((s) => (
              <button
                key={s}
                className={`${styles.modeButton} ${editedList.timerSettings?.shape === s || (!editedList.timerSettings?.shape && s === 'circle') ? styles.active : ''}`}
                onClick={() =>
                  setEditedList({
                    ...editedList,
                    timerSettings: {
                      shape: s,
                      color: editedList.timerSettings?.color || 'blue',
                    },
                  })
                }
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
                onClick={() =>
                  setEditedList({
                    ...editedList,
                    timerSettings: {
                      shape: editedList.timerSettings?.shape || 'circle',
                      color: c,
                    },
                  })
                }
                style={{ color: COLOR_VALUES[c] }}
              >
                <div className={styles.colorCircle} style={{ background: COLOR_VALUES[c] }} />
                <div className={styles.colorLabel}>{COLOR_NAMES[c]}</div>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>ごほうび の じかん計算</h2>
          <div className={styles.modeSelection}>
            <button
              className={`${styles.modeButton} ${editedList.targetTimeSettings.mode === 'duration' ? styles.active : ''}`}
              onClick={() => handleTargetTimeChange({ mode: 'duration' })}
            >
              <div className={styles.modeIcon}>⏳</div>
              <div className={styles.modeLabel}>きまった時間</div>
              <div className={styles.modeDescription}>のこった時間があそび時間</div>
            </button>
            <button
              className={`${styles.modeButton} ${editedList.targetTimeSettings.mode === 'target-time' ? styles.active : ''}`}
              onClick={() => handleTargetTimeChange({ mode: 'target-time' })}
            >
              <div className={styles.modeIcon}>⏰</div>
              <div className={styles.modeLabel}>おわる時刻</div>
              <div className={styles.modeDescription}>出発にまにあうよう調整</div>
            </button>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>やること の せってい</h2>
          <div className={styles.taskEditorList}>
            <Reorder.Group
              axis="y"
              values={editedList.tasks.filter((t) => t.kind !== 'reward')}
              onReorder={handleReorderTasks}
              className={styles.reorderGroup}
            >
              {editedList.tasks
                .filter((t) => t.kind !== 'reward')
                .map((task) => (
                  <Reorder.Item key={task.id} value={task}>
                    <TaskEditorItem
                      task={task}
                      mode={editedList.targetTimeSettings.mode}
                      targetHour={editedList.targetTimeSettings.targetHour}
                      targetMinute={editedList.targetTimeSettings.targetMinute}
                      onTaskChange={handleTaskChange}
                      onRemoveTask={removeTask}
                      onTargetTimeChange={handleTargetTimeChange}
                      allExistingIcons={allExistingIcons}
                    />
                  </Reorder.Item>
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

            <AnimatePresence mode="popLayout">
              {editedList.tasks
                .filter((t) => t.kind === 'reward')
                .map((task) => (
                  <TaskEditorItem
                    key={task.id}
                    task={task}
                    mode={editedList.targetTimeSettings.mode}
                    targetHour={editedList.targetTimeSettings.targetHour}
                    targetMinute={editedList.targetTimeSettings.targetMinute}
                    onTaskChange={handleTaskChange}
                    onRemoveTask={removeTask}
                    onTargetTimeChange={handleTargetTimeChange}
                    allExistingIcons={allExistingIcons}
                  />
                ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};

interface TaskEditorItemProps {
  task: Task;
  mode: 'duration' | 'target-time';
  targetHour: number;
  targetMinute: number;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onTargetTimeChange: (updates: Partial<TargetTimeSettings>) => void;
  allExistingIcons: string[];
}

const TaskEditorTimeInput: React.FC<{
  task: Task;
  mode: 'duration' | 'target-time';
  targetHour: number;
  targetMinute: number;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onTargetTimeChange: (updates: Partial<TargetTimeSettings>) => void;
}> = ({ task, mode, targetHour, targetMinute, onTaskChange, onTargetTimeChange }) => {
  if (task.kind === 'reward' && mode === 'target-time') {
    return (
      <div className={styles.taskTargetTimeInputs}>
        <select
          className={styles.timeSelectSmall}
          value={targetHour}
          onChange={(e) => onTargetTimeChange({ targetHour: parseInt(e.target.value) })}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={i}>
              {i.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <span className={styles.timeSeparatorSmall}>:</span>
        <select
          className={styles.timeSelectSmall}
          value={targetMinute}
          onChange={(e) => onTargetTimeChange({ targetMinute: parseInt(e.target.value) })}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <option key={i} value={i}>
              {i.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <span className={styles.timeLabelSmall}>におわる</span>
      </div>
    );
  }

  return (
    <>
      <input
        type="number"
        className={styles.taskMinutesInput}
        value={Math.floor(task.plannedSeconds / 60)}
        onChange={(e) =>
          onTaskChange(task.id, { plannedSeconds: parseInt(e.target.value || '0') * 60 })
        }
        disabled={task.kind === 'reward' && mode === 'target-time'}
      />
      <span>ぷん</span>
      {task.kind === 'reward' && mode === 'target-time' && (
        <span className={styles.autoCalcHint}>（じどう計算）</span>
      )}
    </>
  );
};

const TaskEditorItem: React.FC<TaskEditorItemProps> = ({
  task,
  mode,
  targetHour,
  targetMinute,
  onTaskChange,
  onRemoveTask,
  onTargetTimeChange,
  allExistingIcons,
}) => {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [popupDirection, setPopupDirection] = useState<'bottom' | 'top'>('bottom');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showIconSelector && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const popupHeight = 350;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
        setPopupDirection('top');
      } else {
        setPopupDirection('bottom');
      }
    }
  }, [showIconSelector]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('画像サイズが大きすぎます。1MB以下の画像を選んでください。');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const resizedImage = await resizeImage(base64String, 200, 200);
        onTaskChange(task.id, { icon: resizedImage });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`${styles.taskEditorItem} ${task.kind === 'reward' ? styles.reward : ''}`}
    >
      {task.kind !== 'reward' && (
        <div className={styles.dragHandle}>
          <GripVertical size={20} />
        </div>
      )}
      <div className={styles.taskEditorImage} ref={containerRef}>
        {task.icon ? (
          <img src={task.icon} alt={task.name} draggable={false} />
        ) : (
          <div className={styles.placeholderIconSmall}>
            <Camera size={24} opacity={0.3} />
          </div>
        )}
        <div className={styles.taskEditorImageButtons}>
          <button
            className={styles.changeImageBtn}
            title="がぞうをえらぶ"
            onClick={() => setShowIconSelector(!showIconSelector)}
          >
            <Camera size={14} />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <AnimatePresence>
          {showIconSelector && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.popupBackdrop}
                onClick={() => setShowIconSelector(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: popupDirection === 'bottom' ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: popupDirection === 'bottom' ? 10 : -10 }}
                className={`${styles.iconSelectorPopup} ${styles[popupDirection]}`}
              >
                <div className={styles.iconSelectorHeader}>
                  <span>がぞうをえらぶ</span>
                  <button
                    className={styles.closeSelectorBtn}
                    onClick={() => setShowIconSelector(false)}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.iconSelectorContent}>
                  <button className={styles.uploadNewBtn} onClick={handleImageClick}>
                    <Plus size={20} />
                    <span>新しくアップロード</span>
                  </button>
                  <div className={styles.existingIconsGrid}>
                    {allExistingIcons.map((icon, index) => (
                      <button
                        key={index}
                        className={`${styles.iconOption} ${task.icon === icon ? styles.active : ''}`}
                        onClick={() => {
                          onTaskChange(task.id, { icon });
                          setShowIconSelector(false);
                        }}
                      >
                        <img src={icon} alt={`Icon ${index}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.taskEditorInfo}>
        <input
          type="text"
          className={styles.taskNameInput}
          value={task.name}
          onChange={(e) => onTaskChange(task.id, { name: e.target.value })}
        />
        <div className={styles.taskTimeInputGroup}>
          <TaskEditorTimeInput
            task={task}
            mode={mode}
            targetHour={targetHour}
            targetMinute={targetMinute}
            onTaskChange={onTaskChange}
            onTargetTimeChange={onTargetTimeChange}
          />
        </div>
      </div>

      {task.kind === 'todo' && (
        <button className={styles.deleteTaskBtn} onClick={() => onRemoveTask(task.id)} title="削除">
          <Trash2 size={20} />
        </button>
      )}
      {task.kind === 'reward' && <div className={styles.rewardBadge}>ごほうび</div>}
    </motion.div>
  );
};
