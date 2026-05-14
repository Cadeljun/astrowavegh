'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/animations';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'gold' | 'purple' | 'cyan';
}

const Card = ({ children, className, glowColor = 'gold' }: CardProps) => {
  const glows = {
    gold: 'hover:border-[var(--color-gold)] hover:shadow-[0_0_20px_rgba(255,209,102,0.2)]',
    purple: 'hover:border-[var(--color-purple)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    cyan: 'hover:border-[var(--color-cyan)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
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
