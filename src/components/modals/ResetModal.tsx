/**
 * タイマーのリセットを確認するためのモーダルダイアログコンポーネント
 */
import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { ConfirmModal } from './ConfirmModal';

/**
 * ResetModalのプロパティ
 */
interface ResetModalProps {
  onCancel: () => void; // キャンセル時のコールバック
  onConfirm: () => void; // 確定時のコールバック
}

/**
 * リセット確認モーダルコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.onCancel キャンセル時のコールバック
 * @param root0.onConfirm 確定時のコールバック
 * @returns レンダリングされるJSX要素
 */
export const ResetModal: React.FC<ResetModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <ConfirmModal
      title="さいしょから やりなおしますか？"
      cancelText="やらない"
      confirmText="やりなおす"
      confirmStyle="danger"
      icon={<AlertTriangle size={48} />}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
};
