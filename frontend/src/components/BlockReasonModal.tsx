import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Ban } from 'lucide-react';

interface BlockReasonModalProps {
  isOpen: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const BlockReasonModal: React.FC<BlockReasonModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Block Task"
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
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Block Task
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500 font-medium">
          Describe what is blocking this task from progressing.
        </p>
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Blocker Reason *
          </label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && reason.trim()) { e.preventDefault(); handleConfirm(); } }}
            placeholder="e.g. Waiting for API credentials from the client..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
