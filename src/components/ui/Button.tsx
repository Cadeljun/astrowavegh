'use client';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-green text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,255,135,0.4)]',
        secondary: 'border border-blue text-blue hover:bg-blue hover:text-white',
        outline: 'border border-white/10 text-white hover:bg-white/5',
        ghost: 'text-muted hover:text-white',
        link: 'text-green underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-4',
        md: 'h-12 px-6',
        lg: 'h-14 px-10 text-sm',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };