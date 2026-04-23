'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Check, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  dismissing?: boolean;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 3000ms with slide-out animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
      );
      // Remove from DOM after slide-out animation (300ms)
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — bottom-right, 340px, z-100 */}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Re-export for layout mounting convenience
export function Toaster() {
  return null;
}

const iconMap: Record<ToastType, typeof Check> = {
  success: Check,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastTypeClass: Record<ToastType, string> = {
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info',
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = iconMap[t.type];

  return (
    <div
      className={cn(
        'toast',
        toastTypeClass[t.type],
        t.dismissing && 'toast-dismiss'
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon size={16} strokeWidth={1.5} className={iconColorMap[t.type]} />
      <p className="text-body text-text-primary font-medium flex-1">{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-text-muted hover:text-text-primary transition-colors duration-fast flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
