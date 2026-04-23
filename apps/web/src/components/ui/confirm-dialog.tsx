'use client';

import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Primary description text — use either `message` or `description` */
  message?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** @deprecated use `variant="danger"` */
  destructive?: boolean;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  /** Optional slot for extra content (inputs, etc.) between description and buttons */
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  destructive = false,
  variant,
  loading = false,
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  // Normalise: `variant` takes priority, fall back to `destructive` boolean
  const resolvedVariant = variant ?? (destructive ? 'danger' : 'default');
  const isDanger = resolvedVariant === 'danger';
  const isWarning = resolvedVariant === 'warning';

  // Support both `message` and `description` props
  const bodyText = description || message;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      {/* Overlay — rgba(0,0,0,0.4), blur 4px, 180ms fade */}
      <div
        className="fixed inset-0 z-[70]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
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
                isDanger ? 'bg-danger-bg' : isWarning ? 'bg-warning-bg' : 'bg-primary/10'
              )}
            >
              <AlertTriangle
                size={20}
                strokeWidth={1.5}
                className={isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-primary'}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-card-heading text-text-primary">{title}</h3>
              {bodyText && <p className="text-body text-text-secondary mt-1">{bodyText}</p>}
            </div>
          </div>

          {/* Optional children slot (e.g. input fields) */}
          {children && <div className="mt-4">{children}</div>}

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
                isDanger
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
