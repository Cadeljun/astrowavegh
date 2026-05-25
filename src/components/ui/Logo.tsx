'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { DEFAULT_SETTINGS } from '@/lib/cms/definitions';

interface LogoProps {
  variant?: 'default' | 'icon' | 'dark';
  height?: number;
  linkTo?: string;
  className?: string;
}

/**
 * Standard AstroWave Logo component.
 * Dynamically resolves URLs from Cloud Firestore (cms_settings/global).
 * Uses aspect-ratio preservation to prevent squishing when logos vary.
 */
export default function Logo({
  variant = 'default',
  height = 40,
  linkTo = '/',
  className = ''
}: LogoProps) {
  const { settings } = useCMSSettings();
  
  let logoSrc = '';
  
  if (variant === 'dark') {
    logoSrc = settings?.logoDarkUrl || DEFAULT_SETTINGS.logoDarkUrl;
  } else if (variant === 'icon') {
    logoSrc = settings?.logoIconUrl || DEFAULT_SETTINGS.logoIconUrl;
  } else {
    logoSrc = settings?.logoUrl || DEFAULT_SETTINGS.logoUrl;
  }
  
  // Fallback to static brand URL if both setting and default fail (safety)
  if (!logoSrc) {
    logoSrc = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png';
  }

  // We use style with height and width auto to preserve aspect ratio regardless of logo dimensions
  return (
    <Link 
      href={linkTo || '/'} 
      className={`inline-flex items-center select-none ${!linkTo ? 'pointer-events-none' : ''}`}
    >
      <div 
        style={{ height: `${height}px` }} 
        className={`relative flex items-center ${className}`}
      >
        <img
          src={logoSrc}
          alt="AstroWave Logo"
          style={{ height: '100%', width: 'auto' }}
          className="object-contain"
        />
      </div>
    </Link>
  );
}
