import * as React from 'react';
import { SectionLabel } from './SectionLabel';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  theme?: 'dark' | 'light';
  gradient?: boolean;
}

const SectionHeading = ({ 
  label, 
  title, 
  subtitle, 
  align = 'left', 
  className, 
  theme = 'dark',
  gradient = false
}: SectionHeadingProps) => {
  return (
    <div className={cn(
      'flex flex-col',
      align === 'center' ? 'items-center text-center' : 'items-start text-start',
      className
    )}>
      {label && <SectionLabel theme={theme} className="mb-6">{label}</SectionLabel>}
      <h2 className={cn(
        "display-lg mb-4",
        gradient && "text-gradient"
      )}
      style={{ 
        color: !gradient ? (theme === 'dark' ? 'var(--dark-text)' : 'var(--light-text)') : undefined
      }}>
        {title}
      </h2>
      {subtitle && (
        <p className="body-lg max-w-2xl"
          style={{
            color: theme === 'dark' ? 'var(--dark-subtext)' : 'var(--light-subtext)'
          }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export { SectionHeading };