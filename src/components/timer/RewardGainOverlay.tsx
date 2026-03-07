import { motion } from 'framer-motion';
import React from 'react';

import type { TimerColor, TimerShape } from '../../types';
import { DonutTimer } from './DonutTimer';
import styles from './RewardGainOverlay.module.css';

export interface RewardGainAnimationSnapshot {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  size: number;
  deltaSeconds: number;
}

interface RewardGainOverlayProps {
  animation: RewardGainAnimationSnapshot;
  shape: TimerShape;
  color: TimerColor;
}

export const RewardGainOverlay: React.FC<RewardGainOverlayProps> = ({
  animation,
  shape,
  color,
}) => {
  const travelX = animation.toX - animation.fromX;
  const travelY = animation.toY - animation.fromY;
  const arcHeight = Math.min(88, Math.max(36, Math.abs(travelX) * 0.18 + 28));

  return (
    <div className={styles.overlay} aria-hidden="true" data-testid="reward-gain-overlay">
      <motion.div
        className={styles.launchRing}
        style={{
          left: animation.fromX - animation.size / 2,
          top: animation.fromY - animation.size / 2,
          width: animation.size,
          height: animation.size,
        }}
        initial={{ opacity: 0, scale: 0.65 }}
        animate={{ opacity: [0, 0.85, 0], scale: [0.65, 1.18, 1.45] }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      />

      <motion.div
        className={styles.traveler}
        style={{
          left: animation.fromX - animation.size / 2,
          top: animation.fromY - animation.size / 2,
          width: animation.size,
          height: animation.size,
        }}
        initial={{ x: 0, y: 0, scale: 0.82, opacity: 0 }}
        animate={{
          x: [0, travelX * 0.38, travelX],
          y: [0, -arcHeight, travelY],
          scale: [0.82, 1.06, 0.7],
          opacity: [0, 1, 1, 0],
          rotate: [0, -8, 10],
        }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.donutWrap}>
          <DonutTimer
            totalSeconds={animation.deltaSeconds}
            elapsedSeconds={0}
            size={animation.size}
            strokeWidth={Math.max(10, animation.size * 0.18)}
            shape={shape}
            color={color}
          />
        </div>
      </motion.div>

      <motion.div
        className={styles.impactBurst}
        style={{
          left: animation.toX - animation.size * 0.42,
          top: animation.toY - animation.size * 0.42,
          width: animation.size * 0.84,
          height: animation.size * 0.84,
        }}
        initial={{ opacity: 0, scale: 0.45 }}
        animate={{ opacity: [0, 0, 0.95, 0], scale: [0.45, 0.45, 1.18, 1.5] }}
        transition={{ duration: 1.05, times: [0, 0.56, 0.72, 1], ease: 'easeOut' }}
      />
    </div>
  );
};
