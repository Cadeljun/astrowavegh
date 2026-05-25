'use client';

import Link from 'next/link';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { DEFAULT_SETTINGS } from '@/lib/cms/definitions';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'icon' | 'dark';
  height?: number;
  linkTo?: string;
  className?: string;
}

const AUTHORITATIVE_LOGO = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png';
const AUTHORITATIVE_ICON = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png';

/**
 * Robust Logo component for AstroWave.
 * Handles dynamic Firestore values with authoritative hardcoded fallbacks to prevent display failure.
 */
export default function Logo({
  variant = 'default',
  height = 40,
  linkTo = '/',
  className = ''
}: LogoProps) {
  const { settings } = useCMSSettings();
  
  let logoSrc = '';
  
  // Resolve source based on variant with layered fallbacks
  if (variant === 'icon') {
    logoSrc = settings?.logoIconUrl || DEFAULT_SETTINGS.logoIconUrl || AUTHORITATIVE_ICON;
  } else if (variant === 'dark') {
    logoSrc = settings?.logoDarkUrl || DEFAULT_SETTINGS.logoDarkUrl || AUTHORITATIVE_LOGO;
  } else {
    logoSrc = settings?.logoUrl || DEFAULT_SETTINGS.logoUrl || AUTHORITATIVE_LOGO;
  }
  
  // Final safety check
  if (!logoSrc || logoSrc.trim() === '') {
    logoSrc = variant === 'icon' ? AUTHORITATIVE_ICON : AUTHORITATIVE_LOGO;
  }

  const content = (
    <div 
      style={{ height: `${height}px`, width: 'auto' }} 
      className={cn("relative flex items-center select-none", className)}
    >
      <img
        src={logoSrc}
        alt="AstroWave"
        style={{ height: '100%', width: 'auto' }}
        className="object-contain block max-w-full"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          const fallback = variant === 'icon' ? AUTHORITATIVE_ICON : AUTHORITATIVE_LOGO;
          if (target.src !== fallback) {
            target.src = fallback;
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