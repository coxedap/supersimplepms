import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidthClassName="max-w-md"
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 text-white ${
              danger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            {danger && <AlertTriangle className="w-4 h-4" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {danger && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        )}
        <p className="text-sm text-slate-600 font-medium leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};
