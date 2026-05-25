'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { DEFAULT_SETTINGS } from '@/lib/cms/definitions';

interface LogoProps {
  variant?: 'default' | 'icon' | 'dark';
  height?: number;
  linkTo?: string;
  className?: string;
}

const AUTHORITATIVE_FALLBACK = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png';

/**
 * Standard AstroWave Logo component.
 * Dynamically resolves URLs from Cloud Firestore (cms_settings/global).
 * Ensures robust fallback to hardcoded brand URL to prevent display failure.
 */
export default function Logo({
  variant = 'default',
  height = 40,
  linkTo = '/',
  className = ''
}: LogoProps) {
  const { settings } = useCMSSettings();
  
  let logoSrc = '';
  
  // Resolve source with multiple levels of fallback
  if (variant === 'dark') {
    logoSrc = settings?.logoDarkUrl || DEFAULT_SETTINGS.logoDarkUrl;
  } else if (variant === 'icon') {
    logoSrc = settings?.logoIconUrl || DEFAULT_SETTINGS.logoIconUrl;
  } else {
    logoSrc = settings?.logoUrl || DEFAULT_SETTINGS.logoUrl;
  }
  
  // Final safety check to ensure logoSrc is never empty
  if (!logoSrc || logoSrc.trim() === '') {
    logoSrc = AUTHORITATIVE_FALLBACK;
  }

  return (
    <Link 
      href={linkTo || '/'} 
      className={`inline-flex items-center select-none ${!linkTo ? 'pointer-events-none' : ''}`}
    >
      <div 
        style={{ height: `${height}px`, width: 'auto' }} 
        className={`relative flex items-center ${className}`}
      >
        <img
          src={logoSrc}
          alt="AstroWave Logo"
          style={{ height: '100%', width: 'auto' }}
          className="object-contain block"
          onError={(e) => {
            // If the resolved URL fails to load, force the authoritative fallback
            const target = e.target as HTMLImageElement;
            if (target.src !== AUTHORITATIVE_FALLBACK) {
              target.src = AUTHORITATIVE_FALLBACK;
            }
          }}
        />
      </div>
    </Link>
  );
}
