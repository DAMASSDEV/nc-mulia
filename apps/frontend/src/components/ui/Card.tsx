import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: CSSProperties;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md', hover = false, style }: CardProps) {
  return (
    <div
      className={[
        'bg-surface rounded-2xl border border-border shadow-sm',
        hover && 'transition-shadow duration-200 hover:shadow-md',
        paddingClasses[padding],
        className,
      ].join(' ')}
      style={style}
    >
      {children}
    </div>
  );
}
