import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {/* Icon — 64px, muted color */}
      <div className="empty-state-icon">
        <Icon size={64} strokeWidth={1.5} />
      </div>

      {/* Title — 16px, weight 500 */}
      <h3 className="empty-state-title">{title}</h3>

      {/* Description — 14px, secondary color */}
      <p className="empty-state-description">{description}</p>

      {/* CTA — if applicable */}
      {action && <div>{action}</div>}
    </div>
  );
}
