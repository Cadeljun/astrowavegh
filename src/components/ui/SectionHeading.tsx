import * as React from 'react';
import { SectionLabel } from './SectionLabel';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

const SectionHeading = ({ label, title, subtitle, align = 'left', className }: SectionHeadingProps) => {
  return (
    <div className={cn(
      'flex flex-col mb-12',
      align === 'center' ? 'items-center text-center' : 'items-start text-start',
      className
    )}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2 className="display-lg mb-4">{title}</h2>
      {subtitle && <p className="body-lg text-[var(--color-muted)] max-w-2xl">{subtitle}</p>}
    </div>
  );
};

export { SectionHeading };
