/**
 * アニメーション付きのコントロールボタンコンポーネント
 */
import { motion } from 'framer-motion';

/**
 * ControlButtonのプロパティ
 */
interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className: string;
  animate?: React.ComponentPropsWithoutRef<typeof motion.button>['animate'];
  layout?: boolean;
  title?: string;
  children: React.ReactNode;
}

/**
 * カスタムボタンコンポーネント。クリック時のアニメーションなどを共通化する。
 */
export const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  disabled = false,
  className,
  animate,
  layout,
  title,
  children,
}) => {
  return (
    <motion.button
      layout={layout}
      whileTap={{ scale: 0.95 }}
      animate={animate}
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </motion.button>
  );
};
