import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, action, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft flex items-center justify-center text-brand-primary flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          {badge && (
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-primary uppercase mb-2">
              {badge}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-foreground-muted mt-2 leading-relaxed max-w-xl">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
