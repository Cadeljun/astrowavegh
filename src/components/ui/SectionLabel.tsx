import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  theme?: 'dark' | 'light';
}

const SectionLabel = ({ children, className, theme = 'dark' }: SectionLabelProps) => {
  const baseClass = theme === 'dark' ? 'section-label-dark' : 'section-label-light';
  
  return (
    <div className={cn(baseClass, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-green inline-block shadow-[0_0_8px_rgba(0,201,107,0.6)]" />
      {children}
    </div>
  );
};

export { SectionLabel };
