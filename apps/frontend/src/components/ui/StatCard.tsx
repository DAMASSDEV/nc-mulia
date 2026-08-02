import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, accent = false, className = '' }: StatCardProps) {
  return (
    <div
      className={[
        'bg-surface rounded-2xl border border-border p-5 flex flex-col gap-3',
        accent && 'bg-brand-primary-soft border-brand-primary/20',
        className,
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className={['text-sm font-medium', accent ? 'text-brand-primary' : 'text-foreground-muted'].join(' ')}>
          {label}
        </span>
        <div className={['w-9 h-9 rounded-xl flex items-center justify-center', accent ? 'bg-brand-primary text-white' : 'bg-surface-secondary text-foreground-muted'].join(' ')}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className={['text-3xl font-bold', accent ? 'text-brand-primary' : 'text-foreground'].join(' ')}>
          {value}
        </span>
        {trend && (
          <span className={['text-sm font-medium pb-1', trend.positive ? 'text-success' : 'text-danger'].join(' ')}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
