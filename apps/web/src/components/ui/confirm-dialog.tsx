'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, destructive }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-surface rounded-card border border-border shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${destructive ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle size={20} className={destructive ? 'text-red-600' : 'text-yellow-600'} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="h-9 px-4 text-sm font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`h-9 px-4 text-sm font-medium rounded-btn text-white transition-colors duration-150 ${
              destructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-primary hover:opacity-90 active:opacity-80'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
