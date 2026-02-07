import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import React from 'react';

import type { Task } from '../types';
import styles from './IconSelectorPopup.module.css';

interface IconSelectorPopupProps {
  show: boolean;
  direction: 'bottom' | 'top';
  task: Task;
  allExistingIcons: string[];
  onClose: () => void;
  onIconSelect: (icon: string) => void;
  onImageUpload: () => void;
}

/**
 * アイコン選択ポップアップコンポーネント
 */
export const IconSelectorPopup: React.FC<IconSelectorPopupProps> = ({
  show,
  direction,
  task,
  allExistingIcons,
  onClose,
  onIconSelect,
  onImageUpload,
}) => (
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
          initial={{ opacity: 0, scale: 0.9, y: direction === 'bottom' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: direction === 'bottom' ? 10 : -10 }}
          className={`${styles.iconSelectorPopup} ${styles[direction]}`}
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
              <span>新しくアップロード</span>
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
  </AnimatePresence>
);
