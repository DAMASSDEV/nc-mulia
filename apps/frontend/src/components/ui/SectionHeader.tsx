import type { ReactNode } from 'react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  centered?: boolean;
}

export function SectionHeader({ badge, title, description, action, centered = false }: SectionHeaderProps) {
  return (
    <div className={['mb-10', centered ? 'text-center' : ''].join(' ')}>
      {badge && (
        <span className="inline-block text-xs font-semibold tracking-widest text-brand-primary uppercase mb-3">
          {badge}
        </span>
      )}
      <h2 className={['text-3xl md:text-4xl font-bold text-foreground tracking-tight', centered ? 'mx-auto' : ''].join(' ')}>
        {title}
      </h2>
      {description && (
        <p className={['text-foreground-muted mt-3 leading-relaxed max-w-xl', centered && 'mx-auto'].join(' ')}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
