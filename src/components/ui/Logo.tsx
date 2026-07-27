'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Local logo assets
const LOGO_WHITE = '/logo/astrowave-logo.svg';
const LOGO_DARK = '/logo/astrowave-logo-dark.svg';
const LOGO_PNG = '/logo/astrowave-logo.png';

export default function Logo({ height = 40, className, linkTo = '/', variant = 'white' }: { 
  height?: number; 
  className?: string; 
  linkTo?: string;
  variant?: 'white' | 'dark';
}) {
  const logoSrc = variant === 'dark' ? LOGO_DARK : LOGO_WHITE;
  
  const content = (
    <div style={{ height: `${height}px` }} className={cn("relative flex items-center select-none flex-shrink-0", className)}>
      <img
        src={logoSrc}
        alt="AstroWave"
        style={{ height: '100%', width: 'auto' }}
        className="object-contain block"
        loading="eager"
        onError={(e) => {
          // Fallback to PNG if SVG fails
          const target = e.target as HTMLImageElement;
          if (target.src !== LOGO_PNG) {
            target.src = LOGO_PNG;
          }
        }}
      />
    </div>
  );

  if (!linkTo) return content;

  return (
    <Link href={linkTo} className="inline-flex items-center">
      {content}
    </Link>
  );
}
