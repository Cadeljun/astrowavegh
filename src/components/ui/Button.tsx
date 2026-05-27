'use client';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-semibold uppercase tracking-[0.06em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-green text-white shadow-green hover:bg-green-light hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,201,107,0.4)]',
        secondary: 'bg-blue text-white shadow-blue hover:bg-blue-light hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(5,130,255,0.4)]',
        'outline-dark': 'bg-transparent border-1.5 border-dark-border text-dark-text hover:border-green hover:text-green hover:bg-green-bg-dark',
        'outline-light': 'bg-transparent border-1.5 border-light-border text-light-text hover:border-green hover:text-green-dark hover:bg-green-bg-light',
        ghost: 'bg-transparent border-none text-inherit hover:text-green',
        link: 'text-green underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-4 text-[0.8rem]',
        md: 'h-12 px-6 text-[0.875rem]',
        lg: 'h-14 px-10 text-[1rem]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
