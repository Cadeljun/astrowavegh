'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const baseStyles = [
  'inline-flex items-center justify-center gap-2',
  'font-body font-semibold uppercase',
  'tracking-widest cursor-pointer',
  'border transition-all duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'focus:outline-none focus:ring-2',
  'focus:ring-offset-2 focus:ring-offset-black',
].join(' ');

const variants = {
  primary: [
    'border-[var(--color-green)]',
    'text-[var(--color-green)]',
    'bg-transparent',
    'hover:bg-[var(--color-green)]',
    'hover:text-[var(--color-black)]',
    'focus:ring-[var(--color-green)]',
    'hover:shadow-[var(--glow-green)]',
  ].join(' '),

  secondary: [
    'border-[var(--color-white)]',
    'text-[var(--color-white)]',
    'bg-transparent',
    'hover:bg-[var(--color-white)]',
    'hover:text-[var(--color-black)]',
    'focus:ring-[var(--color-white)]',
  ].join(' '),

  ghost: [
    'border-transparent',
    'text-[var(--color-muted)]',
    'bg-transparent',
    'hover:text-[var(--color-green)]',
    'focus:ring-[var(--color-green)]',
  ].join(' '),
};

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-[var(--radius-sm)]',
  md: 'px-6 py-3 text-sm rounded-[var(--radius-sm)]',
  lg: 'px-8 py-4 text-base rounded-[var(--radius-sm)]',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
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
        className={[baseStyles, variants[variant], sizes[size], className].join(' ')}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {children}
            {icon && <span className="transition-transform group-hover:translate-x-1">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
