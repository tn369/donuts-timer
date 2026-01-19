import React from 'react';
import { Plus, Edit2, Trash2, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TodoList } from '../types';

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
    <div className="selection-screen">
      <div className="selection-header">
        <h1 className="selection-title">
          <ListChecks size={32} />
          <span>どれに する？</span>
        </h1>
      </div>

      <div className="list-grid">
        {lists.map((list) => (
          <motion.div
            key={list.id}
            className="list-card"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(list.id)}
          >
            <div className="list-card-content">
              <div className="list-icon-bg">
                <ListChecks size={40} className="list-icon" />
              </div>
              <h3 className="list-name">{list.title}</h3>
              <p className="list-task-count">{list.tasks.filter(t => t.kind === 'todo').length}この やること</p>
            </div>
            
            <div className="list-card-actions">
              <button
                className="action-btn edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(list.id);
                }}
                title="編集"
              >
                <Edit2 size={18} />
              </button>
              <button
                className="action-btn delete"
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
          className="list-card add-new"
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
        >
          <div className="list-card-content">
            <div className="add-icon-container">
              <Plus size={48} />
            </div>
            <h3 className="list-name">新しくつくる</h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
