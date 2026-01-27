/**
 * タイマーリセット確認モーダル。
 */

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

import styles from './ResetModal.module.css';

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
      className={styles.modalOverlay}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={styles.modalContent}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--color-warning)',
          }}
        >
          <AlertTriangle size={48} />
        </div>
        <div className={styles.modalTitle}>さいしょから やりなおしますか？</div>
        <div className={styles.modalActions}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${styles.btnModal} ${styles.btnCancel}`}
            onClick={onCancel}
          >
            やらない
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${styles.btnModal} ${styles.btnConfirmReset}`}
            onClick={onConfirm}
          >
            やりなおす
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
