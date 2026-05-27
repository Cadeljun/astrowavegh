'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  theme?: 'dark' | 'light';
  accentColor?: 'green' | 'blue' | 'cyan';
  noHover?: boolean;
}

const Card = ({ children, className, theme = 'dark', accentColor, noHover = false }: CardProps) => {
  const accentStyles = {
    green: {
      dark: 'hover:border-green hover:shadow-[0_0_24px_rgba(0,201,107,0.2)]',
      light: 'hover:border-green hover:shadow-green',
    },
    blue: {
      dark: 'hover:border-blue hover:shadow-[0_0_24px_rgba(5,130,255,0.2)]',
      light: 'hover:border-blue hover:shadow-blue',
    },
    cyan: {
      dark: 'hover:border-cyan hover:shadow-[0_0_24px_rgba(0,212,255,0.15)]',
      light: 'hover:border-cyan hover:shadow-[0_4px_20px_rgba(0,212,255,0.15)]',
    }
  };

  const baseClass = theme === 'dark' ? 'card-dark' : 'card-light';
  const hoverClass = accentColor ? accentStyles[accentColor][theme] : '';

  return (
    <div
      className={cn(
        baseClass,
        !noHover && hoverClass,
        className
      )}
    >
      {children}
    </div>
  );
};

export { Card };
