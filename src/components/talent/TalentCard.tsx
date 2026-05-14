'use client';

import React from 'react';
import Image from 'next/image';
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
  const roleStyles = {
    DJ: {
      badge: 'bg-purple-dim text-purple border-purple',
      hoverBorder: 'hover:border-purple',
    },
    Artist: {
      badge: 'bg-gold-dim text-gold border-gold',
      hoverBorder: 'hover:border-gold',
    }
  };

  const currentStyle = roleStyles[role];

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        'glass group border-border-dark p-4 transition-all duration-300',
        currentStyle.hoverBorder,
        className
      )}
    >
      <div className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden mb-6">
        <Image 
          src={imageUrl} 
          alt={name}
          fill
          className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute bottom-4 left-4">
          <Badge variant="active" className={currentStyle.badge}>
            {role}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 px-2">
        <h3 className="font-display text-[1.8rem] text-white leading-tight uppercase tracking-wide">
          {name}
        </h3>
        <p className="font-body text-[0.85rem] text-muted leading-relaxed line-clamp-2">
          {bio}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <a href="#" className="text-muted hover:text-gold transition-colors">
            <Instagram size={18} />
          </a>
          <a href="#" className="text-muted hover:text-gold transition-colors">
            <Music size={18} />
          </a>
          <a href="#" className="text-muted hover:text-gold transition-colors">
            <Youtube size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
