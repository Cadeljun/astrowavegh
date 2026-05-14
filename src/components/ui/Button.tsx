'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-body font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'border border-[var(--color-gold)] text-[var(--color-gold)] bg-transparent hover:bg-[var(--color-gold)] hover:text-[var(--color-black)] hover:shadow-[0_0_20px_rgba(255,209,102,0.4)]',
      secondary: 'border border-[var(--color-white)] text-[var(--color-white)] bg-transparent hover:bg-[var(--color-white)] hover:text-[var(--color-black)]',
      ghost: 'border-none text-[var(--color-muted)] bg-transparent hover:text-[var(--color-gold)]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
