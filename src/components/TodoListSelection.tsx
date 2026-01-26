import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Edit2, ListChecks, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import type { TodoList } from '../types';
import styles from './TodoListSelection.module.css';

interface TodoListSelectionProps {
  lists: TodoList[];
  onSelect: (listId: string) => void;
  onSelectSibling: (id1: string, id2: string) => void;
  onEdit: (listId: string) => void;
  onCopy: (listId: string) => void;
  onAdd: () => void;
  onDelete: (listId: string) => void;
}

export const TodoListSelection: React.FC<TodoListSelectionProps> = ({
  lists,
  onSelect,
  onSelectSibling,
  onEdit,
  onCopy,
  onAdd,
  onDelete,
}) => {
  const [isSiblingModeSelect, setIsSiblingModeSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleCardClick = (listId: string) => {
    if (isSiblingModeSelect) {
      if (selectedIds.length < 2) {
        const newSelected = [...selectedIds, listId];
        setSelectedIds(newSelected);
        if (newSelected.length === 2) {
          onSelectSibling(newSelected[0], newSelected[1]);
        }
      }
    } else {
      onSelect(listId);
    }
  };

  return (
    <div className={styles.selectionScreen}>
      <div className={styles.selectionHeader}>
        <h1 className={styles.selectionTitle}>
          <ListChecks size={32} />
          <span>どれに する？</span>
        </h1>

        <div className={styles.modeToggleContainer}>
          <button
            className={`${styles.modeToggleBtn} ${!isSiblingModeSelect ? styles.active : ''}`}
            onClick={() => {
              setIsSiblingModeSelect(false);
              setSelectedIds([]);
            }}
            aria-label="ひとりで つかう"
          >
            ひとりで
          </button>
          <button
            className={`${styles.modeToggleBtn} ${isSiblingModeSelect ? styles.active : ''}`}
            onClick={() => {
              setIsSiblingModeSelect(true);
            }}
            aria-label="ふたりで つかう"
          >
            <Users size={18} /> ふたりで
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSiblingModeSelect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.selectionInstruction}
          >
            <div>
              {selectedIds.length === 0
                ? 'ひとりめ の リストを えらんでね'
                : 'ふたりめ の リストを えらんでね'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              ※おなじ リストを 2つ えらんでも いいよ
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.listGrid}>
        {lists.map((list) => {
          const isSelected = selectedIds.includes(list.id);
          const selectionIndex = selectedIds.indexOf(list.id);

          return (
            <motion.div
              key={list.id}
              className={`${styles.listCard} ${isSelected ? styles.selected : ''}`}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleCardClick(list.id);
              }}
              aria-label={`${list.title} リストをえらぶ`}
            >
              <div className="list-card-content">
                <div className={styles.listIconBg}>
                  <ListChecks size={40} className={styles.listIcon} />
                  {isSelected && (
                    <div className={styles.selectionBadge}>{selectionIndex === 0 ? '1' : '2'}</div>
                  )}
                </div>
                <h3 className={styles.listName}>{list.title}</h3>
                <p className={styles.listTaskCount}>
                  {list.tasks.filter((t) => t.kind === 'todo').length}この やること
                </p>
              </div>

              {!isSiblingModeSelect && (
                <div className={styles.listCardActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.copy}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(list.id);
                    }}
                    aria-label="リストをコピーする"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.edit}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(list.id);
                    }}
                    aria-label="リストを編集する"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.delete}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(list.id);
                    }}
                    aria-label="リストを削除する"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {!isSiblingModeSelect && (
          <motion.div
            className={`${styles.listCard} ${styles.addNew}`}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
          >
            <div className="list-card-content">
              <div className={styles.addIconContainer}>
                <Plus size={48} />
              </div>
              <h3 className={styles.listName}>新しくつくる</h3>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
