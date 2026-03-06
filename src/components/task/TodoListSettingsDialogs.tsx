import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';

import styles from './TodoListSettings.module.css';

interface TodoListSettingsDialogsProps {
  showConfirmDialog: boolean;
  showPresetConfirmDialog: boolean;
  pendingPreset: string | null;
  onCloseBackConfirm: () => void;
  onConfirmBack: () => void;
  onClosePresetConfirm: () => void;
  onConfirmPreset: (preset: string) => void;
}

export const TodoListSettingsDialogs: React.FC<TodoListSettingsDialogsProps> = ({
  showConfirmDialog,
  showPresetConfirmDialog,
  pendingPreset,
  onCloseBackConfirm,
  onConfirmBack,
  onClosePresetConfirm,
  onConfirmPreset,
}) =>
  createPortal(
    <AnimatePresence>
      {(showConfirmDialog || showPresetConfirmDialog) && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalBackdrop}
            onClick={() => {
              if (showPresetConfirmDialog) {
                onClosePresetConfirm();
                return;
              }
              onCloseBackConfirm();
            }}
          />
          <div className={styles.modalContainer}>
            {showConfirmDialog && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={styles.confirmDialog}
              >
                <div className={styles.confirmDialogMessage}>
                  へんこう されています。
                  <br />
                  ほぞんせずに もどりますか？
                </div>
                <div className={styles.confirmDialogActions}>
                  <button
                    className={`${styles.confirmDialogBtn} ${styles.cancelBtn}`}
                    onClick={onCloseBackConfirm}
                  >
                    キャンセル
                  </button>
                  <button
                    className={`${styles.confirmDialogBtn} ${styles.leaveBtn}`}
                    onClick={onConfirmBack}
                  >
                    もどる
                  </button>
                </div>
              </motion.div>
            )}

            {showPresetConfirmDialog && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={styles.confirmDialog}
              >
                <div className={styles.confirmDialogMessage}>
                  いま いれた なまえが きえちゃうよ。
                  <br />
                  この なまえに かえても いい？
                </div>
                <div className={styles.confirmDialogActions}>
                  <button
                    className={`${styles.confirmDialogBtn} ${styles.cancelBtn}`}
                    onClick={onClosePresetConfirm}
                  >
                    そのままに する
                  </button>
                  <button
                    className={`${styles.confirmDialogBtn} ${styles.leaveBtn}`}
                    onClick={() => {
                      if (pendingPreset) {
                        onConfirmPreset(pendingPreset);
                      }
                      onClosePresetConfirm();
                    }}
                  >
                    この なまえに する
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
