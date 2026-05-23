'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/animations';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'green' | 'blue' | 'sky' | 'muted';
}

const Card = ({ children, className, glowColor = 'green' }: CardProps) => {
  const glows = {
    green: 'hover:border-green hover:shadow-[0_0_20px_rgba(0,255,135,0.2)]',
    blue: 'hover:border-blue hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]',
    sky: 'hover:border-sky hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]',
    muted: 'hover:border-dark',
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        'glass transition-all duration-[var(--transition-base)] overflow-hidden',
        glows[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export { Card };
