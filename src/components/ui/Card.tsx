'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  theme?: 'dark' | 'light';
  accentColor?: 'green' | 'blue' | 'cyan';
  glowColor?: string;
  noHover?: boolean;
}

const Card = ({ children, className, theme = 'dark', accentColor, glowColor, noHover = false, ...props }: CardProps) => {
  const accentStyles = {
    green: 'hover:border-green hover:shadow-[0_0_24px_rgba(0,201,107,0.2)]',
    blue: 'hover:border-blue hover:shadow-[0_0_24px_rgba(5,130,255,0.2)]',
    cyan: 'hover:border-cyan hover:shadow-[0_0_24px_rgba(0,212,255,0.15)]',
  };

  const baseClass = theme === 'dark' ? 'card-dark' : 'card-light';
  const hoverClass = accentColor ? accentStyles[accentColor] : '';
  const glowClass = glowColor ? `glow-${glowColor}` : '';

  return (
    <div {...props} className={cn(baseClass, !noHover && hoverClass, glowClass, className)}>
      {children}
    </div>
  );
};

export { Card };
