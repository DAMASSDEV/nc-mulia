import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-active disabled:bg-brand-primary/40 disabled:cursor-not-allowed',
  secondary:
    'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary-soft active:bg-brand-primary-soft/70 disabled:border-brand-primary/40 disabled:text-brand-primary/40 disabled:cursor-not-allowed',
  ghost:
    'text-brand-primary hover:bg-brand-primary-soft active:bg-brand-primary-soft/70 disabled:text-brand-primary/40 disabled:cursor-not-allowed',
  danger:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/80 disabled:bg-danger/40 disabled:cursor-not-allowed',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-4 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-7 py-3.5 rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <>
            <span className="loading-spinner w-4 h-4" />
            Memproses...
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
