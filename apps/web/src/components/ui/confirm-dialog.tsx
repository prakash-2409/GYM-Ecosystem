'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      {/* Overlay — rgba(0,0,0,0.4), blur 4px, 180ms fade */}
      <div
        className="modal-overlay !z-auto !relative !fixed !inset-0"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 70,
        }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel — max 400px, 16px radius, 24px padding, scale+fade 180ms */}
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                'shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                destructive ? 'bg-danger-bg' : 'bg-warning-bg'
              )}
            >
              <AlertTriangle
                size={20}
                strokeWidth={1.5}
                className={destructive ? 'text-danger' : 'text-warning'}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-card-heading text-text-primary">{title}</h3>
              <p className="text-body text-text-secondary mt-1">{message}</p>
            </div>
          </div>

          {/* Actions — right-aligned */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'btn',
                destructive
                  ? 'btn-danger'
                  : 'btn-primary'
              )}
            >
              {loading && (
                <span className="btn-spinner" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
