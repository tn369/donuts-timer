import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="modal-content"
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-warning)' }}>
          <AlertTriangle size={48} />
        </div>
        <div className="modal-title">最初からやり直しますか？</div>
        <div className="modal-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="btn-modal btn-cancel"
            onClick={onCancel}
          >
            やめる
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="btn-modal btn-confirm-reset"
            onClick={onConfirm}
          >
            リセット
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
