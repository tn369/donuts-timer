/**
 * タイマー画面の上部に表示される、設定や操作のためのコントロールバーコンポーネント
 */
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Menu, Palette, RotateCcw, Settings, User, Users, X, Zap } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import type { TimerColor, TimerShape, TodoList } from '../../types';
import { ShapeIcon } from '../common/ShapeIcon';
import { Controls } from './Controls';
import styles from './MainTimerView.module.css';
import { TimerAppearancePopup } from './TimerAppearancePopup';

/**
 * タイマーのカラーコード定義
 */
const TIMER_COLORS: Record<string, string> = {
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

/**
 * MainTimerHeaderControlsのプロパティ
 */
interface HeaderControlsProps {
  showSelectionButton: boolean; // リスト選択に戻るボタンを表示するか
  onBackToSelection: () => void; // リスト選択に戻る際のコールバック
  isSiblingMode: boolean; // 2画面モードかどうか
  isRunning: boolean; // タイマーが動作中かどうか
  startTimer: () => void; // スタートボタンのコールバック
  stopTimer: () => void; // ストップボタンのコールバック
  setShowResetConfirm: (show: boolean) => void; // リセット確認ダイアログの表示制御
  canStartOrStop: boolean; // スタート/ストップが可能か
  fastForward: () => void; // 早送り（デバッグ用）のコールバック
  timerSettings: { shape: TimerShape; color: TimerColor }; // タイマーの見た目設定
  setTimerSettings: (s: { shape: TimerShape; color: TimerColor }) => void; // 設定変更用の関数
  activeList: TodoList | null; // 現在アクティブなリスト
  onEditSettings: (id: string) => void; // 設定画面を開くコールバック
  onEnterSiblingMode?: () => void; // ふたりモードへ切り替えるコールバック
  onExitSiblingMode?: () => void; // ひとりモードへ切り替えるコールバック
  isCompact?: boolean; // コンパクト表示かどうか
}

/**
 * タイマー画面上部のヘッダーコントロールコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.showSelectionButton リスト選択に戻るボタンを表示するか
 * @param root0.onBackToSelection リスト選択に戻る際のコールバック
 * @param root0.isSiblingMode 2画面モードかどうか
 * @param root0.isRunning タイマーが動作中かどうか
 * @param root0.startTimer スタートボタンのコールバック
 * @param root0.stopTimer ストップボタンのコールバック
 * @param root0.setShowResetConfirm リセット確認ダイアログの表示制御
 * @param root0.canStartOrStop スタート/ストップが可能か
 * @param root0.fastForward 早送り（デバッグ用）のコールバック
 * @param root0.timerSettings タイマーの見た目設定
 * @param root0.setTimerSettings 設定変更用の関数
 * @param root0.activeList 現在アクティブなリスト
 * @param root0.onEditSettings 設定画面を開くコールバック
 * @param root0.onEnterSiblingMode ふたりモードへ切り替えるコールバック
 * @param root0.onExitSiblingMode ひとりモードへ切り替えるコールバック
 * @param root0.isCompact コンパクト表示かどうか
 * @returns レンダリングされるJSX要素
 */
// ヘッダー操作の分岐が集中するため、このコンポーネントのみ複雑度を緩和する
/* eslint-disable complexity */
export const MainTimerHeaderControls: React.FC<HeaderControlsProps> = ({
  showSelectionButton,
  onBackToSelection,
  isSiblingMode,
  isRunning,
  startTimer,
  stopTimer,
  setShowResetConfirm,
  canStartOrStop,
  fastForward,
  timerSettings,
  setTimerSettings,
  activeList,
  onEditSettings,
  onEnterSiblingMode,
  onExitSiblingMode,
  isCompact = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAppearancePopup, setOpenAppearancePopup] = useState<'shape' | 'color' | null>(null);

  const handleEditSettings = useCallback(() => {
    if (activeList) {
      onEditSettings(activeList.id);
    }
  }, [activeList, onEditSettings]);

  const toggleShapePopup = useCallback(() => {
    setIsMenuOpen(false);
    setOpenAppearancePopup((prev) => (prev === 'shape' ? null : 'shape'));
  }, []);

  const toggleColorPopup = useCallback(() => {
    setIsMenuOpen(false);
    setOpenAppearancePopup((prev) => (prev === 'color' ? null : 'color'));
  }, []);

  const toggleMenu = useCallback(() => {
    setOpenAppearancePopup(null);
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleSelectShape = useCallback(
    (shape: TimerShape) => {
      setTimerSettings({ ...timerSettings, shape });
      setOpenAppearancePopup(null);
    },
    [setTimerSettings, timerSettings]
  );

  const handleSelectColor = useCallback(
    (color: TimerColor) => {
      setTimerSettings({ ...timerSettings, color });
      setOpenAppearancePopup(null);
    },
    [setTimerSettings, timerSettings]
  );

  const renderDebugButton = () => {
    if (!import.meta.env.DEV) return null;

    return (
      <motion.button
        whileHover={{ scale: 1.05, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={fastForward}
        className={styles.settingsButton}
        style={{ color: '#fbbf24' }}
        aria-label="デバッグ：すすめる"
      >
        <Zap size={isSiblingMode || isCompact ? 20 : 24} fill="currentColor" />
      </motion.button>
    );
  };

  return (
    <div className={styles.topControls}>
      {showSelectionButton && (
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToSelection}
          className={`${styles.settingsButton} ${styles.secondary}`}
          aria-label="リストをえらびなおす"
        >
          <ChevronLeft size={isSiblingMode || isCompact ? 20 : 24} /> もどる
        </motion.button>
      )}

      <div className={styles.topMainControls}>
        <Controls
          isRunning={isRunning}
          onStart={startTimer}
          onStop={stopTimer}
          onReset={() => {
            setShowResetConfirm(true);
          }}
          canStartOrStop={canStartOrStop}
          isCompact={true}
          isSmall={isSiblingMode || isCompact}
          hideReset={true}
        />
      </div>

      <div className={styles.topControlsGroup}>
        {renderDebugButton()}
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleShapePopup}
          className={`${styles.settingsButton} ${
            openAppearancePopup === 'shape' ? styles.active : ''
          }`}
          aria-label="タイマーのかたちをかえる"
        >
          <ShapeIcon shape={timerSettings.shape} size={isSiblingMode || isCompact ? 20 : 28} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleColorPopup}
          className={`${styles.settingsButton} ${
            openAppearancePopup === 'color' ? styles.active : ''
          }`}
          aria-label="タイマーのいろをかえる"
        >
          <Palette
            size={isSiblingMode || isCompact ? 20 : 24}
            color={TIMER_COLORS[timerSettings.color]}
          />
        </motion.button>

        <HeaderMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          toggleMenu={toggleMenu}
          isSiblingMode={isSiblingMode}
          onEnterSiblingMode={onEnterSiblingMode}
          onExitSiblingMode={onExitSiblingMode}
          setShowResetConfirm={setShowResetConfirm}
          handleEditSettings={handleEditSettings}
          isCompact={isCompact}
        />
      </div>
      <TimerAppearancePopup
        show={openAppearancePopup !== null}
        kind={openAppearancePopup ?? 'shape'}
        currentShape={timerSettings.shape}
        currentColor={timerSettings.color}
        isCompact={isSiblingMode || isCompact}
        onClose={() => {
          setOpenAppearancePopup(null);
        }}
        onSelectShape={handleSelectShape}
        onSelectColor={handleSelectColor}
      />
    </div>
  );
};
/* eslint-enable complexity */

/**
 * ひとり/ふたりモード切り替えボタンのラッパーコンポーネント
 */
interface ModeToggleButtonProps {
  isSiblingMode: boolean;
  onEnterSiblingMode?: () => void;
  onExitSiblingMode?: () => void;
  setIsMenuOpen: (open: boolean) => void;
  isMenu?: boolean;
  isCompact?: boolean;
}

/**
 * ひとりモードに戻すボタン
 * @param root0 プロパティオブジェクト
 * @param root0.onExitSiblingMode ひとりモードへ切り替えるコールバック
 * @param root0.setIsMenuOpen メニューの開閉制御
 * @param root0.isMenu メニュー内表示かどうか
 * @returns レンダリングされるJSX要素
 */
const SiblingModeButton: React.FC<
  Pick<ModeToggleButtonProps, 'onExitSiblingMode' | 'setIsMenuOpen' | 'isMenu'>
> = ({ onExitSiblingMode, setIsMenuOpen, isMenu }) => (
  <motion.button
    whileHover={{ scale: 1.05, translateY: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      onExitSiblingMode?.();
      setIsMenuOpen(false);
    }}
    className={isMenu ? styles.menuItem : styles.settingsButton}
    aria-label="ひとりモードにもどす"
  >
    <User size={20} />
    {isMenu && <span>ひとりモード</span>}
  </motion.button>
);

/**
 * ふたりモードに切り替えるボタン
 * @param root0 プロパティオブジェクト
 * @param root0.onEnterSiblingMode ふたりモードへ切り替えるコールバック
 * @param root0.setIsMenuOpen メニューの開閉制御
 * @param root0.isMenu メニュー内表示かどうか
 * @returns レンダリングされるJSX要素
 */
const SoloModeButton: React.FC<
  Pick<ModeToggleButtonProps, 'onEnterSiblingMode' | 'setIsMenuOpen' | 'isMenu'>
> = ({ onEnterSiblingMode, setIsMenuOpen, isMenu }) => (
  <motion.button
    whileHover={{ scale: 1.05, translateY: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      onEnterSiblingMode?.();
      setIsMenuOpen(false);
    }}
    className={isMenu ? styles.menuItem : styles.settingsButton}
    aria-label="ふたりモードにきりかえる"
  >
    <Users size={24} />
    {isMenu && <span>ふたりモード</span>}
  </motion.button>
);

const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({
  isSiblingMode,
  onEnterSiblingMode,
  onExitSiblingMode,
  setIsMenuOpen,
  isMenu = false,
  isCompact = false,
}) => {
  // コンパクト表示時はふたりモードへの切り替えを禁止
  if (isCompact && !isSiblingMode) return null;

  if (isSiblingMode) {
    if (!onExitSiblingMode) return null;
    return (
      <SiblingModeButton
        onExitSiblingMode={onExitSiblingMode}
        setIsMenuOpen={setIsMenuOpen}
        isMenu={isMenu}
      />
    );
  }

  if (!onEnterSiblingMode) return null;
  return (
    <SoloModeButton
      onEnterSiblingMode={onEnterSiblingMode}
      setIsMenuOpen={setIsMenuOpen}
      isMenu={isMenu}
    />
  );
};

/**
 * ヘッダーのドロップダウンメニューのプロパティ
 */
interface HeaderMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  isSiblingMode: boolean;
  onEnterSiblingMode?: () => void;
  onExitSiblingMode?: () => void;
  setShowResetConfirm: (show: boolean) => void;
  handleEditSettings: () => void;
  isCompact?: boolean;
}

/**
 * ヘッダーのドロップダウンメニュー
 * @param root0 プロパティオブジェクト
 * @param root0.isMenuOpen メニューが開いているかどうか
 * @param root0.setIsMenuOpen メニューの開閉制御
 * @param root0.toggleMenu メニューボタン押下時の開閉ハンドラ
 * @param root0.isSiblingMode 2人モードかどうか
 * @param root0.onEnterSiblingMode 2人モードへ切り替えるコールバック
 * @param root0.onExitSiblingMode 1人モードへ切り替えるコールバック
 * @param root0.setShowResetConfirm リセット確認ダイアログの表示制御
 * @param root0.handleEditSettings 設定編集時のハンドラ
 * @param root0.isCompact コンパクト表示かどうか
 * @returns レンダリングされるJSX要素
 */
const HeaderMenu: React.FC<HeaderMenuProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  toggleMenu,
  isSiblingMode,
  onEnterSiblingMode,
  onExitSiblingMode,
  setShowResetConfirm,
  handleEditSettings,
  isCompact = false,
}) => {
  return (
    <div className={styles.menuContainer}>
      <motion.button
        whileHover={{ scale: 1.05, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className={`${styles.settingsButton} ${isMenuOpen ? styles.active : ''}`}
        aria-label="メニューをひらく"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={styles.menuDropdown}
          >
            <ModeToggleButton
              isSiblingMode={isSiblingMode}
              onEnterSiblingMode={onEnterSiblingMode}
              onExitSiblingMode={onExitSiblingMode}
              setIsMenuOpen={setIsMenuOpen}
              isMenu={true}
              isCompact={isCompact}
            />
            <button
              onClick={() => {
                setShowResetConfirm(true);
                setIsMenuOpen(false);
              }}
              className={styles.menuItem}
              aria-label="リセットする"
            >
              <RotateCcw size={20} />
              <span>さいしょから</span>
            </button>
            <button
              onClick={() => {
                handleEditSettings();
                setIsMenuOpen(false);
              }}
              className={styles.menuItem}
              aria-label="リストのせってい"
            >
              <Settings size={20} />
              <span>リストのせってい</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
