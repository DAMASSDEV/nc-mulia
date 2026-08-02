import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface-secondary text-foreground-muted border-border',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-information-soft text-information border-information/20',
  neutral: 'bg-surface-secondary text-foreground-muted border-border',
  primary: 'bg-brand-primary-soft text-brand-primary border-brand-primary/20',
};

export function Badge({ variant = 'default', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'info' && 'bg-information',
            variant === 'neutral' && 'bg-foreground-muted',
            variant === 'primary' && 'bg-brand-primary',
            variant === 'default' && 'bg-foreground-subtle',
          ].join(' ')}
        />
      )}
      {children}
    </span>
  );
}
