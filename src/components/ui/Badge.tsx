import * as React from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface BadgeProps {
  variant: 'active' | 'coming-soon' | 'live' | 'free';
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant, children, className }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full border';
  
  const variants = {
    active: 'bg-gold-dim text-gold border-gold',
    'coming-soon': 'bg-surface text-muted border-border',
    live: 'bg-red-500/10 text-red-500 border-red-500/30',
    free: 'bg-cyan-dim text-cyan border-cyan',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {variant === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {variant === 'coming-soon' && <Lock size={10} />}
      {children}
    </div>
  );
};

export { Badge };
