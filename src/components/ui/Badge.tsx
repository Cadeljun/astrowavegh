import * as React from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface BadgeProps {
  variant: 'active' | 'coming-soon' | 'live' | 'free';
  children: React.ReactNode;
  className?: string;
  theme?: 'dark' | 'light';
}

const Badge = ({ variant, children, className, theme = 'dark' }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] rounded-full border transition-all';
  
  const variants = {
    active: theme === 'dark' 
      ? 'bg-green-bg-dark text-green border-green-border' 
      : 'bg-green-bg-light text-green-dark border-green-border',
    'coming-soon': theme === 'dark'
      ? 'bg-dark-card text-dark-muted border-dark-border'
      : 'bg-light-surface text-light-muted border-light-border',
    live: 'bg-green-bg-dark text-green border-green-border shadow-[0_0_12px_rgba(0,201,107,0.2)]',
    free: 'bg-cyan-bg-dark text-cyan border-cyan/20',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {variant === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green"></span>
        </span>
      )}
      {variant === 'coming-soon' && <Lock size={10} />}
      {children}
    </div>
  );
};

export { Badge };
