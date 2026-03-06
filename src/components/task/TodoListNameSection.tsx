import React from 'react';

import { MAX_TITLE_LENGTH, PRESET_TITLES, TITLE_SUFFIX } from './TodoListSettings.constants';
import styles from './TodoListSettings.module.css';

interface TodoListNameSectionProps {
  title: string;
  isTitleManuallyEdited: boolean;
  onTitleManuallyEditedChange: (edited: boolean) => void;
  onTitleChange: (title: string) => void;
  onPresetConfirmRequest: (preset: string) => void;
}

export const TodoListNameSection: React.FC<TodoListNameSectionProps> = ({
  title,
  isTitleManuallyEdited,
  onTitleManuallyEditedChange,
  onTitleChange,
  onPresetConfirmRequest,
}) => {
  const currentPrefix = title.endsWith(TITLE_SUFFIX) ? title.slice(0, -TITLE_SUFFIX.length) : title;

  const applyPreset = (preset: string) => {
    onTitleChange(preset + TITLE_SUFFIX);
    onTitleManuallyEditedChange(false);
  };

  const handlePresetClick = (preset: string) => {
    const nextTitle = preset + TITLE_SUFFIX;
    const shouldConfirmOverwrite = isTitleManuallyEdited && title !== nextTitle;
    if (shouldConfirmOverwrite) {
      onPresetConfirmRequest(preset);
      return;
    }

    applyPreset(preset);
  };

  return (
    <section className={styles.settingsSection}>
      <h2 className={styles.sectionTitle}>リストのなまえ</h2>
      <div className={styles.titleInputContainer}>
        <input
          type="text"
          className={styles.titleInputPrefix}
          value={currentPrefix}
          onChange={(e) => {
            onTitleManuallyEditedChange(true);
            onTitleChange(e.target.value + TITLE_SUFFIX);
          }}
          placeholder="なまえ"
          maxLength={MAX_TITLE_LENGTH}
          onFocus={(e) => {
            e.target.select();
          }}
        />
        <span className={styles.titleSuffix}>{TITLE_SUFFIX}</span>
      </div>
      <div className={styles.presetsContainer}>
        {PRESET_TITLES.map((preset) => (
          <button
            key={preset}
            className={`${styles.presetChip} ${currentPrefix === preset ? styles.active : ''}`}
            onClick={() => {
              handlePresetClick(preset);
            }}
          >
            {preset}
          </button>
        ))}
      </div>
    </section>
  );
};
