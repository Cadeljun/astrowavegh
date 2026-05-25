'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import { cardHover } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { getPlaceholderById } from '@/app/lib/placeholder-images';

interface EventCardProps {
  name: string;
  category: string;
  date: string;
  venue: string;
  description: string;
  imageUrl: string;
  className?: string;
  aiHint?: string;
}

export default function EventCard({
  name,
  category,
  date,
  venue,
  description,
  imageUrl,
  className,
  aiHint
}: EventCardProps) {
  const { settings } = useCMSSettings();
  const defaultEvent = getPlaceholderById('default-event');
  const systemPlaceholder = settings?.defaultEventPoster || defaultEvent?.imageUrl || '';

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        'relative h-[320px] md:h-[480px] w-full rounded-lg overflow-hidden group border border-border',
        className
      )}
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0">
        <CloudinaryImage 
          src={imageUrl || systemPlaceholder} 
          alt={`${name} event in Accra Ghana by AstroWave`}
          fill
          className="transition-transform duration-700 group-hover:scale-105"
          transforms={{
            width: 800,
            height: 600,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          }}
          fallback={systemPlaceholder}
          aiHint={aiHint || defaultEvent?.imageHint}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20" />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-30">
        <div className="flex justify-start">
          <Badge variant="active" className="bg-gold text-black border-none">
            {category}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-display text-[2rem] md:text-[2.5rem] text-white leading-none">
              {name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-muted text-[0.85rem] font-body">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gold" />
                {date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gold" />
                {venue}
              </span>
            </div>
          </div>

          <p className="font-body text-[0.9rem] text-muted line-clamp-2 max-w-[400px]">
            {description}
          </p>

          <Link href="/contact">
            <Button variant="primary" size="sm" className="mt-2">
              Get Tickets
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
