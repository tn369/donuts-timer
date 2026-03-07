import type { DragControls } from 'framer-motion';
import { motion } from 'framer-motion';
import { Camera, GripVertical, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';

import type { RewardTaskSettings, Task } from '../../types';
import { resizeImage } from '../../utils/image';
import { IconSelectorPopup } from '../common/IconSelectorPopup';
import { TimeStepper } from '../common/TimeStepper';
import styles from './TaskEditorItem.module.css';

const MAX_TASK_NAME_LENGTH = 12;

interface TaskEditorItemProps {
  task: Task;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask: (taskId: string) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
  allExistingIcons: string[];
  dragControls?: DragControls;
}

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
      <span className={styles.rewardModeLabel}>きまった じかん</span>
      <div className={styles.rewardModeInput}>
        <TimeStepper
          className={styles.rewardTimeStepper}
          value={Math.floor(task.plannedSeconds / 60)}
          onChange={(val) => {
            onTaskChange(task.id, { plannedSeconds: val * 60 });
          }}
          unit="ふん"
          disabled={task.rewardSettings?.mode === 'target-time'}
          min={1}
          step={5}
        />
      </div>
    </label>
  );
};

const TargetTimeModeEditor: React.FC<{
  task: Task;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
}> = ({ task, onRewardSettingsChange }) => {
  const isTargetTimeMode = task.rewardSettings?.mode === 'target-time';
  const targetHour = task.rewardSettings?.targetHour ?? 9;
  const targetMinute = task.rewardSettings?.targetMinute ?? 0;

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
      <span className={styles.rewardModeLabel}>おわる じかん</span>
      <div className={`${styles.rewardModeInput} ${styles.targetTimeInputs}`}>
        <TimeStepper
          className={styles.targetTimeStepper}
          value={targetHour}
          onChange={(val) => {
            onRewardSettingsChange(task.id, { targetHour: val % 24 });
          }}
          unit="じ"
          disabled={!isTargetTimeMode}
          step={1}
          max={23}
          options={Array.from({ length: 24 }, (_, i) => i)}
          loopOptions
        />
        <TimeStepper
          className={styles.targetTimeStepper}
          value={targetMinute}
          onChange={(val, context) => {
            const nextSettings: Partial<RewardTaskSettings> = { targetMinute: val % 60 };

            if (context?.wrapped && context.source === 'increment') {
              nextSettings.targetHour = (targetHour + 1) % 24;
            }

            if (context?.wrapped && context.source === 'decrement') {
              nextSettings.targetHour = (targetHour + 23) % 24;
            }

            onRewardSettingsChange(task.id, nextSettings);
          }}
          unit="ふん"
          disabled={!isTargetTimeMode}
          step={5}
          max={55}
          options={Array.from({ length: 12 }, (_, i) => i * 5)}
          loopOptions
        />
      </div>
    </label>
  );
};

const RewardSettingsEditor: React.FC<{
  task: Task;
  onTaskChange: (taskId: string, updates: Partial<Task>) => void;
  onRewardSettingsChange: (taskId: string, settings: Partial<RewardTaskSettings>) => void;
}> = ({ task, onTaskChange, onRewardSettingsChange }) => (
  <div className={styles.rewardTimeSettings}>
    <DurationModeEditor
      task={task}
      onTaskChange={onTaskChange}
      onRewardSettingsChange={onRewardSettingsChange}
    />
    <TargetTimeModeEditor task={task} onRewardSettingsChange={onRewardSettingsChange} />
  </div>
);

export const TaskEditorItem: React.FC<TaskEditorItemProps> = ({
  task,
  onTaskChange,
  onRemoveTask,
  onRewardSettingsChange,
  allExistingIcons,
  dragControls,
}) => {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const resizedImage = await resizeImage(base64String, 200, 200);
          onTaskChange(task.id, { icon: resizedImage });
        } catch (error) {
          console.error('Failed to resize image:', error);
          alert('画像の処理に失敗しました。');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const taskNameInput = (
    <input
      type="text"
      className={styles.taskNameInput}
      value={task.name}
      onChange={(e) => {
        onTaskChange(task.id, { name: e.target.value });
      }}
      maxLength={MAX_TASK_NAME_LENGTH}
    />
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`${styles.taskEditorItem} ${task.kind === 'reward' ? styles.reward : ''}`}
    >
      {task.kind !== 'reward' && dragControls && (
        <div
          className={styles.dragHandle}
          onPointerDown={(e) => {
            dragControls.start(e);
          }}
          style={{ cursor: 'grab', pointerEvents: 'auto' }}
        >
          <GripVertical size={20} />
        </div>
      )}

      <button
        type="button"
        className={styles.taskEditorImage}
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

      <div
        className={`${styles.taskEditorInfo} ${task.kind === 'reward' ? styles.rewardTaskEditorInfo : ''}`}
      >
        {task.kind === 'todo' ? (
          <div className={styles.taskPrimaryRow}>
            <div className={styles.taskNameField}>{taskNameInput}</div>
            <div className={styles.taskTimeInputGroup}>
              <TimeStepper
                className={styles.todoTimeStepper}
                value={Math.floor(task.plannedSeconds / 60)}
                onChange={(val) => {
                  onTaskChange(task.id, { plannedSeconds: val * 60 });
                }}
                unit="ふん"
                min={1}
                max={60}
              />
            </div>
          </div>
        ) : (
          <div className={styles.rewardInlineFields}>
            <div className={styles.taskPrimaryRow}>
              <div className={styles.rewardNameInputGroup}>{taskNameInput}</div>
              <div className={styles.rewardBadge}>ごほうび</div>
            </div>
            <RewardSettingsEditor
              task={task}
              onTaskChange={onTaskChange}
              onRewardSettingsChange={onRewardSettingsChange}
            />
          </div>
        )}
      </div>

      {task.kind === 'todo' && (
        <button
          className={styles.deleteTaskBtn}
          onClick={() => {
            onRemoveTask(task.id);
          }}
          title="けす"
          aria-label="けす"
        >
          <Trash2 size={20} />
        </button>
      )}
    </motion.div>
  );
};
