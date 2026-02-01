/**
 * 前回の状態を引き継ぐか確認するためのモーダルダイアログ
 */
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import React from 'react';

import styles from './ResumeModal.module.css';

/**
 * ResumeModalのプロパティ
 */
interface ResumeModalProps {
  onCancel: () => void; // 「あたらしく」選択時のコールバック
  onConfirm: () => void; // 「つづきから」選択時のコールバック
}

/**
 * 復元確認モーダルコンポーネント
 */
export const ResumeModal: React.FC<ResumeModalProps> = ({ onCancel, onConfirm }) => {
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
            color: 'var(--color-primary)',
          }}
        >
          <PlayCircle size={48} />
        </div>
        <div className={styles.modalTitle}>まえのつづきからはじめる？</div>
        <div className={styles.modalActions}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${styles.btnModal} ${styles.btnCancel}`}
            onClick={onCancel}
          >
            あたらしく
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${styles.btnModal} ${styles.btnConfirmResume}`}
            onClick={onConfirm}
          >
            つづきから
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
