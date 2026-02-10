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

/**
 * 時間指定モードのエディタ
 * @param root0 プロパティオブジェクト
 * @param root0.task 対象のタスク
 * @param root0.onTaskChange タスク変更時のイベントハンドラ
 * @param root0.onRewardSettingsChange 報酬設定変更時のイベントハンドラ
 * @returns レンダリングされるJSX要素
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
      <span className={styles.rewardModeLabel}>きまった じかん</span>
      <div className={styles.rewardModeInput}>
        <TimeStepper
          value={Math.floor(task.plannedSeconds / 60)}
          onChange={(val) => {
            onTaskChange(task.id, { plannedSeconds: val * 60 });
          }}
          unit="ふん"
          disabled={task.rewardSettings?.mode === 'target-time'}
          step={5}
        />
      </div>
    </label>
  );
};

/**
 * 目標時刻モードのエディタ
 * @param root0 プロパティオブジェクト
 * @param root0.task 対象のタスク
 * @param root0.onRewardSettingsChange 報酬設定変更時のイベントハンドラ
 * @returns レンダリングされるJSX要素
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
      <span className={styles.rewardModeLabel}>おわる じかん</span>
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
 * @param root0 プロパティオブジェクト
 * @param root0.task 対象のタスク
 * @param root0.onTaskChange タスク変更時のイベントハンドラ
 * @param root0.onRewardSettingsChange 報酬設定変更時のイベントハンドラ
 * @returns レンダリングされるJSX要素
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
 * @param root0 プロパティオブジェクト
 * @param root0.task 対象のタスク
 * @param root0.onTaskChange タスク変更時のイベントハンドラ
 * @param root0.onRemoveTask タスク削除時のイベントハンドラ
 * @param root0.onRewardSettingsChange 報酬設定変更時のイベントハンドラ
 * @param root0.allExistingIcons 既存の全アイコンURLリスト
 * @param root0.dragControls ドラッグ制御用
 * @returns レンダリングされるJSX要素
 */
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
          // どんなサイズでも 200x200 程度に圧縮して保存する
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

      <div className={styles.taskEditorInfo}>
        <input
          type="text"
          className={styles.taskNameInput}
          value={task.name}
          onChange={(e) => {
            onTaskChange(task.id, { name: e.target.value });
          }}
          maxLength={MAX_TASK_NAME_LENGTH}
        />
        {task.kind === 'todo' ? (
          <div className={styles.taskTimeInputGroup}>
            <TimeStepper
              value={Math.floor(task.plannedSeconds / 60)}
              onChange={(val) => {
                onTaskChange(task.id, { plannedSeconds: val * 60 });
              }}
              unit="ふん"
              min={1}
              max={60}
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
          title="けす"
        >
          <Trash2 size={20} />
        </button>
      )}
      {task.kind === 'reward' && <div className={styles.rewardBadge}>ごほうび</div>}
    </motion.div>
  );
};
