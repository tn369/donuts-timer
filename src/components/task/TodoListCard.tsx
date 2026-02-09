import { motion } from 'framer-motion';
import { Copy, Edit2, ListChecks, Trash2 } from 'lucide-react';
import React from 'react';

import type { Task, TodoList } from '../../types';
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
}) => {
  return (
    <motion.div
      className={`${styles.listCard} ${isSelected ? styles.selected : ''} ${
        isCompact ? styles.compact : ''
      }`}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={`${list.title} リストをえらぶ`}
    >
      <div className={styles.listCardContent}>
        <div className={styles.listIconBg}>
          <ListChecks size={56} className={styles.listIcon} />
          {isSelected && (
            <div className={styles.selectionBadge}>{selectionIndex === 0 ? '1' : '2'}</div>
          )}
        </div>
        <div className={styles.titleContainer}>
          <h3 className={styles.listName}>{list.title}</h3>
          <span className={styles.listSubtitle}>の</span>
        </div>
        <p className={styles.listSubtitle}>やることリスト</p>
        <p className={styles.listTaskCount}>
          {list.tasks.filter((t: Task) => t.kind === 'todo').length}この やること
        </p>
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
    </motion.div>
  );
};
