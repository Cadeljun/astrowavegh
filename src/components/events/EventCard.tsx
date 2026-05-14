'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cardHover } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface EventCardProps {
  name: string;
  category: string;
  date: string;
  venue: string;
  description: string;
  imageUrl: string;
  className?: string;
}

export default function EventCard({
  name,
  category,
  date,
  venue,
  description,
  imageUrl,
  className
}: EventCardProps) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        'relative h-[320px] md:h-[480px] w-full rounded-[var(--radius-lg)] overflow-hidden group border border-[var(--color-border)]',
        className
      )}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
        <div className="flex justify-start">
          <Badge variant="active" className="bg-[var(--color-gold)] text-[var(--color-black)] border-none">
            {category}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-display text-[2rem] md:text-[2.5rem] text-white leading-none">
              {name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-[var(--color-muted)] text-[0.85rem] font-body">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--color-gold)]" />
                {date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--color-gold)]" />
                {venue}
              </span>
            </div>
          </div>

          <p className="font-body text-[0.9rem] text-[var(--color-muted)] line-clamp-2 max-w-[400px]">
            {description}
          </p>

          <Button variant="primary" size="sm" asChild className="mt-2">
            <Link href="/contact">Get Tickets</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
