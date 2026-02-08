/**
 * やることリストを選択、追加、編集、削除するための選択画面コンポーネント。1人モードと2人モードの切り替えが可能。
 */
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Edit2, ListChecks, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { useWindowSize } from '../../hooks/useWindowSize';
import type { TodoList } from '../../types';
import styles from './TodoListSelection.module.css';

/**
 * TodoListSelectionのプロパティ
 */
interface TodoListSelectionProps {
  lists: TodoList[]; // 表示するリスト一覧
  onSelect: (listId: string) => void; // リストが選択された時のコールバック
  onSelectSibling: (id1: string, id2: string) => void; // 2画面モードで2つのリストが選択された時のコールバック
  onEdit: (listId: string) => void; // リスト編集ボタンが押された時のコールバック
  onCopy: (listId: string) => void; // リストコピーボタンが押された時のコールバック
  onAdd: () => void; // 新規作成ボタンが押された時のコールバック
  onDelete: (listId: string) => void; // リスト削除ボタンが押された時のコールバック
}

/**
 * やることリストの選択画面コンポーネント
 */
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
  const { height } = useWindowSize();
  const isCompact = height > 0 && height < 600;

  // コンパクト表示時はふたりモードを解除
  React.useEffect(() => {
    if (isCompact && isSiblingModeSelect) {
      setIsSiblingModeSelect(false);
      setSelectedIds([]);
    }
  }, [isCompact, isSiblingModeSelect]);

  /**
   * カードがクリックされた際のハンドラ
   */
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
    <div className={`${styles.selectionScreen} ${isCompact ? styles.compact : ''}`}>
      <div className={styles.selectionHeader}>
        <h1 className={styles.selectionTitle}>
          <ListChecks size={32} />
          <span>どれに する？</span>
        </h1>

        {!isCompact && (
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
        )}
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
                  <ListChecks size={56} className={styles.listIcon} />
                  {isSelected && (
                    <div className={styles.selectionBadge}>{selectionIndex === 0 ? '1' : '2'}</div>
                  )}
                </div>
                <h3 className={styles.listName}>{list.title}</h3>
                <p className={styles.listTaskCount}>
                  {list.tasks.filter((t: any) => t.kind === 'todo').length}この やること
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
                    aria-label="リストを コピーする"
                  >
                    <Copy size={24} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.edit}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(list.id);
                    }}
                    aria-label="リストを なおす"
                  >
                    <Edit2 size={24} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.delete}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(list.id);
                    }}
                    aria-label="リストを けす"
                  >
                    <Trash2 size={24} />
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
                <Plus size={64} />
              </div>
              <h3 className={styles.listName}>あたらしく つくる</h3>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
