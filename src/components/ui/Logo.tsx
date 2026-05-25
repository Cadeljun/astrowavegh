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
 * This ensures that changing the logo in the CMS updates the entire site instantly.
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

  const logoWidth = variant === 'icon' 
    ? height 
    : height * 4.5;

  const content = (
    <Image
      src={logoSrc}
      alt="AstroWave Logo"
      width={logoWidth}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );

  if (!linkTo) return content;

  return (
    <Link href={linkTo} className="inline-flex items-center">
      {content}
    </Link>
  );
}
