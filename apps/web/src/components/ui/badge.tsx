import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'fee-due'
  | 'paid'
  | 'overdue'
  | 'coach'
  | 'receptionist'
  | 'info'
  | 'default';

const variantClasses: Record<BadgeVariant, string> = {
  active:       'badge-active',
  expiring:     'badge-expiring',
  expired:      'badge-expired',
  'fee-due':    'badge-fee-due',
  paid:         'badge-paid',
  overdue:      'badge-overdue',
  coach:        'badge-coach',
  receptionist: 'badge-receptionist',
  info:         'bg-info-bg text-info',
  default:      'bg-divider text-text-secondary',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
