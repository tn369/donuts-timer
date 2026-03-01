import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { TimerColor, TimerShape } from '../../types';
import { ShapeIcon } from '../common/ShapeIcon';
import styles from './TimerAppearancePopup.module.css';

const SHAPES: TimerShape[] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'star',
  'heart',
];

const COLORS: TimerColor[] = [
  'red',
  'blue',
  'yellow',
  'green',
  'pink',
  'purple',
  'orange',
  'indigo',
  'cyan',
  'lime',
];

const COLOR_VALUES: Record<TimerColor, string> = {
  red: '#ff6b6b',
  blue: '#4facfe',
  yellow: '#fabe66',
  green: '#10b981',
  pink: '#ff6a95',
  purple: '#7b61ff',
  orange: '#f97316',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  lime: '#84cc16',
};

const SHAPE_LABELS: Record<TimerShape, string> = {
  circle: 'まる',
  square: 'しかく',
  triangle: 'さんかく',
  diamond: 'ダイヤ',
  pentagon: 'ごかく',
  hexagon: 'ろっかく',
  star: 'ほし',
  heart: 'ハート',
};

const COLOR_LABELS: Record<TimerColor, string> = {
  red: 'あか',
  blue: 'あお',
  yellow: 'きいろ',
  green: 'みどり',
  pink: 'ももいろ',
  purple: 'むらさき',
  orange: 'オレンジ',
  indigo: 'あい',
  cyan: 'シアン',
  lime: 'ライム',
};

interface TimerAppearancePopupProps {
  show: boolean;
  kind: 'shape' | 'color';
  currentShape: TimerShape;
  currentColor: TimerColor;
  isCompact?: boolean;
  onClose: () => void;
  onSelectShape: (shape: TimerShape) => void;
  onSelectColor: (color: TimerColor) => void;
}

export const TimerAppearancePopup: React.FC<TimerAppearancePopupProps> = ({
  show,
  kind,
  currentShape,
  currentColor,
  isCompact = false,
  onClose,
  onSelectShape,
  onSelectColor,
}) => {
  useEffect(() => {
    if (!show) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [show, onClose]);

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
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            className={`${styles.popupPanel} ${isCompact ? styles.compact : ''}`}
            role="dialog"
            aria-label={kind === 'shape' ? 'タイマーのかたちをえらぶ' : 'タイマーのいろをえらぶ'}
          >
            <div className={styles.popupTitle}>
              {kind === 'shape' ? 'かたちをえらぶ' : 'いろをえらぶ'}
            </div>

            {kind === 'shape' ? (
              <div className={styles.optionGrid}>
                {SHAPES.map((shape) => (
                  <button
                    key={shape}
                    className={`${styles.optionButton} ${
                      currentShape === shape ? styles.active : ''
                    }`}
                    onClick={() => {
                      onSelectShape(shape);
                    }}
                    aria-label={`かたち: ${SHAPE_LABELS[shape]}`}
                  >
                    <ShapeIcon shape={shape} size={24} />
                    <span>{SHAPE_LABELS[shape]}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.optionGrid}>
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`${styles.optionButton} ${
                      currentColor === color ? styles.active : ''
                    }`}
                    onClick={() => {
                      onSelectColor(color);
                    }}
                    aria-label={`いろ: ${COLOR_LABELS[color]}`}
                  >
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: COLOR_VALUES[color] }}
                      aria-hidden="true"
                    />
                    <span>{COLOR_LABELS[color]}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
