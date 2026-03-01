/**
 * やることリストを選択、追加、編集、削除するための選択画面コンポーネント。1人モードと2人モードの切り替えが可能。
 */
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { AlertTriangle, ListChecks, Plus, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { useWindowSize } from '../../hooks/useWindowSize';
import type { TodoList } from '../../types';
import { ConfirmModal } from '../modals/ConfirmModal';
import { TodoListCard } from './TodoListCard';
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
  onReorder: (newLists: TodoList[]) => void; // リストの順番が変更された時のコールバック
}

/**
 * TodoListSelectionItemのプロパティ
 */
interface TodoListSelectionItemProps {
  list: TodoList;
  selectedIds: string[];
  isSiblingModeSelect: boolean;
  onCopy: (id: string) => void;
  onEdit: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  handleCardClick: (id: string) => void;
  isCompact: boolean;
}

/**
 * リスト選択画面の個別アイテムコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.list 表示するリスト
 * @param root0.selectedIds 選択中のリストIDリスト
 * @param root0.isSiblingModeSelect 2人モード選択中かどうか
 * @param root0.onCopy コピー時のコールバック
 * @param root0.onEdit 編集時のコールバック
 * @param root0.onDeleteRequest 削除リクエスト時のコールバック
 * @param root0.handleCardClick カードクリック時のハンドラ
 * @param root0.isCompact コンパクト表示かどうか
 * @returns レンダリングされるJSX要素
 */
const TodoListSelectionItem: React.FC<TodoListSelectionItemProps> = ({
  list,
  selectedIds,
  isSiblingModeSelect,
  onCopy,
  onEdit,
  onDeleteRequest,
  handleCardClick,
  isCompact,
}) => {
  const dragControls = useDragControls();
  const isSelected = selectedIds.includes(list.id);
  const selectionIndex = selectedIds.indexOf(list.id);

  return (
    <Reorder.Item key={list.id} value={list} dragListener={false} dragControls={dragControls}>
      <TodoListCard
        list={list}
        isSelected={isSelected}
        selectionIndex={selectionIndex}
        isSiblingModeSelect={isSiblingModeSelect}
        onClick={() => {
          handleCardClick(list.id);
        }}
        onCopy={() => {
          onCopy(list.id);
        }}
        onEdit={() => {
          onEdit(list.id);
        }}
        onDeleteRequest={() => {
          onDeleteRequest(list.id);
        }}
        isCompact={isCompact}
        dragControls={!isSiblingModeSelect ? dragControls : undefined}
      />
    </Reorder.Item>
  );
};

/**
 * やることリストの選択画面コンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.lists 表示するリスト一覧
 * @param root0.onSelect リストが選択された時のコールバック
 * @param root0.onSelectSibling 2画面モードで2つのリストが選択された時のコールバック
 * @param root0.onEdit リスト編集ボタンが押された時のコールバック
 * @param root0.onCopy リストコピーボタンが押された時のコールバック
 * @param root0.onAdd 新規作成ボタンが押された時のコールバック
 * @param root0.onDelete リスト削除ボタンが押された時のコールバック
 * @param root0.onReorder リストの順番が変更された時のコールバック
 * @returns レンダリングされるJSX要素
 */
export const TodoListSelection: React.FC<TodoListSelectionProps> = ({
  lists,
  onSelect,
  onSelectSibling,
  onEdit,
  onCopy,
  onAdd,
  onDelete,
  onReorder,
}) => {
  const [isSiblingModeSelect, setIsSiblingModeSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmListId, setDeleteConfirmListId] = useState<string | null>(null);
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
   * @param listId クリックされたリストのID
   */
  const handleCardClick = (listId: string) => {
    if (!isSiblingModeSelect) {
      onSelect(listId);
      return;
    }

    if (selectedIds.length >= 2) {
      return;
    }

    const newSelected = [...selectedIds, listId];
    setSelectedIds(newSelected);
    if (newSelected.length === 2) {
      onSelectSibling(newSelected[0], newSelected[1]);
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
          <div className={styles.headerControls}>
            <div className={styles.modeToggleContainer}>
              <button
                className={`${styles.modeToggleBtn} ${!isSiblingModeSelect ? styles.active : ''}`}
                onClick={() => {
                  setIsSiblingModeSelect(false);
                  setSelectedIds([]);
                }}
                aria-label="ひとりで つかう"
              >
                <User size={18} /> ひとりで
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

      <Reorder.Group axis="y" values={lists} onReorder={onReorder} className={styles.listGrid}>
        {lists.map((list) => (
          <TodoListSelectionItem
            key={list.id}
            list={list}
            selectedIds={selectedIds}
            isSiblingModeSelect={isSiblingModeSelect}
            onCopy={onCopy}
            onEdit={onEdit}
            onDeleteRequest={setDeleteConfirmListId}
            handleCardClick={handleCardClick}
            isCompact={isCompact}
          />
        ))}

        {!isSiblingModeSelect && (
          <motion.div
            layout
            className={`${styles.listCard} ${styles.addNew}`}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
          >
            <div className={styles.listCardContent}>
              <div className={styles.addIconContainer}>
                <Plus size={32} />
              </div>
              <h3 className={styles.listName}>あたらしく つくる</h3>
            </div>
          </motion.div>
        )}
      </Reorder.Group>

      {createPortal(
        <AnimatePresence>
          {deleteConfirmListId && (
            <ConfirmModal
              title="このリストを けしても いいですか？"
              cancelText="キャンセル"
              confirmText="けす"
              confirmStyle="danger"
              icon={<AlertTriangle size={48} />}
              onCancel={() => {
                setDeleteConfirmListId(null);
              }}
              onConfirm={() => {
                onDelete(deleteConfirmListId);
                setDeleteConfirmListId(null);
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
