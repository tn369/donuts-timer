import React from 'react';

import type { TimerColor, TimerShape } from '../../types';
import { ShapeIcon } from '../common/ShapeIcon';
import {
  COLOR_NAMES,
  COLOR_VALUES,
  COLORS,
  SHAPE_NAMES,
  SHAPES,
} from './TodoListSettings.constants';
import styles from './TodoListSettings.module.css';

interface TodoListAppearanceSectionProps {
  shape?: TimerShape;
  color?: TimerColor;
  onShapeChange: (shape: TimerShape) => void;
  onColorChange: (color: TimerColor) => void;
}

export const TodoListAppearanceSection: React.FC<TodoListAppearanceSectionProps> = ({
  shape,
  color,
  onShapeChange,
  onColorChange,
}) => (
  <section className={styles.settingsSection}>
    <h2 className={styles.sectionTitle}>どーなつタイマー の かたち</h2>
    <div className={styles.shapeSelection}>
      {SHAPES.map((item) => (
        <button
          key={item}
          className={`${styles.modeButton} ${shape === item || (!shape && item === 'circle') ? styles.active : ''}`}
          onClick={() => {
            onShapeChange(item);
          }}
          aria-label={`${item}のかたち`}
        >
          <div className={styles.modeIcon}>
            <ShapeIcon shape={item} size={32} color="currentColor" />
          </div>
          <div className={styles.modeLabel}>{SHAPE_NAMES[item]}</div>
        </button>
      ))}
    </div>

    <h2 className={styles.sectionTitle}>どーなつタイマー の いろ</h2>
    <div className={styles.colorSelection}>
      {COLORS.map((item) => (
        <button
          key={item}
          className={`${styles.colorButton} ${color === item || (!color && item === 'blue') ? styles.active : ''}`}
          onClick={() => {
            onColorChange(item);
          }}
          style={{ color: COLOR_VALUES[item] }}
        >
          <div className={styles.colorCircle} style={{ background: COLOR_VALUES[item] }} />
          <div className={styles.colorLabel}>{COLOR_NAMES[item]}</div>
        </button>
      ))}
    </div>
  </section>
);
