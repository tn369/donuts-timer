import React from 'react';

interface ResetModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title">すべてをリセットしてもいいですか？</div>
        <div className="modal-actions">
          <button className="btn-modal btn-cancel" onClick={onCancel}>
            やめる
          </button>
          <button className="btn-modal btn-confirm-reset" onClick={onConfirm}>
            リセットする
          </button>
        </div>
      </div>
    </div>
  );
};
