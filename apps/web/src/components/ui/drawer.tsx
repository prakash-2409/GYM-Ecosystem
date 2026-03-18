'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key closes drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Focus trap — return focus to panel on open
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      {/* Overlay — rgba(0,0,0,0.3) with 220ms fade */}
      <div
        className="drawer-overlay absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — 480px desktop, 100vw mobile, slide from right 220ms */}
      <div
        ref={panelRef}
        className="drawer-panel"
        tabIndex={-1}
      >
        {/* Header — 24px padding, title left, X right, border-bottom */}
        <div className="drawer-header">
          <h2 className="text-section-heading text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-btn',
              'text-text-muted hover:text-text-primary hover:bg-divider',
              'transition-colors duration-normal'
            )}
            aria-label="Close drawer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body — 24px padding, scrollable */}
        <div className="drawer-body">
          {children}
        </div>

        {/* Footer — 24px padding, border-top, right-aligned actions */}
        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
