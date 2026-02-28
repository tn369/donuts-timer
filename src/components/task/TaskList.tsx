/**
 * タスクの一覧を表示するコンポーネント
 */
import { Reorder, useDragControls } from 'framer-motion';
import React from 'react';

import type { RewardGainNotice, Task, TimerColor, TimerShape } from '../../types';
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
  onReorderTasks?: (fromIndex: number, toIndex: number) => void; // タスクを並び替える時のコールバック
  isReorderEnabled?: boolean; // タスクの並び替えが可能かどうか
  isSingleTaskFocus?: boolean; // 実行中フォーカス表示かどうか
  rewardGainNotice?: RewardGainNotice | null;
}

interface ReorderableTaskItemProps {
  task: Task;
  selectedTaskId: string | null;
  isTaskSelectable: (taskId: string) => boolean;
  onSelectTask: (taskId: string) => void;
  shape?: TimerShape;
  color?: TimerColor;
  isCompact: boolean;
  isSingleTaskFocus: boolean;
  rewardGainNotice?: RewardGainNotice | null;
}

const ReorderableTaskItem: React.FC<ReorderableTaskItemProps> = ({
  task,
  selectedTaskId,
  isTaskSelectable,
  onSelectTask,
  shape,
  color,
  isCompact,
  isSingleTaskFocus,
  rewardGainNotice,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={task.id}
      value={task}
      layout="position"
      className={styles.taskWrapper}
      dragListener={false}
      dragControls={dragControls}
    >
      <TaskCard
        task={task}
        isSelected={task.id === selectedTaskId}
        isSelectable={isTaskSelectable(task.id)}
        onSelect={onSelectTask}
        shape={shape}
        color={color}
        isCompact={isCompact}
        isSingleTaskFocus={isSingleTaskFocus}
        dragControls={dragControls}
        rewardGainNotice={rewardGainNotice}
      />
    </Reorder.Item>
  );
};

/**
 * タスクカードを並べて表示するリストコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.tasks タスク一覧
 * @param root0.selectedTaskId 選択中のタスクID
 * @param root0.isTaskSelectable タスクが選択可能かどうかの判定関数
 * @param root0.onSelectTask タスクが選択された時のコールバック
 * @param root0.shape タイマーの形状
 * @param root0.color タイマーの色
 * @param root0.isCompact コンパクト表示にするかどうか
 * @param root0.onReorderTasks タスクを並び替える時のコールバック
 * @param root0.isReorderEnabled タスクの並び替えが可能かどうか
 * @param root0.isSingleTaskFocus 実行中フォーカス表示かどうか
 * @param root0.rewardGainNotice ごほうび時間増加の通知データ
 * @returns レンダリングされるJSX要素
 */
// 通常表示と並び替え表示の分岐を含むため、このコンポーネントのみ複雑度を緩和する
/* eslint-disable complexity */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  isTaskSelectable,
  onSelectTask,
  shape,
  color,
  isCompact = false,
  onReorderTasks,
  isReorderEnabled = true,
  isSingleTaskFocus = false,
  rewardGainNotice = null,
}) => {
  const handleReorder = (newTasks: Task[]) => {
    if (!onReorderTasks) return;

    // 元の配列と新しい配列を比較して、移動元と移動先のインデックスを特定
    const movedTaskId = newTasks.find((task, index) => tasks[index]?.id !== task.id)?.id;
    if (!movedTaskId) return;

    const fromIndex = tasks.findIndex((t) => t.id === movedTaskId);
    const toIndex = newTasks.findIndex((t) => t.id === movedTaskId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      onReorderTasks(fromIndex, toIndex);
    }
  };

  if (!isReorderEnabled || !onReorderTasks) {
    // 並び替えが無効の場合は通常の表示
    return (
      <div
        className={`${styles.taskList} ${isCompact ? styles.compact : ''} ${
          isSingleTaskFocus ? styles.singleTaskFocusMode : ''
        }`}
      >
        {tasks.map((task) => (
          <div key={task.id} className={styles.taskWrapper}>
            <TaskCard
              task={task}
              isSelected={task.id === selectedTaskId}
              isSelectable={isTaskSelectable(task.id)}
              onSelect={onSelectTask}
              shape={shape}
              color={color}
              isCompact={isCompact}
              isSingleTaskFocus={isSingleTaskFocus}
              rewardGainNotice={rewardGainNotice}
            />
          </div>
        ))}
      </div>
    );
  }

  // 並び替えが有効の場合は Reorder コンポーネントを使用
  return (
    <Reorder.Group
      axis="x"
      values={tasks}
      onReorder={handleReorder}
      className={`${styles.taskList} ${isCompact ? styles.compact : ''} ${
        isSingleTaskFocus ? styles.singleTaskFocusMode : ''
      }`}
    >
      {tasks.map((task) => (
        <ReorderableTaskItem
          key={task.id}
          task={task}
          selectedTaskId={selectedTaskId}
          isTaskSelectable={isTaskSelectable}
          onSelectTask={onSelectTask}
          shape={shape}
          color={color}
          isCompact={isCompact}
          isSingleTaskFocus={isSingleTaskFocus}
          rewardGainNotice={rewardGainNotice}
        />
      ))}
    </Reorder.Group>
  );
};
/* eslint-enable complexity */
