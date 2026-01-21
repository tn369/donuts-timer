import React from 'react';
import { Plus, Edit2, Trash2, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TodoList } from '../types';
import styles from './TodoListSelection.module.css';

interface TodoListSelectionProps {
  lists: TodoList[];
  onSelect: (listId: string) => void;
  onEdit: (listId: string) => void;
  onAdd: () => void;
  onDelete: (listId: string) => void;
}

export const TodoListSelection: React.FC<TodoListSelectionProps> = ({
  lists,
  onSelect,
  onEdit,
  onAdd,
  onDelete,
}) => {
  return (
    <div className={styles.selectionScreen}>
      <div className={styles.selectionHeader}>
        <h1 className={styles.selectionTitle}>
          <ListChecks size={32} />
          <span>どれに する？</span>
        </h1>
      </div>

      <div className={styles.listGrid}>
        {lists.map((list) => (
          <motion.div
            key={list.id}
            className={styles.listCard}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(list.id)}
          >
            <div className="list-card-content">
              <div className={styles.listIconBg}>
                <ListChecks size={40} className={styles.listIcon} />
              </div>
              <h3 className={styles.listName}>{list.title}</h3>
              <p className={styles.listTaskCount}>{list.tasks.filter(t => t.kind === 'todo').length}この やること</p>
            </div>
            
            <div className={styles.listCardActions}>
              <button
                className={`${styles.actionBtn} ${styles.edit}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(list.id);
                }}
                title="編集"
              >
                <Edit2 size={18} />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.delete}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(list.id);
                }}
                title="削除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}

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
      </div>
    </div>
  );
};
