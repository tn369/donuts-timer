/**
 * 汎用的な確認ダイアログコンポーネント
 */
import { motion } from 'framer-motion';
import React from 'react';

import styles from './ConfirmModal.module.css';

/**
 * ConfirmModalのプロパティ
 */
interface ConfirmModalProps {
  title: string; // ダイアログのタイトル
  cancelText: string; // キャンセルボタンのテキスト
  confirmText: string; // 確認ボタンのテキスト
  confirmStyle?: 'danger' | 'primary'; // 確認ボタンのスタイル
  icon?: React.ReactNode; // オプションのアイコン
  onCancel: () => void; // キャンセル時のコールバック
  onConfirm: () => void; // 確定時のコールバック
}

/**
 * 汎用確認モーダルコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.title ダイアログのタイトル
 * @param root0.cancelText キャンセルボタンのテキスト
 * @param root0.confirmText 確認ボタンのテキスト
 * @param root0.confirmStyle 確認ボタンのスタイル
 * @param root0.icon オプションのアイコン
 * @param root0.onCancel キャンセル時のコールバック
 * @param root0.onConfirm 確定時のコールバック
 * @returns レンダリングされるJSX要素
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  cancelText,
  confirmText,
  confirmStyle = 'danger',
  icon,
  onCancel,
  onConfirm,
}) => {
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
        {icon && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--color-warning)',
            }}
          >
            {icon}
          </div>
        )}
        <div className={styles.modalTitle}>{title}</div>
        <div className={styles.modalActions}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${styles.btnModal} ${styles.btnCancel}`}
            onClick={onCancel}
          >
            {cancelText}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${styles.btnModal} ${
              confirmStyle === 'danger' ? styles.btnConfirmDanger : styles.btnConfirmPrimary
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
