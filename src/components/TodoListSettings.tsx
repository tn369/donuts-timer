/**
 * やることリストの詳細設定（名前、形状、色、タスク構成、目標時刻）を行うコンポーネント
 */
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { ArrowLeft, Camera, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { RewardTaskSettings, Task, TodoList } from '../types';
import { resizeImage } from '../utils/image';
import { ShapeIcon } from './ShapeIcon';
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
 * やることリストの設定画面コンポーネント
 */
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

  const currentPrefix = editedList.title.endsWith(TITLE_SUFFIX)
    ? editedList.title.slice(0, -TITLE_SUFFIX.length)
    : editedList.title;

  const handlePresetClick = (preset: string) => {
    handleTitleChange(preset + TITLE_SUFFIX);
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

  const handleRewardSettingsChange = (taskId: string, settings: Partial<RewardTaskSettings>) => {
    setEditedList({
      ...editedList,
      tasks: editedList.tasks.map((t) =>
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
          onClick={() => {
            onSave(editedList);
          }}
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
              {editedList.tasks.map((task) => (
                <Reorder.Item key={task.id} value={task}>
                  <TaskEditorItem
                    task={task}
                    onTaskChange={handleTaskChange}
                    onRemoveTask={removeTask}
                    onRewardSettingsChange={handleRewardSettingsChange}
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
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * 個別のタスク編集アイテムのプロパティ
 */
interface TaskEditorItemProps {
  task: Task;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
  allExistingIcons: string[];
}

/**
 * 数値を増減させるためのステッパーコンポーネント
 */
export const TimeStepper: React.FC<{
  value: number;
  onChange: (val: number) => void;
  unit: string;
  disabled?: boolean;
  step?: number;
  max?: number;
  options?: number[];
}> = ({ value, onChange, unit, disabled, step = 5, max, options }) => {
  const handleDecrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value);
      if (currentIndex > 0) {
        onChange(options[currentIndex - 1]);
      } else if (currentIndex === -1) {
        // 現在の値がオプションにない場合は、最も近い小さい値を探す
        const smallerOptions = options.filter((o) => o < value);
        if (smallerOptions.length > 0) {
          onChange(Math.max(...smallerOptions));
        }
      }
      return;
    }

    const newValue = Math.max(0, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value);
      if (currentIndex !== -1 && currentIndex < options.length - 1) {
        onChange(options[currentIndex + 1]);
      } else if (currentIndex === -1) {
        // 現在の値がオプションにない場合は、最も近い大きい値を探す
        const largerOptions = options.filter((o) => o > value);
        if (largerOptions.length > 0) {
          onChange(Math.min(...largerOptions));
        }
      }
      return;
    }

    let newValue = value + step;
    if (max !== undefined && newValue > max) newValue = max;
    onChange(newValue);
  };

  const isDecrementDisabled = () => {
    if (disabled) return true;
    if (options) {
      return options.includes(value) && options.indexOf(value) <= 0;
    }
    return value <= 0;
  };

  const isIncrementDisabled = () => {
    if (disabled) return true;
    if (options) {
      return options.includes(value) && options.indexOf(value) >= options.length - 1;
    }
    return max !== undefined && value >= max;
  };

  return (
    <div className={styles.stepperContainer}>
      <button
        type="button"
        className={styles.stepperBtn}
        onClick={handleDecrement}
        disabled={isDecrementDisabled()}
      >
        -
      </button>
      <div className={styles.stepperValueContainer}>
        {options ? (
          <select
            className={styles.stepperInput}
            value={value}
            onChange={(e) => {
              onChange(parseInt(e.target.value));
            }}
            disabled={disabled}
            style={{ appearance: 'none', background: 'transparent', textAlign: 'center' }}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            className={styles.stepperInput}
            value={value}
            onChange={(e) => {
              onChange(parseInt(e.target.value || '0'));
            }}
            disabled={disabled}
          />
        )}
        <span className={styles.stepperUnit}>{unit}</span>
      </div>
      <button
        type="button"
        className={styles.stepperBtn}
        onClick={handleIncrement}
        disabled={isIncrementDisabled()}
      >
        +
      </button>
    </div>
  );
};

/**
 * 個別のタスク（または目標時刻）を編集するためのコンポーネント
 */
/**
 * アイコン選択ポップアップコンポーネント
 */
const IconSelectorPopup: React.FC<{
  show: boolean;
  direction: 'bottom' | 'top';
  task: Task;
  allExistingIcons: string[];
  onClose: () => void;
  onIconSelect: (icon: string) => void;
  onImageUpload: () => void;
}> = ({ show, direction, task, allExistingIcons, onClose, onIconSelect, onImageUpload }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.popupBackdrop}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: direction === 'bottom' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: direction === 'bottom' ? 10 : -10 }}
          className={`${styles.iconSelectorPopup} ${styles[direction]}`}
        >
          <div className={styles.iconSelectorHeader}>
            <span>がぞうをえらぶ</span>
            <button className={styles.closeSelectorBtn} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.iconSelectorContent}>
            <button className={styles.uploadNewBtn} onClick={onImageUpload}>
              <Plus size={20} />
              <span>新しくアップロード</span>
            </button>
            <div className={styles.existingIconsGrid}>
              {allExistingIcons.map((icon, index) => (
                <button
                  key={index}
                  className={`${styles.iconOption} ${task.icon === icon ? styles.active : ''}`}
                  onClick={() => {
                    onIconSelect(icon);
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
);

/**
 * 時間指定モードのエディタ
 */
const DurationModeEditor: React.FC<{
  task: Task;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
}> = ({ task, onTaskChange, onRewardSettingsChange }) => {
  const isDurationMode = task.rewardSettings?.mode === 'duration' || !task.rewardSettings;

  return (
    <label className={`${styles.rewardModeOption} ${isDurationMode ? styles.active : ''}`}>
      <input
        type="radio"
        name={`reward-mode-${task.id}`}
        checked={isDurationMode}
        onChange={() => {
          onRewardSettingsChange(task.id, { mode: 'duration' });
        }}
      />
      <span className={styles.rewardModeLabel}>きまった時間</span>
      <div className={styles.rewardModeInput}>
        <TimeStepper
          value={Math.floor(task.plannedSeconds / 60)}
          onChange={(val) => {
            onTaskChange(task.id, { plannedSeconds: val * 60 });
          }}
          unit="ぷん"
          disabled={task.rewardSettings?.mode === 'target-time'}
          step={5}
        />
      </div>
    </label>
  );
};

/**
 * 目標時刻モードのエディタ
 */
const TargetTimeModeEditor: React.FC<{
  task: Task;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
}> = ({ task, onRewardSettingsChange }) => {
  const isTargetTimeMode = task.rewardSettings?.mode === 'target-time';

  return (
    <label className={`${styles.rewardModeOption} ${isTargetTimeMode ? styles.active : ''}`}>
      <input
        type="radio"
        name={`reward-mode-${task.id}`}
        checked={isTargetTimeMode}
        onChange={() => {
          onRewardSettingsChange(task.id, { mode: 'target-time' });
        }}
      />
      <span className={styles.rewardModeLabel}>おわる時刻</span>
      <div className={styles.rewardModeInput}>
        <TimeStepper
          value={task.rewardSettings?.targetHour ?? 9}
          onChange={(val) => {
            onRewardSettingsChange(task.id, { targetHour: val % 24 });
          }}
          unit="じ"
          disabled={!isTargetTimeMode}
          step={1}
          max={23}
          options={Array.from({ length: 24 }, (_, i) => i)}
        />
        <TimeStepper
          value={task.rewardSettings?.targetMinute ?? 0}
          onChange={(val) => {
            onRewardSettingsChange(task.id, { targetMinute: val % 60 });
          }}
          unit="ふん"
          disabled={!isTargetTimeMode}
          step={5}
          max={55}
          options={Array.from({ length: 12 }, (_, i) => i * 5)}
        />
      </div>
    </label>
  );
};

/**
 * 報酬設定エディタコンポーネント
 */
const RewardSettingsEditor: React.FC<{
  task: Task;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
}> = ({ task, onTaskChange, onRewardSettingsChange }) => (
  <div className={styles.rewardTimeSettings}>
    <h4 className={styles.rewardTimeSettingsTitle}>じかんの けいさん</h4>
    <DurationModeEditor
      task={task}
      onTaskChange={onTaskChange}
      onRewardSettingsChange={onRewardSettingsChange}
    />
    <TargetTimeModeEditor task={task} onRewardSettingsChange={onRewardSettingsChange} />
  </div>
);

/**
 * 個別のタスク（または目標時刻）を編集するためのコンポーネント
 */
const TaskEditorItem: React.FC<TaskEditorItemProps> = ({
  task,
  onTaskChange,
  onRemoveTask,
  onRewardSettingsChange,
  allExistingIcons,
}) => {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [popupDirection, setPopupDirection] = useState<'bottom' | 'top'>('bottom');
  const containerRef = React.useRef<HTMLButtonElement>(null);
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
      <button
        type="button"
        className={styles.taskEditorImage}
        ref={containerRef}
        onClick={() => {
          setShowIconSelector(!showIconSelector);
        }}
      >
        {task.icon ? (
          <img src={task.icon} alt={task.name} draggable={false} />
        ) : (
          <div className={styles.placeholderIconSmall}>
            <Camera size={24} opacity={0.3} />
          </div>
        )}
        <div className={styles.imageOverlayLabel}>
          がぞうを
          <br />
          かえる
        </div>
        <div className={styles.taskEditorImageButtons}>
          <div className={styles.changeImageBtn}>
            <Camera size={16} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <IconSelectorPopup
          show={showIconSelector}
          direction={popupDirection}
          task={task}
          allExistingIcons={allExistingIcons}
          onClose={() => {
            setShowIconSelector(false);
          }}
          onIconSelect={(icon) => {
            onTaskChange(task.id, { icon });
            setShowIconSelector(false);
          }}
          onImageUpload={handleImageClick}
        />
      </button>

      <div className={styles.taskEditorInfo}>
        <input
          type="text"
          className={styles.taskNameInput}
          value={task.name}
          onChange={(e) => {
            onTaskChange(task.id, { name: e.target.value });
          }}
        />
        {task.kind === 'todo' ? (
          <div className={styles.taskTimeInputGroup}>
            <TimeStepper
              value={Math.floor(task.plannedSeconds / 60)}
              onChange={(val) => {
                onTaskChange(task.id, { plannedSeconds: val * 60 });
              }}
              unit="ぷん"
            />
          </div>
        ) : (
          <RewardSettingsEditor
            task={task}
            onTaskChange={onTaskChange}
            onRewardSettingsChange={onRewardSettingsChange}
          />
        )}
      </div>

      {task.kind === 'todo' && (
        <button
          className={styles.deleteTaskBtn}
          onClick={() => {
            onRemoveTask(task.id);
          }}
          title="削除"
        >
          <Trash2 size={20} />
        </button>
      )}
      {task.kind === 'reward' && <div className={styles.rewardBadge}>ごほうび</div>}
    </motion.div>
  );
};
