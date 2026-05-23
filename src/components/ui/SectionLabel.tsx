import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

const SectionLabel = ({ children, className }: SectionLabelProps) => {
  return (
    <div className={cn('flex items-center gap-3 label mb-4 text-[var(--color-green)]', className)}>
      <span className="h-[1px] w-12 bg-[var(--color-green)] shadow-[0_0_10px_var(--color-green)]"></span>
      {children}
    </div>
  );
};

export { SectionLabel };
