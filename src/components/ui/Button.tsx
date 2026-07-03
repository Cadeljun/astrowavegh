'use client';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold uppercase tracking-[0.12em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:       'bg-gradient-to-r from-[#00C853] to-[#0EA5E9] text-white shadow-glow-green hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,200,83,0.4)]',
        secondary:     'bg-[#0EA5E9] text-white hover:bg-[#38BDF8] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(14,165,233,0.4)]',
        'outline-dark':'bg-transparent border-2 border-[#C8E6D4] text-[#2A4434] hover:border-[#00C853] hover:text-[#00C853] hover:bg-[#00C853]/5',
        'outline-light':'bg-transparent border-2 border-[#C8E6D4] text-[#2A4434] hover:border-[#00C853] hover:text-[#00C853]',
        ghost:         'bg-transparent border-none text-[#00C853] hover:bg-[#00C853]/8',
        link:          'text-[#00C853] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-10 px-4 text-[0.75rem]',
        md:   'h-12 px-6 text-[0.85rem]',
        lg:   'h-14 px-10 text-[1rem]',
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
          <><Loader2 className="animate-spin h-4 w-4" /><span>Loading...</span></>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
