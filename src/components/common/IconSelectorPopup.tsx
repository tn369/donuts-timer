import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import type { Task } from '../../types';
import styles from './IconSelectorPopup.module.css';

interface IconSelectorPopupProps {
  show: boolean;
  task: Task;
  allExistingIcons: string[];
  onClose: () => void;
  onIconSelect: (icon: string) => void;
  onImageUpload: () => void;
}

/**
 * アイコン選択ポップアップコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.show 表示フラグ
 * @param root0.task 対象のタスク
 * @param root0.allExistingIcons 既存の全アイコンURLリスト
 * @param root0.onClose 閉じるイベントハンドラ
 * @param root0.onIconSelect アイコン選択イベントハンドラ
 * @param root0.onImageUpload 画像アップロードイベントハンドラ
 * @returns レンダリングされるJSX要素
 */
export const IconSelectorPopup: React.FC<IconSelectorPopupProps> = ({
  show,
  task,
  allExistingIcons,
  onClose,
  onIconSelect,
  onImageUpload,
}) => {
  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.popupBackdrop}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
            className={styles.iconSelectorPopup}
          >
            <div className={styles.iconSelectorHeader}>
              <span>がぞうをえらぶ</span>
              <button className={styles.closeSelectorBtn} onClick={onClose}>
                ×
              </button>
            </div>
            <div className={styles.iconSelectorContent}>
              <button className={styles.uploadNewBtn} onClick={onImageUpload}>
                <Plus size={20} />
                <span>あたらしく アップロード</span>
              </button>
              <div className={styles.existingIconsGrid}>
                {allExistingIcons.map((icon, index) => (
                  <button
                    key={index}
                    className={`${styles.iconOption} ${task.icon === icon ? styles.active : ''}`}
                    onClick={() => {
                      onIconSelect(icon);
                    }}
                  >
                    <img src={icon} alt={`Icon ${index}`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
