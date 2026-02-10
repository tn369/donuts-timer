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
 * @param root0 プロパティオブジェクト
 * @param root0.onClick クリック時のハンドラ
 * @param root0.disabled 無効フラグ
 * @param root0.className クラス名
 * @param root0.animate アニメーション設定
 * @param root0.layout レイアウトアニメーションを有効にするか
 * @param root0.title ツールチップテキスト
 * @param root0.children ボタンの中身
 * @returns レンダリングされるJSX要素
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
