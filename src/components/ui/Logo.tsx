'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Local logo assets - AWE text only, no wave icon
const LOGO_WHITE = '/logo/astrowave-logo.svg';
const LOGO_DARK = '/logo/astrowave-logo-dark.svg';
const LOGO_PNG_WHITE = '/logo/astrowave-logo.png';
const LOGO_PNG_DARK = '/logo/astrowave-logo-dark.png';

export default function Logo({ height = 40, className, linkTo = '/', variant = 'white' }: { 
  height?: number; 
  className?: string; 
  linkTo?: string;
  variant?: 'white' | 'dark';
}) {
  const logoSrc = variant === 'dark' ? LOGO_DARK : LOGO_WHITE;
  const fallbackSrc = variant === 'dark' ? LOGO_PNG_DARK : LOGO_PNG_WHITE;
  
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
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
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
