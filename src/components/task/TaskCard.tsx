/**
 * 個別のタスクを表示するカードコンポーネント。タイマー表示や進捗、完了状態を表示する。
 */
import type { DragControls } from 'framer-motion';
import { motion } from 'framer-motion';
import { Camera, Check, GripVertical } from 'lucide-react';
import React from 'react';

import type { RewardGainNotice, Task, TimerColor, TimerShape } from '../../types';
import { formatTime } from '../../utils/time';
import { DonutTimer } from '../timer/DonutTimer';
import styles from './TaskCard.module.css';

/**
 * TaskCardのプロパティ
 */
interface TaskCardProps {
  task: Task; // 表示対象のタスク
  isSelected: boolean; // 選択中かどうか
  isSelectable: boolean; // 選択可能かどうか
  onSelect: (taskId: string) => void; // 選択された時のコールバック
  shape?: TimerShape; // タイマーの形状
  color?: TimerColor; // タイマーの色
  isCompact?: boolean; // コンパクト表示にするかどうか
  dragControls?: DragControls; // ドラッグ制御用
  isSingleTaskFocus?: boolean; // 実行中フォーカス表示かどうか
  rewardGainNotice?: RewardGainNotice | null; // ごほうび増加通知
}

/**
 * 内部表示用のプロパティ
 */
interface TaskCardViewProps extends TaskCardProps {
  remaining: number; // 残り時間
  isDone: boolean; // 完了しているか
  isOverdue: boolean; // 時間超過しているか
}

/**
 * コンパクト表示用のレイアウト
 * @param root0 プロパティオブジェクト
 * @param root0.task 表示対象のタスク
 * @param root0.shape タイマーの形状
 * @param root0.color タイマーの色
 * @param root0.remaining 残り時間
 * @param root0.isDone 完了しているか
 * @param root0.isOverdue 時間超過しているか
 * @param root0.dragControls ドラッグ制御用
 * @param root0.isSingleTaskFocus 実行中フォーカス表示かどうか
 * @returns レンダリングされるJSX要素
 */
const TaskCardCompact: React.FC<TaskCardViewProps> = ({
  task,
  shape,
  color,
  remaining,
  isDone,
  isOverdue,
  dragControls,
  isSingleTaskFocus = false,
}) => (
  <div className={styles.compactLayout}>
    {dragControls && (
      <div
        className={styles.dragHandle}
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        style={{ cursor: 'grab' }}
      >
        <GripVertical size={16} />
      </div>
    )}
    <div className={styles.compactTop}>
      {task.icon && <img src={task.icon} alt={task.name} className={styles.taskImageCompact} />}
      <div className={styles.compactText}>
        <div className={styles.taskName}>{task.name}</div>
        <div className={styles.taskTime}>
          {isDone ? getStatusText(task) : formatTime(remaining)}
        </div>
      </div>
    </div>
    <div className={styles.compactBottom}>
      {isDone ? (
        <div className={`${styles.taskIcon} ${styles.isCompleted} ${styles.compactDone}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={32} strokeWidth={4} />
          </motion.div>
        </div>
      ) : (
        <DonutTimer
          totalSeconds={task.plannedSeconds}
          elapsedSeconds={task.elapsedSeconds}
          isOverdue={isOverdue}
          size={isSingleTaskFocus ? 120 : 80}
          strokeWidth={isSingleTaskFocus ? 18 : 14}
          shape={shape}
          color={color}
        />
      )}
    </div>
  </div>
);

/**
 * 通常表示用のレイアウト
 * @param root0 プロパティオブジェクト
 * @param root0.task 表示対象のタスク
 * @param root0.isSelected 選択中かどうか
 * @param root0.shape タイマーの形状
 * @param root0.color タイマーの色
 * @param root0.remaining 残り時間
 * @param root0.isDone 完了しているか
 * @param root0.isOverdue 時間超過しているか
 * @param root0.dragControls ドラッグ制御用
 * @param root0.isSingleTaskFocus 実行中フォーカス表示かどうか
 * @returns レンダリングされるJSX要素
 */
// 画像/完了/タイマーのUI分岐をまとめているため、この関数のみ複雑度を緩和する
/* eslint-disable complexity */
const TaskCardNormal: React.FC<TaskCardViewProps> = ({
  task,
  isSelected,
  shape,
  color,
  remaining,
  isDone,
  isOverdue,
  dragControls,
  isSingleTaskFocus = false,
}) => (
  <>
    {dragControls && (
      <div
        className={styles.dragHandle}
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        style={{ cursor: 'grab' }}
      >
        <GripVertical size={20} />
      </div>
    )}
    {!isDone && (
      <div className={styles.taskImageContainer}>
        {task.icon ? (
          <motion.img
            src={task.icon}
            alt={task.name}
            className={styles.taskImage}
            animate={
              isSelected && task.elapsedSeconds < task.plannedSeconds
                ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, -2, 2, 0],
                  }
                : {}
            }
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        ) : (
          <div className={styles.placeholderIcon}>
            <Camera size={48} color="var(--color-primary)" opacity={0.3} />
          </div>
        )}
      </div>
    )}

    {isDone ? (
      <div className={`${styles.taskIcon} ${styles.isCompleted}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <Check size={48} strokeWidth={4} />
        </motion.div>
      </div>
    ) : (
      <DonutTimer
        totalSeconds={task.plannedSeconds}
        elapsedSeconds={task.elapsedSeconds}
        isOverdue={isOverdue}
        size={isSingleTaskFocus ? 170 : 100}
        strokeWidth={isSingleTaskFocus ? 30 : 20}
        shape={shape}
        color={color}
      />
    )}

    <div className={styles.taskName}>{task.name}</div>
    <div className={styles.taskTime}>{isDone ? getStatusText(task) : formatTime(remaining)}</div>
  </>
);
/* eslint-enable complexity */

/**
 * カードのCSSクラス名を生成する
 * @param isSelected 選択中かどうか
 * @param isDone 完了しているか
 * @param isOverdue 時間超過しているか
 * @param isCompact コンパクト表示かどうか
 * @param isReward ご褒美タスクかどうか
 * @param isSingleTaskFocus 実行中フォーカス表示かどうか
 * @returns クラス名文字列
 */
const getCardClassName = (
  isSelected: boolean,
  isDone: boolean,
  isOverdue: boolean,
  isCompact: boolean,
  isReward: boolean,
  isSingleTaskFocus: boolean
) => {
  const classNames = [styles.taskCard];
  if (isSelected) classNames.push(styles.selected);
  if (isDone) classNames.push(styles.done);
  if (isOverdue) classNames.push(styles.overdue);
  if (isCompact) classNames.push(styles.compact);
  if (isReward) classNames.push(styles.reward);
  if (isSingleTaskFocus) classNames.push(styles.singleTaskFocus);
  return classNames.join(' ');
};

/**
 * タスクの重要度（時間）に応じたflex-grow値を計算する
 * @param status タスクの状態
 * @param elapsed 経過時間
 * @param planned 予定時間
 * @param actual 実際の所要時間
 * @returns flex-grow値
 */
const getFlexGrow = (status: string, elapsed: number, planned: number, actual: number) => {
  return Math.min(
    2.5,
    Math.pow((status === 'done' ? actual : Math.max(planned, elapsed)) / 60, 0.3)
  );
};

/**
 * 完了時のステータス文字列を取得する
 * @param task 対象のタスク
 * @returns ステータス文字列
 */
const getStatusText = (task: Task) => {
  return task.kind === 'reward' ? 'おわり' : 'できた！';
};

const formatRewardGainText = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0 && secs > 0) {
    return `${mins}ふん${secs}びょう`;
  }
  if (mins > 0) {
    return `${mins}ふん`;
  }
  return `${secs}びょう`;
};

const getRewardGainMessage = (rewardTaskName: string, deltaSeconds: number): string => {
  return `${rewardTaskName}の じかんが ${formatRewardGainText(deltaSeconds)} ふえたよ！`;
};

/**
 * タスクカードコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.task 表示対象のタスク
 * @param root0.isSelected 選択中かどうか
 * @param root0.isSelectable 選択可能かどうか
 * @param root0.onSelect 選択時のコールバック
 * @param root0.shape タイマーの形状
 * @param root0.color タイマーの色
 * @param root0.isCompact コンパクト表示かどうか
 * @param root0.dragControls ドラッグ制御用
 * @param root0.isSingleTaskFocus 実行中フォーカス表示かどうか
 * @param root0.rewardGainNotice ごほうび時間増加の通知データ
 * @returns レンダリングされるJSX要素
 */
// 複数の表示状態とアニメーション条件をまとめるため、このコンポーネントのみ複雑度を緩和する
/* eslint-disable complexity */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  isSelectable,
  onSelect,
  shape,
  color,
  isCompact = false,
  dragControls,
  isSingleTaskFocus = false,
  rewardGainNotice = null,
}) => {
  const remaining = task.plannedSeconds - task.elapsedSeconds;
  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.elapsedSeconds > task.plannedSeconds;
  const isReward = task.kind === 'reward';
  const shouldShowRewardGainNotice =
    isReward && rewardGainNotice && rewardGainNotice.deltaSeconds > 0;

  const cardClassName = getCardClassName(
    isSelected,
    isDone,
    isOverdue,
    isCompact,
    isReward,
    isSingleTaskFocus
  );
  const flexGrow = getFlexGrow(
    task.status,
    task.elapsedSeconds,
    task.plannedSeconds,
    task.actualSeconds
  );
  const cardFlexGrow = isSingleTaskFocus ? 1 : flexGrow;

  const viewProps: TaskCardViewProps = {
    task,
    isSelected,
    isSelectable,
    onSelect,
    shape,
    color,
    remaining,
    isDone,
    isOverdue,
    dragControls,
    isSingleTaskFocus,
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      }}
      whileHover={isSelectable && !isDone ? { y: -5, transition: { duration: 0.2 } } : {}}
      whileTap={isSelectable && !isDone ? { scale: 0.95 } : {}}
      className={cardClassName}
      style={{ flexGrow: cardFlexGrow }}
      onClick={() => {
        if (isSelectable) onSelect(task.id);
      }}
    >
      {shouldShowRewardGainNotice && (
        <motion.div
          className={styles.rewardGainBubble}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-live="polite"
        >
          {getRewardGainMessage(task.name, rewardGainNotice.deltaSeconds)}
        </motion.div>
      )}
      {isCompact ? <TaskCardCompact {...viewProps} /> : <TaskCardNormal {...viewProps} />}
    </motion.div>
  );
};
/* eslint-enable complexity */
