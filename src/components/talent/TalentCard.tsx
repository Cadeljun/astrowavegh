'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Music, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cardHover } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface TalentCardProps {
  name: string;
  role: 'DJ' | 'Artist';
  bio: string;
  imageUrl: string;
  className?: string;
}

export default function TalentCard({
  name,
  role,
  bio,
  imageUrl,
  className
}: TalentCardProps) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        'glass group border-[var(--color-border)] p-4 transition-all duration-300',
        role === 'DJ' ? 'hover:border-[var(--color-purple)]' : 'hover:border-[var(--color-gold)]',
        className
      )}
    >
      <div className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden mb-6">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute bottom-4 left-4">
          <Badge variant="active" className={cn(
            role === 'DJ' ? 'bg-[var(--color-purple-dim)] text-[var(--color-purple)] border-[var(--color-purple)]' : 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border-[var(--color-gold)]'
          )}>
            {role}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 px-2">
        <h3 className="font-display text-[1.8rem] text-white leading-tight uppercase tracking-wide">
          {name}
        </h3>
        <p className="font-body text-[0.85rem] text-[var(--color-muted)] leading-relaxed line-clamp-2">
          {bio}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <a href="#" className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors">
            <Instagram size={18} />
          </a>
          <a href="#" className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors">
            <Music size={18} />
          </a>
          <a href="#" className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors">
            <Youtube size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}