import { type DragControls } from 'framer-motion';
import { Copy, Edit2, GripVertical, ListChecks, Trash2 } from 'lucide-react';
import React from 'react';

import type { TodoList } from '../../types';
import styles from './TodoListCard.module.css';

interface TodoListCardProps {
  list: TodoList;
  isSelected: boolean;
  selectionIndex: number;
  isSiblingModeSelect: boolean;
  onClick: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
  isCompact?: boolean;
  dragControls?: DragControls;
}

export const TodoListCard: React.FC<TodoListCardProps> = ({
  list,
  isSelected,
  selectionIndex,
  isSiblingModeSelect,
  onClick,
  onCopy,
  onEdit,
  onDeleteRequest,
  isCompact = false,
  dragControls,
}) => {
  const formatMinutes = (plannedSeconds: number): string => {
    const minutes = Math.max(0, Math.ceil(plannedSeconds / 60));
    return `${minutes}ふん`;
  };

  return (
    <div
      className={`${styles.listCard} ${isSelected ? styles.selected : ''} ${
        isCompact ? styles.compact : ''
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${list.title} リストをえらぶ`}
    >
      {dragControls && (
        <div
          className={styles.dragHandle}
          onPointerDown={(e) => {
            dragControls.start(e);
          }}
        >
          <GripVertical size={24} />
        </div>
      )}
      <div className={styles.listCardContent}>
        <div className={styles.listIconBg}>
          <ListChecks size={56} className={styles.listIcon} />
          {isSelected && (
            <div className={styles.selectionBadge}>{selectionIndex === 0 ? '1' : '2'}</div>
          )}
        </div>
        <div className={styles.listInfo}>
          <div className={styles.titleContainer}>
            <h3 className={styles.listName}>{list.title}</h3>
            <span className={styles.listSubtitle}>のやることリスト</span>
          </div>
          <div className={styles.taskSummaryList}>
            {list.tasks.map((task) => (
              <div key={task.id} className={styles.taskSummaryItem}>
                {task.kind === 'reward' && <span className={styles.rewardBadge}>ごほうび</span>}
                <span className={styles.taskSummaryName}>{task.name}</span>
                <span className={styles.taskSummaryTime}>{formatMinutes(task.plannedSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isSiblingModeSelect && (
        <div className={styles.listCardActions}>
          <button
            className={`${styles.actionBtn} ${styles.copy}`}
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            aria-label="リストを コピーする"
          >
            <Copy size={24} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="リストを なおす"
          >
            <Edit2 size={24} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.delete}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest();
            }}
            aria-label="リストを けす"
          >
            <Trash2 size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
